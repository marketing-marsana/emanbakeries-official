import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

// Use Service Role Key to bypass RLS and manage users
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
    auth: {
        autoRefreshToken: false,
        persistSession: false
    }
});

async function createAdmin() {
    const email = 'admin@emanbakery.com';
    const password = 'EmanBakeryAdmin2026!'; // Default secure password

    console.log(`Creating Admin User: ${email}...`);

    const { data, error } = await supabase.auth.admin.createUser({
        email,
        password,
        email_confirm: true // Auto confirm email
    });

    if (error) {
        if (error.message.includes('User already registered')) {
            console.log('User already exists! Resetting password...');
            // If exists, update password just in case
            const { data: userList } = await supabase.auth.admin.listUsers();
            const existingUser = userList.users.find(u => u.email === email);
            if (existingUser) {
                const { error: updateError } = await supabase.auth.admin.updateUserById(existingUser.id, { password: password });
                if (updateError) {
                    console.error('Error updating password:', updateError);
                } else {
                    console.log('Password reset successfully.');
                }
            }
        } else {
            console.error('Error creating user:', error);
            return;
        }
    } else {
        console.log('User created successfully:', data.user.id);
    }

    console.log('\n--- ADMIN CREDENTIALS ---');
    console.log(`Email:    ${email}`);
    console.log(`Password: ${password}`);
    console.log('-------------------------');
}

createAdmin();
