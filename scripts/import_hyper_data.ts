import fs from 'fs';
import path from 'path';
import csv from 'csv-parser';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('Error: NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set in .env.local');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Helper to parse Excel Serial Dates (e.g., 29002 -> 1979-05-27)
function parseExcelDate(serial: number): Date | null {
    if (!serial || isNaN(serial)) return null;
    // Excel base date is 1899-12-30
    const utc_days = Math.floor(serial - 25569);
    const utc_value = utc_days * 86400;
    const date_info = new Date(utc_value * 1000);

    const fractional_day = serial - Math.floor(serial) + 0.0000001;
    const total_seconds = Math.floor(86400 * fractional_day);
    const seconds = total_seconds % 60;
    const hours = Math.floor((total_seconds - seconds) / (60 * 60));
    const minutes = Math.floor(total_seconds / 60) % 60;

    return new Date(date_info.getFullYear(), date_info.getMonth(), date_info.getDate(), hours, minutes, seconds);
}

// Helper to parse Dates (ISO, DMY, MDY, Excel Serial)
function parseDate(dateStr: string | number): Date | null {
    if (!dateStr) return null;

    // Try Excel Serial
    if (typeof dateStr === 'number' || (!isNaN(Number(dateStr)) && Number(dateStr) > 20000 && Number(dateStr) < 60000)) {
        return parseExcelDate(Number(dateStr));
    }

    const str = String(dateStr).trim();

    // Try YYYY-MM-DD
    if (/^\d{4}-\d{2}-\d{2}/.test(str)) {
        return new Date(str);
    }

    // Try DD/MM/YYYY
    if (/^\d{2}\/\d{2}\/\d{4}/.test(str)) {
        const [day, month, year] = str.split('/').map(Number);
        return new Date(year, month - 1, day);
    }

    // Try ISO with Time
    const isoDate = new Date(str);
    if (!isNaN(isoDate.getTime())) return isoDate;

    return null;
}

// Helper to format Date for Supabase (YYYY-MM-DD)
function formatDateForDB(date: Date | null): string | null {
    if (!date || isNaN(date.getTime())) return null;
    return date.toISOString().split('T')[0];
}

// Helper to normalize Names (English)
function normalizeName(name: string): string {
    if (!name) return '';
    // If predominantly Arabic, return empty string for EN field
    if (/[\u0600-\u06FF]/.test(name)) return '';
    return name.trim().toUpperCase()
        .replace(/\s+/g, ' ') // Collapse spaces
        .replace(/[^A-Z ]/g, ''); // Remove special chars
}

// Helper to clean Arabic Names
function cleanArabicName(name: string): string {
    if (!name) return '';
    // Only keep Arabic chars and spaces
    return name.trim().replace(/[^\u0600-\u06FF ]/g, '').replace(/\s+/g, ' ');
}

async function processCSV(filePath: string): Promise<any[]> {
    const results: any[] = [];
    return new Promise((resolve, reject) => {
        fs.createReadStream(filePath)
            .pipe(csv())
            .on('data', (data) => results.push(data))
            .on('end', () => resolve(results))
            .on('error', (err) => reject(err));
    });
}

async function importData() {
    console.log('--- Starting Hyper Digital Profile Import ---');

    const csvDir = path.join(process.cwd(), 'CSV');

    // 1. Read CSV Files
    console.log('Reading CSV files...');
    const gosiData = await processCSV(path.join(csvDir, 'chtgp-Gosi.csv'));
    const mudadData = await processCSV(path.join(csvDir, 'chtgp-Mudad.csv'));
    const muqeemData = await processCSV(path.join(csvDir, 'chtgp-Muqeem.csv'));
    const qiwaData = await processCSV(path.join(csvDir, 'chtgp-Qiwa.csv'));

    console.log(`Loaded: GOSI(${gosiData.length}), Mudad(${mudadData.length}), Muqeem(${muqeemData.length}), Qiwa(${qiwaData.length})`);

    // 2. Identify Unique Employees (from Identity Number)
    const identities = new Set<string>();

    muqeemData.forEach((row: any) => row['Iqama Number'] && identities.add(String(row['Iqama Number']).trim()));
    gosiData.forEach((row: any) => row['IDENTIFIER'] && identities.add(String(row['IDENTIFIER']).trim()));
    qiwaData.forEach((row: any) => row['Employee ID'] && identities.add(String(row['Employee ID']).trim()));
    mudadData.forEach((row: any) => row['ID'] && identities.add(String(row['ID']).trim()));

    console.log(`Found ${identities.size} unique employees to import/update.`);

    let successCount = 0;
    let errorCount = 0;

    let processed = 0;
    // Limit to first 5 for test
    // for (const identity of identities) {
    // for (const identity of Array.from(identities).slice(0, 5)) {
    for (const identity of identities) {
        processed++;
        if (processed % 10 === 0) console.log(`Processing ${processed}/${identities.size}...`);
        try {
            // Find matching record in each dataset
            const muqeem = muqeemData.find((r: any) => String(r['Iqama Number']).trim() === identity);
            const gosi = gosiData.find((r: any) => String(r['IDENTIFIER']).trim() === identity);
            const qiwa = qiwaData.find((r: any) => String(r['Employee ID']).trim() === identity);
            const mudad = mudadData.find((r: any) => String(r['ID']).trim() === identity);

            // --- 3. Construct Unified Profile (Employees Table) ---

            // Name: Prefer Muqeem (official English) > GOSI > Mudad > Qiwa (if English)
            const fullNameEn = normalizeName(muqeem?.['Name']) || normalizeName(gosi?.['CONTRIBUTOR NAME']) || normalizeName(mudad?.['Name']) || normalizeName(qiwa?.['Employee name']);

            // Arabic Name: Prefer Qiwa (Employee name) > GOSI (CONTRIBUTOR NAME AR)
            let qiwaName = qiwa?.['Employee name'] || '';
            const fullNameAr = cleanArabicName(qiwaName);

            // Nationality
            const nationality = muqeem?.['Nationality'] || qiwa?.['Nationality'] || gosi?.['NATIONALITY'] || '';

            // DOB
            const dobRaw = muqeem?.['Birth Date'] || qiwa?.['Date of birth'] || gosi?.['DATE OF BIRTH'];
            const dob = formatDateForDB(parseDate(dobRaw));

            // Position
            const position = qiwa?.['Occupation'] || muqeem?.['Occupation'] || gosi?.['OCCUPATIONENG'];

            // Phone/Email
            const phone = qiwa?.['Mobile Number'];
            const email = qiwa?.['EMAIL'];

            // Salary (Qiwa Priority)
            const qiwaSalary = parseFloat(qiwa?.['Salary Amount'] || qiwa?.['Wage'] || '0');
            const gosiWage = parseFloat(gosi?.['TOTAL WAGE'] || '0');
            const mudadSalary = parseFloat(mudad?.['Salary'] || '0');

            const bestSalary = qiwaSalary > 0 ? qiwaSalary : (gosiWage > 0 ? gosiWage : mudadSalary);

            // Upsert to Employees Table
            const { data: empData, error: empError } = await supabase
                .from('employees')
                .upsert({
                    identity_number: identity,
                    full_name_en: fullNameEn,
                    arabic_name: fullNameAr,
                    first_name: fullNameEn.split(' ')[0],
                    last_name: fullNameEn.split(' ').slice(1).join(' '),
                    nationality: nationality,
                    birth_date: dob,
                    position: position,
                    phone_number: phone ? String(phone) : null,
                    salary: bestSalary,
                    email: email,
                    gender: muqeem?.['Gender'] || qiwa?.['Gender'] || gosi?.['GENDER'],
                    updated_at: new Date().toISOString()
                }, { onConflict: 'identity_number' })
                .select()
                .single();

            if (empError) {
                console.error(`Error upserting employee ${identity}:`, empError);
                errorCount++;
                continue;
            }

            const employeeId = empData.id;

            // --- 4. Update Compliance Profile ---
            const iqamaExpiry = formatDateForDB(parseDate(muqeem?.['Iqama Expiry Date']));
            const passportExpiry = formatDateForDB(parseDate(muqeem?.['Passport Expiry Date']));

            const { error: compError } = await supabase
                .from('employee_compliance')
                .upsert({
                    employee_id: employeeId,
                    iqama_number: identity,
                    iqama_expiry_gregorian: iqamaExpiry,
                    iqama_expiry_hijri: muqeem?.['Hijri Iqama Expiry Date'],
                    passport_number: muqeem?.['Passport Number'],
                    passport_expiry_date: passportExpiry,
                    contract_status: qiwa?.['Notes'],
                    occupation_on_iqama: muqeem?.['Occupation'],
                    border_number: muqeem?.['Border Number'],
                    updated_at: new Date().toISOString()
                }, { onConflict: 'employee_id' });

            // --- 5. Update Financial Profile ---
            const basicWage = parseFloat(gosi?.['BASICWAGE'] || '0');
            const housing = parseFloat(gosi?.['HOUSING'] || '0');
            const totalGosi = parseFloat(gosi?.['TOTAL WAGE'] || '0');
            const iban = mudad?.['IBAN'] || qiwa?.['IBAN'];

            const { error: finError } = await supabase
                .from('employee_financials')
                .upsert({
                    employee_id: employeeId,
                    basic_salary: basicWage,
                    housing_allowance: housing,
                    total_gosi_salary: totalGosi,
                    contract_total_salary: bestSalary,
                    iban: iban,
                    updated_at: new Date().toISOString()
                }, { onConflict: 'employee_id' });

            // --- 6. Save Snapshots ---
            if (muqeem) await supabase.from('portal_data_snapshots').insert({ employee_id: employeeId, portal_source: 'MUQEEM', raw_data: muqeem, sync_date: new Date().toISOString() });
            if (gosi) await supabase.from('portal_data_snapshots').insert({ employee_id: employeeId, portal_source: 'GOSI', raw_data: gosi, sync_date: new Date().toISOString() });
            if (mudad) await supabase.from('portal_data_snapshots').insert({ employee_id: employeeId, portal_source: 'MUDAD', raw_data: mudad, sync_date: new Date().toISOString() });
            if (qiwa) await supabase.from('portal_data_snapshots').insert({ employee_id: employeeId, portal_source: 'QIWA', raw_data: qiwa, sync_date: new Date().toISOString() });

            successCount++;

        } catch (err) {
            console.error(`Error processing identity ${identity}:`, err);
            errorCount++;
        }
    }

    console.log('--- Import Complete ---');
    console.log(`Successfully processed: ${successCount}`);
    console.log(`Errors: ${errorCount}`);
}

importData().catch(console.error);
