/**
 * Direct Supabase Database Setup using REST API
 */

import https from 'https';

const SUPABASE_URL = 'https://llhtweboogkldrhumkea.supabase.co';
const SUPABASE_SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxsaHR3ZWJvb2drbGRyaHVta2VhIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NDM0NDEzNSwiZXhwIjoyMDc5OTIwMTM1fQ.31pgamQJZlSyt-K1WqR4BwcK3YU6fB9dQGaKnt1tXlw';

const SQL_STATEMENTS = `
-- Create users table
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

-- Create transactions table
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

-- Create goals table
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

-- Create predictions table
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

-- Create nudges table
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

-- Enable RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE predictions ENABLE ROW LEVEL SECURITY;
ALTER TABLE nudges ENABLE ROW LEVEL SECURITY;

-- Create open policies for demo
DROP POLICY IF EXISTS "Allow all on users" ON users;
CREATE POLICY "Allow all on users" ON users FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow all on transactions" ON transactions;
CREATE POLICY "Allow all on transactions" ON transactions FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow all on goals" ON goals;
CREATE POLICY "Allow all on goals" ON goals FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow all on predictions" ON predictions;
CREATE POLICY "Allow all on predictions" ON predictions FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow all on nudges" ON nudges;
CREATE POLICY "Allow all on nudges" ON nudges FOR ALL USING (true) WITH CHECK (true);
`;

function executeSQL(sql) {
    return new Promise((resolve, reject) => {
        const data = JSON.stringify({ query: sql });

        const options = {
            hostname: 'llhtweboogkldrhumkea.supabase.co',
            port: 443,
            path: '/rest/v1/rpc/exec_sql',
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'apikey': SUPABASE_SERVICE_KEY,
                'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
                'Content-Length': data.length
            }
        };

        const req = https.request(options, (res) => {
            let body = '';
            res.on('data', (chunk) => body += chunk);
            res.on('end', () => {
                if (res.statusCode >= 200 && res.statusCode < 300) {
                    resolve(body);
                } else {
                    reject(new Error(`HTTP ${res.statusCode}: ${body}`));
                }
            });
        });

        req.on('error', reject);
        req.write(data);
        req.end();
    });
}

async function setup() {
    console.log('🚀 Creating Supabase tables...\n');

    try {
        await executeSQL(SQL_STATEMENTS);
        console.log('✅ Tables created successfully!\n');

        // Now run the data insert script
        console.log('📊 Inserting demo data...\n');
        const { execSync } = await import('child_process');
        execSync('node setup-supabase-simple.mjs', { stdio: 'inherit' });

    } catch (error) {
        console.error('❌ Error:', error.message);
        console.log('\n💡 Falling back to manual setup...');
        console.log('Please run the SQL from supabase-schema.sql in Supabase Dashboard');
    }
}

setup();
