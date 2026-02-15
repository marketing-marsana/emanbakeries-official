import fs from 'fs';
import path from 'path';
import csv from 'csv-parser';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);

async function debugValues() {
    const csvDir = path.join(process.cwd(), 'CSV');
    const filePath = path.join(csvDir, 'chtgp-Muqeem.csv');

    console.log('--- Debugging Muqeem CSV Keys ---');
    const results: any[] = [];
    fs.createReadStream(filePath)
        .pipe(csv())
        .on('data', (data) => results.push(data))
        .on('end', async () => {
            if (results.length > 0) {
                console.log('First Row Keys:', Object.keys(results[0]));
                console.log('First Row Values:', results[0]);

                // Check sample identity
                const sampleIqama = results[0]['Iqama Number'];
                console.log('Sample Iqama from CSV:', sampleIqama);
            }

            // Check DB Snapshots count
            const { count, error } = await supabase
                .from('portal_data_snapshots')
                .select('*', { count: 'exact', head: true })
                .eq('portal_source', 'MUQEEM');

            console.log('DB Muqeem Snapshots Count:', count);
            if (error) console.error('DB Error:', error);
        });
}

debugValues();
