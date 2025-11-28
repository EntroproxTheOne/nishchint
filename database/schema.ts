import Database from 'better-sqlite3';
import { join } from 'path';

const DB_PATH = join(process.cwd(), 'nischint.db');

export function initializeDatabase(): Database.Database {
  const db = new Database(DB_PATH);
  
  // Enable foreign keys
  db.pragma('foreign_keys = ON');
  
  // Create assessments table (main session/assessment records)
  db.exec(`
    CREATE TABLE IF NOT EXISTS assessments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      session_id TEXT UNIQUE NOT NULL,
      name TEXT,
      age INTEGER,
      gender TEXT,
      profile_summary TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      completed_at DATETIME
    )
  `);
  
  // Create answers table (stores all user answers)
  db.exec(`
    CREATE TABLE IF NOT EXISTS answers (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      assessment_id INTEGER NOT NULL,
      question_id TEXT NOT NULL,
      question_text TEXT NOT NULL,
      question_category TEXT NOT NULL,
      option_id TEXT NOT NULL,
      option_text TEXT NOT NULL,
      option_value TEXT NOT NULL,
      question_order INTEGER NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (assessment_id) REFERENCES assessments(id) ON DELETE CASCADE
    )
  `);
  
  // Create questions table (stores generated questions for reference)
  db.exec(`
    CREATE TABLE IF NOT EXISTS questions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      assessment_id INTEGER,
      question_id TEXT NOT NULL,
      question_text TEXT NOT NULL,
      question_category TEXT NOT NULL,
      batch_number INTEGER,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (assessment_id) REFERENCES assessments(id) ON DELETE CASCADE
    )
  `);
  
  // Create indexes for better query performance
  db.exec(`
    CREATE INDEX IF NOT EXISTS idx_answers_assessment_id ON answers(assessment_id);
    CREATE INDEX IF NOT EXISTS idx_answers_question_category ON answers(question_category);
    CREATE INDEX IF NOT EXISTS idx_questions_assessment_id ON questions(assessment_id);
    CREATE INDEX IF NOT EXISTS idx_assessments_session_id ON assessments(session_id);
  `);
  
  console.log('✅ Database initialized at:', DB_PATH);
  
  return db;
}

