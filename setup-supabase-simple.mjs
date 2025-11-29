/**
 * Simplified Supabase Setup - Insert Demo Data
 * Assumes tables are created via Supabase Dashboard SQL Editor
 */

import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://llhtweboogkldrhumkea.supabase.co';
const SUPABASE_SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxsaHR3ZWJvb2drbGRyaHVta2VhIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NDM0NDEzNSwiZXhwIjoyMDc5OTIwMTM1fQ.31pgamQJZlSyt-K1WqR4BwcK3YU6fB9dQGaKnt1tXlw';

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

async function setupDemoData() {
  console.log('🚀 Setting up Nischint demo data...\n');

  try {
    // Insert demo user
    console.log('👤 Creating demo user...');
    const { data: user, error: userError } = await supabase
      .from('users')
      .upsert({
        id: '00000000-0000-0000-0000-000000000001',
        phone: '+919876543210',
        name: 'Rohan Kumar',
        age: 24,
        gender: 'Male',
        onboarding_profile: {
          occupation: 'delivery_partner',
          income_range: '20k-30k',
          financial_goal: 'buy_bike'
        }
      }, { onConflict: 'id' });

    if (userError) {
      console.error('❌ User error:', userError.message);
      console.log('💡 Please run the SQL schema first in Supabase Dashboard');
      process.exit(1);
    }
    console.log('✅ Demo user: Rohan Kumar');

    // Insert demo goal
    console.log('🎯 Creating demo goal...');
    const { error: goalError } = await supabase
      .from('goals')
      .upsert({
        user_id: '00000000-0000-0000-0000-000000000001',
        name: 'Hero Splendor+',
        description: 'Dream bike for faster deliveries',
        target_amount: 35000,
        saved_amount: 12250,
        deadline: '2025-06-30',
        priority: 'high',
        category: 'vehicle',
        is_active: true
      }, { onConflict: 'user_id,name', ignoreDuplicates: true });

    if (goalError && !goalError.code?.includes('23505')) {
      console.error('❌ Goal error:', goalError.message);
    } else {
      console.log('✅ Demo goal: Hero Splendor+ (₹12,250 / ₹35,000)');
    }

    // Insert sample transactions
    console.log('💰 Inserting sample transactions...');
    const DEMO_USER_ID = '00000000-0000-0000-0000-000000000001';
    const transactions = [
      { user_id: DEMO_USER_ID, amount: 2500, type: 'income', category: 'salary', source: 'manual', merchant: 'Zomato Weekly Payout', is_business: true },
      { user_id: DEMO_USER_ID, amount: 200, type: 'income', category: 'tips', source: 'manual', merchant: 'Customer Tips', is_business: true },
      { user_id: DEMO_USER_ID, amount: 150, type: 'expense', category: 'food', source: 'sms', merchant: 'Zomato (Lunch)', is_business: false },
      { user_id: DEMO_USER_ID, amount: 200, type: 'expense', category: 'fuel', source: 'sms', merchant: 'HP Petrol Pump', is_business: true },
      { user_id: DEMO_USER_ID, amount: 100, type: 'expense', category: 'food', source: 'manual', merchant: 'Chai & Snacks', is_business: false },
      { user_id: DEMO_USER_ID, amount: 50, type: 'expense', category: 'transport', source: 'manual', merchant: 'Local Train', is_business: false },
      { user_id: DEMO_USER_ID, amount: 300, type: 'expense', category: 'groceries', source: 'sms', merchant: 'DMart', is_business: false },
      { user_id: DEMO_USER_ID, amount: 1500, type: 'income', category: 'salary', source: 'manual', merchant: 'Zomato Earnings', is_business: true },
      { user_id: DEMO_USER_ID, amount: 80, type: 'expense', category: 'food', source: 'manual', merchant: 'Dinner', is_business: false },
      { user_id: DEMO_USER_ID, amount: 150, type: 'expense', category: 'fuel', source: 'sms', merchant: 'Bharat Petroleum', is_business: true }
    ];

    const { error: transError } = await supabase
      .from('transactions')
      .insert(transactions);

    if (transError && !transError.code?.includes('23505')) {
      console.error('❌ Transactions error:', transError.message);
    } else {
      console.log('✅ 10 sample transactions inserted');
    }

    // Insert ML prediction
    console.log('🤖 Inserting ML prediction...');
    const { error: predError } = await supabase
      .from('predictions')
      .upsert({
        user_id: DEMO_USER_ID,
        predicted_expense_low: 12000,
        predicted_expense_high: 14500,
        confidence: 0.90,
        message: 'Stable week ahead! Koi tension nahi 😊',
        valid_until: '2025-12-06'
      }, { onConflict: 'user_id', ignoreDuplicates: true });

    if (predError && !predError.code?.includes('23505')) {
      console.error('❌ Prediction error:', predError.message);
    } else {
      console.log('✅ ML prediction inserted');
    }

    // Insert sample nudge
    console.log('💬 Inserting sample nudge...');
    const { error: nudgeError } = await supabase
      .from('nudges')
      .insert({
        user_id: DEMO_USER_ID,
        message: 'Rohan, tu aaj ₹530 kharch kar chuka hai. Bike fund safe hai!',
        type: 'info',
        trigger: 'sync',
        metadata: { total_expense_today: 530 },
        is_read: false
      });

    if (nudgeError && !nudgeError.code?.includes('23505')) {
      console.error('❌ Nudge error:', nudgeError.message);
    } else {
      console.log('✅ Sample nudge inserted');
    }

    console.log('\n🎉 Demo data setup complete!');
    console.log('\n📊 Summary:');
    console.log('- User: Rohan Kumar (00000000-0000-0000-0000-000000000001)');
    console.log('- Goal: Hero Splendor+ (35% complete)');
    console.log('- Transactions: 10 records');
    console.log('- ML Prediction: Week-ahead forecast');
    console.log('- Nudges: 1 proactive message');
    console.log('\n✅ Ready to build the app!');
    console.log('\n🔑 Use this user ID for testing:');
    console.log('   00000000-0000-0000-0000-000000000001');

  } catch (error) {
    console.error('\n❌ Setup failed:', error);
  }
}

setupDemoData();
