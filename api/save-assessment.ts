import { getDatabase, createAssessment, saveAnswer, updateAssessmentSummary, getAssessmentById } from '../database/db';
import { Answer } from '../types';

export default async function handler(req: any, res: any) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { sessionId, name, age, gender, answers, summary } = req.body;

    if (!sessionId) {
      return res.status(400).json({ error: 'sessionId is required' });
    }

    // Initialize database (creates tables if they don't exist)
    getDatabase();

    // Create or get assessment
    let assessment = createAssessment({
      sessionId,
      name,
      age,
      gender,
    });

    // Save answers if provided
    if (answers && Array.isArray(answers)) {
      answers.forEach((answer: Answer, index: number) => {
        saveAnswer(assessment.id, answer, index + 1);
      });
    }

    // Update summary if provided
    if (summary) {
      updateAssessmentSummary(assessment.id, summary);
      // Refresh assessment to get updated summary
      const updatedAssessment = getAssessmentById(assessment.id);
      if (updatedAssessment) {
        assessment = updatedAssessment;
      }
    }

    res.status(200).json({
      success: true,
      assessment: {
        id: assessment.id,
        sessionId: assessment.session_id,
        name: assessment.name,
        age: assessment.age,
        gender: assessment.gender,
        summary: assessment.profile_summary,
        createdAt: assessment.created_at,
        completedAt: assessment.completed_at,
      },
    });
  } catch (error) {
    console.error('Error saving assessment:', error);
    res.status(500).json({ error: 'Failed to save assessment' });
  }
}

