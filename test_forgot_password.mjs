import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase credentials');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function testReset() {
  const email = 'aimetaworldd@gmail.com';
  const redirectTo = `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/auth/callback?next=/admin/reset-password`;
  
  console.log(`Sending reset password request to: ${email}`);
  console.log(`Redirect URL: ${redirectTo}`);
  
  const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo,
  });
  
  console.log('--- SUPABASE RESPONSE ---');
  console.log('Data:', JSON.stringify(data, null, 2));
  console.log('Error:', error ? JSON.stringify(error, null, 2) : 'null');
  if (error) {
    console.error('Error details:', error.message);
  }
}

testReset();
