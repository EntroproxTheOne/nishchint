/**
 * Create Supabase tables using Supabase Management API
 */

import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://llhtweboogkldrhumkea.supabase.co';
const SUPABASE_SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxsaHR3ZWJvb2drbGRyaHVta2VhIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NDM0NDEzNSwiZXhwIjoyMDc5OTIwMTM1fQ.31pgamQJZlSyt-K1WqR4BwcK3YU6fB9dQGaKnt1tXlw';

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

async function createTables() {
  console.log('🚀 Creating Supabase tables...\n');

  // Instead of running SQL, let's insert data and let Supabase create tables
  // First, create a test user to trigger table creation
  try {
    // Try inserting demo user - this will fail if table doesn't exist
    console.log('📝 Inserting demo data (will create tables if needed)...');

    const { data: userData, error: userError } = await supabase
      .from('users')
      .insert({
        id: 'demo-user-id',
        phone: '+919876543210',
        name: 'Rohan Kumar',
        age: 24,
        gender: 'Male',
        onboarding_profile: {
          occupation: 'delivery_partner',
          income_range: '20k-30k',
          financial_goal: 'buy_bike'
        }
      })
      .select();

    if (userError) {
      console.error('❌ Table creation needed. Please run the SQL schema first.');
      console.log('\n📋 Instructions:');
      console.log('1. Go to: https://supabase.com/dashboard/project/llhtweboogkldrhumkea/editor');
      console.log('2. Click "SQL Editor" in the left sidebar');
      console.log('3. Click "New Query"');
      console.log('4. Copy and paste the contents of supabase-schema.sql');
      console.log('5. Click "Run"');
      console.log('\n✅ Then run: node setup-supabase-simple.mjs');
      process.exit(1);
    }

    console.log('✅ Demo user created!');
    console.log('\n🎉 Setup complete! Continue with development.');
  } catch (error) {
    console.error('\n❌ Error:', error.message);
    console.log('\n💡 Please create tables manually using Supabase Dashboard SQL Editor');
  }
}

createTables();
