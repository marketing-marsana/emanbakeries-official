import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

async function checkEmployee() {
    // Check specific employee (Khulud)
    const { data, error } = await supabase
        .from('employees')
        .select('*')
        .eq('identity_number', '1066722487')
        .single();

    if (error) {
        console.error('Error fetching employee:', error);
    } else {
        console.log('Employee Data for 1066722487:');
        console.log('Arabic Name:', data.arabic_name);
        console.log('Salary:', data.salary);
        console.log('Identity:', data.identity_number);
        console.log('Full Record:', JSON.stringify(data, null, 2));
    }
}

checkEmployee();
