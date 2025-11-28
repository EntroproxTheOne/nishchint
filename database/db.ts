import Database from 'better-sqlite3';
import { initializeDatabase } from './schema';
import { Answer, UserProfile } from '../types';

// Singleton database instance
let dbInstance: Database.Database | null = null;

export function getDatabase(): Database.Database {
  if (!dbInstance) {
    dbInstance = initializeDatabase();
  }
  return dbInstance;
}

// Assessment operations
export interface AssessmentRecord {
  id: number;
  session_id: string;
  name: string | null;
  age: number | null;
  gender: string | null;
  profile_summary: string | null;
  created_at: string;
  completed_at: string | null;
}

export interface CreateAssessmentParams {
  sessionId: string;
  name?: string;
  age?: number;
  gender?: string;
}

export function createAssessment(params: CreateAssessmentParams): AssessmentRecord {
  const db = getDatabase();
  
  // Check if name column exists, if not, add it (for existing databases)
  try {
    db.exec(`
      ALTER TABLE assessments ADD COLUMN name TEXT;
    `);
  } catch (e) {
    // Column already exists, ignore
  }
  
  const stmt = db.prepare(`
    INSERT INTO assessments (session_id, name, age, gender)
    VALUES (?, ?, ?, ?)
  `);
  
  const result = stmt.run(
    params.sessionId, 
    params.name || null, 
    params.age || null, 
    params.gender || null
  );
  
  return getAssessmentById(result.lastInsertRowid as number)!;
}

export function getAssessmentById(id: number): AssessmentRecord | null {
  const db = getDatabase();
  const stmt = db.prepare('SELECT * FROM assessments WHERE id = ?');
  return stmt.get(id) as AssessmentRecord | null;
}

export function getAssessmentBySessionId(sessionId: string): AssessmentRecord | null {
  const db = getDatabase();
  const stmt = db.prepare('SELECT * FROM assessments WHERE session_id = ?');
  return stmt.get(sessionId) as AssessmentRecord | null;
}

export function updateAssessmentSummary(assessmentId: number, summary: string): void {
  const db = getDatabase();
  const stmt = db.prepare(`
    UPDATE assessments 
    SET profile_summary = ?, completed_at = CURRENT_TIMESTAMP
    WHERE id = ?
  `);
  stmt.run(summary, assessmentId);
}

// Answer operations
export interface AnswerRecord {
  id: number;
  assessment_id: number;
  question_id: string;
  question_text: string;
  question_category: string;
  option_id: string;
  option_text: string;
  option_value: string;
  question_order: number;
  created_at: string;
}

export function saveAnswer(
  assessmentId: number,
  answer: Answer,
  questionOrder: number
): AnswerRecord {
  const db = getDatabase();
  const stmt = db.prepare(`
    INSERT INTO answers (
      assessment_id, question_id, question_text, question_category,
      option_id, option_text, option_value, question_order
    )
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `);
  
  const result = stmt.run(
    assessmentId,
    answer.questionId,
    answer.questionText,
    answer.questionCategory,
    answer.optionId,
    answer.optionText,
    answer.optionValue,
    questionOrder
  );
  
  return getAnswerById(result.lastInsertRowid as number)!;
}

export function getAnswerById(id: number): AnswerRecord | null {
  const db = getDatabase();
  const stmt = db.prepare('SELECT * FROM answers WHERE id = ?');
  return stmt.get(id) as AnswerRecord | null;
}

export function getAnswersByAssessmentId(assessmentId: number): AnswerRecord[] {
  const db = getDatabase();
  const stmt = db.prepare(`
    SELECT * FROM answers 
    WHERE assessment_id = ? 
    ORDER BY question_order ASC
  `);
  return stmt.all(assessmentId) as AnswerRecord[];
}

// Question operations (for storing generated questions)
export interface QuestionRecord {
  id: number;
  assessment_id: number | null;
  question_id: string;
  question_text: string;
  question_category: string;
  batch_number: number | null;
  created_at: string;
}

export function saveQuestion(
  questionId: string,
  questionText: string,
  questionCategory: string,
  assessmentId?: number,
  batchNumber?: number
): QuestionRecord {
  const db = getDatabase();
  const stmt = db.prepare(`
    INSERT INTO questions (assessment_id, question_id, question_text, question_category, batch_number)
    VALUES (?, ?, ?, ?, ?)
  `);
  
  const result = stmt.run(
    assessmentId || null,
    questionId,
    questionText,
    questionCategory,
    batchNumber || null
  );
  
  return getQuestionById(result.lastInsertRowid as number)!;
}

export function getQuestionById(id: number): QuestionRecord | null {
  const db = getDatabase();
  const stmt = db.prepare('SELECT * FROM questions WHERE id = ?');
  return stmt.get(id) as QuestionRecord | null;
}

export function getQuestionsByAssessmentId(assessmentId: number): QuestionRecord[] {
  const db = getDatabase();
  const stmt = db.prepare(`
    SELECT * FROM questions 
    WHERE assessment_id = ? 
    ORDER BY batch_number ASC, created_at ASC
  `);
  return stmt.all(assessmentId) as QuestionRecord[];
}

// Statistics/analytics
export function getAssessmentStats() {
  const db = getDatabase();
  
  const totalAssessments = db.prepare('SELECT COUNT(*) as count FROM assessments').get() as { count: number };
  const completedAssessments = db.prepare('SELECT COUNT(*) as count FROM assessments WHERE completed_at IS NOT NULL').get() as { count: number };
  const totalAnswers = db.prepare('SELECT COUNT(*) as count FROM answers').get() as { count: number };
  
  return {
    totalAssessments: totalAssessments.count,
    completedAssessments: completedAssessments.count,
    totalAnswers: totalAnswers.count,
  };
}

// Cleanup function
export function closeDatabase(): void {
  if (dbInstance) {
    dbInstance.close();
    dbInstance = null;
  }
}

