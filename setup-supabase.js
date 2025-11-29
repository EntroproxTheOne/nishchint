/**
 * Supabase Database Setup Script
 * Run this to create tables, enable real-time, and insert demo data
 */

import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Supabase credentials
const SUPABASE_URL = 'https://llhtweboogkldrhumkea.supabase.co';
const SUPABASE_SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxsaHR3ZWJvb2drbGRyaHVta2VhIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NDM0NDEzNSwiZXhwIjoyMDc5OTIwMTM1fQ.31pgamQJZlSyt-K1WqR4BwcK3YU6fB9dQGaKnt1tXlw';

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function setupDatabase() {
  console.log('🚀 Starting Supabase database setup...\n');

  try {
    // Step 1: Create users table
    console.log('📝 Creating users table...');
    const {error: usersError } = await supabase.rpc('exec_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS users (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          phone VARCHAR(15) UNIQUE,
          name VARCHAR(100),
          age INTEGER,
          gender VARCHAR(20),
          onboarding_profile JSONB,
          created_at TIMESTAMP DEFAULT NOW(),
          updated_at TIMESTAMP DEFAULT NOW()
        );
      `
    });
    if (usersError) console.error('Users table:', usersError.message);
    else console.log('✅ Users table created');

    // Step 2: Create transactions table
    console.log('📝 Creating transactions table...');
    const { error: transError } = await supabase.rpc('exec_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS transactions (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          user_id UUID REFERENCES users(id) ON DELETE CASCADE,
          amount INTEGER NOT NULL,
          type VARCHAR(10) CHECK (type IN ('income', 'expense')),
          category VARCHAR(50),
          source VARCHAR(20) CHECK (source IN ('sms', 'manual', 'ocr')),
          merchant VARCHAR(100),
          is_business BOOLEAN DEFAULT FALSE,
          raw_text TEXT,
          created_at TIMESTAMP DEFAULT NOW()
        );

        CREATE INDEX IF NOT EXISTS idx_transactions_user_id ON transactions(user_id);
        CREATE INDEX IF NOT EXISTS idx_transactions_created_at ON transactions(created_at DESC);
      `
    });
    if (transError) console.error('Transactions table:', transError.message);
    else console.log('✅ Transactions table created');

    // Step 3: Create goals table
    console.log('📝 Creating goals table...');
    const { error: goalsError } = await supabase.rpc('exec_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS goals (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          user_id UUID REFERENCES users(id) ON DELETE CASCADE,
          name VARCHAR(100),
          description TEXT,
          target_amount INTEGER NOT NULL,
          saved_amount INTEGER DEFAULT 0,
          deadline DATE,
          priority VARCHAR(10) CHECK (priority IN ('high', 'medium', 'low')),
          category VARCHAR(50),
          is_active BOOLEAN DEFAULT TRUE,
          created_at TIMESTAMP DEFAULT NOW(),
          updated_at TIMESTAMP DEFAULT NOW()
        );

        CREATE INDEX IF NOT EXISTS idx_goals_user_id ON goals(user_id);
      `
    });
    if (goalsError) console.error('Goals table:', goalsError.message);
    else console.log('✅ Goals table created');

    // Step 4: Create predictions table
    console.log('📝 Creating predictions table...');
    const { error: predError } = await supabase.rpc('exec_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS predictions (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          user_id UUID REFERENCES users(id) ON DELETE CASCADE,
          predicted_expense_low INTEGER,
          predicted_expense_high INTEGER,
          confidence FLOAT,
          message TEXT,
          valid_until DATE,
          created_at TIMESTAMP DEFAULT NOW()
        );

        CREATE INDEX IF NOT EXISTS idx_predictions_user_id ON predictions(user_id);
      `
    });
    if (predError) console.error('Predictions table:', predError.message);
    else console.log('✅ Predictions table created');

    // Step 5: Create nudges table
    console.log('📝 Creating nudges table...');
    const { error: nudgesError } = await supabase.rpc('exec_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS nudges (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          user_id UUID REFERENCES users(id) ON DELETE CASCADE,
          message TEXT NOT NULL,
          type VARCHAR(20),
          trigger VARCHAR(50),
          metadata JSONB,
          is_read BOOLEAN DEFAULT FALSE,
          created_at TIMESTAMP DEFAULT NOW()
        );

        CREATE INDEX IF NOT EXISTS idx_nudges_user_id ON nudges(user_id, is_read);
      `
    });
    if (nudgesError) console.error('Nudges table:', nudgesError.message);
    else console.log('✅ Nudges table created');

    console.log('\n📊 Inserting demo data...\n');

    // Insert demo user
    const { data: user, error: userInsertError } = await supabase
      .from('users')
      .upsert({
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
      }, { onConflict: 'phone' })
      .select();

    if (userInsertError) {
      console.error('❌ Error inserting user:', userInsertError.message);
    } else {
      console.log('✅ Demo user created: Rohan Kumar');
    }

    // Insert demo goal
    const { error: goalError } = await supabase
      .from('goals')
      .insert({
        user_id: 'demo-user-id',
        name: 'Hero Splendor+',
        description: 'Dream bike for faster deliveries and personal use',
        target_amount: 35000,
        saved_amount: 12250,
        deadline: '2025-06-30',
        priority: 'high',
        category: 'vehicle',
        is_active: true
      });

    if (goalError && !goalError.message.includes('duplicate')) {
      console.error('❌ Error inserting goal:', goalError.message);
    } else {
      console.log('✅ Demo goal created: Hero Splendor+ (₹35,000)');
    }

    // Insert sample transactions
    const transactions = [
      { user_id: 'demo-user-id', amount: 2500, type: 'income', category: 'salary', source: 'manual', merchant: 'Zomato Weekly Payout', is_business: true },
      { user_id: 'demo-user-id', amount: 200, type: 'income', category: 'tips', source: 'manual', merchant: 'Customer Tips', is_business: true },
      { user_id: 'demo-user-id', amount: 150, type: 'expense', category: 'food', source: 'sms', merchant: 'Zomato (Lunch)', is_business: false },
      { user_id: 'demo-user-id', amount: 200, type: 'expense', category: 'fuel', source: 'sms', merchant: 'HP Petrol Pump', is_business: true },
      { user_id: 'demo-user-id', amount: 100, type: 'expense', category: 'food', source: 'manual', merchant: 'Chai & Snacks', is_business: false },
      { user_id: 'demo-user-id', amount: 50, type: 'expense', category: 'transport', source: 'manual', merchant: 'Local Train', is_business: false },
      { user_id: 'demo-user-id', amount: 300, type: 'expense', category: 'groceries', source: 'sms', merchant: 'DMart', is_business: false },
      { user_id: 'demo-user-id', amount: 1500, type: 'income', category: 'salary', source: 'manual', merchant: 'Zomato Earnings (3 days)', is_business: true },
      { user_id: 'demo-user-id', amount: 80, type: 'expense', category: 'food', source: 'manual', merchant: 'Dinner', is_business: false },
      { user_id: 'demo-user-id', amount: 150, type: 'expense', category: 'fuel', source: 'sms', merchant: 'Bharat Petroleum', is_business: true }
    ];

    const { error: transInsertError } = await supabase
      .from('transactions')
      .insert(transactions);

    if (transInsertError && !transInsertError.message.includes('duplicate')) {
      console.error('❌ Error inserting transactions:', transInsertError.message);
    } else {
      console.log('✅ Sample transactions inserted (10 records)');
    }

    // Insert ML prediction
    const { error: predInsertError } = await supabase
      .from('predictions')
      .insert({
        user_id: 'demo-user-id',
        predicted_expense_low: 12000,
        predicted_expense_high: 14500,
        confidence: 0.90,
        message: 'Stable week ahead! Koi tension nahi 😊',
        valid_until: '2025-12-06'
      });

    if (predInsertError && !predInsertError.message.includes('duplicate')) {
      console.error('❌ Error inserting prediction:', predInsertError.message);
    } else {
      console.log('✅ ML prediction inserted');
    }

    // Insert sample nudge
    const { error: nudgeInsertError } = await supabase
      .from('nudges')
      .insert({
        user_id: 'demo-user-id',
        message: 'Rohan, tu aaj ₹530 kharch kar chuka hai. Bike fund safe hai!',
        type: 'info',
        trigger: 'sync',
        metadata: { total_expense_today: 530 },
        is_read: false
      });

    if (nudgeInsertError && !nudgeInsertError.message.includes('duplicate')) {
      console.error('❌ Error inserting nudge:', nudgeInsertError.message);
    } else {
      console.log('✅ Sample nudge inserted');
    }

    console.log('\n🎉 Database setup complete!\n');
    console.log('📊 Summary:');
    console.log('- 5 tables created (users, transactions, goals, predictions, nudges)');
    console.log('- Demo user: Rohan Kumar (demo-user-id)');
    console.log('- Demo goal: Hero Splendor+ (₹12,250 / ₹35,000)');
    console.log('- 10 sample transactions');
    console.log('- 1 ML prediction');
    console.log('- 1 proactive nudge');
    console.log('\n✅ Ready for development!');

  } catch (error) {
    console.error('\n❌ Setup failed:', error);
  }
}

setupDatabase();
