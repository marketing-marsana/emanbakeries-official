import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);

async function checkIDs() {
    const identity = '2205956697'; // Sumandas (Expat)

    // 1. Get Employee
    const { data: emp, error: empError } = await supabase
        .from('employees')
        .select('id, full_name_en')
        .eq('identity_number', identity)
        .single();

    if (empError) {
        console.error('Error fetching employee:', empError);
        return;
    }

    console.log('Employee Found:', emp);
    console.log('ID:', emp.id);

    // 2. Check Snapshots with this ID
    const { data: snaps, error: snapError } = await supabase
        .from('portal_data_snapshots')
        .select('portal_source, id')
        .eq('employee_id', emp.id);

    if (snapError) {
        console.error('Error fetching snapshots:', snapError);
    } else {
        console.log('Snapshots Found:', snaps.length);
        console.log('Sources:', snaps.map(s => s.portal_source));
    }

    // 3. Confirm Muqeem Check
    const muqeemExists = (snaps || []).some(s => s.portal_source === 'MUQEEM');
    console.log('Has Muqeem?', muqeemExists);
}

checkIDs();
