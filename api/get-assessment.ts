import { getDatabase, getAssessmentBySessionId, getAnswersByAssessmentId } from '../database/db';

export default async function handler(req: any, res: any) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { sessionId } = req.query;

    if (!sessionId) {
      return res.status(400).json({ error: 'sessionId is required' });
    }

    // Initialize database
    getDatabase();

    // Get assessment
    const assessment = getAssessmentBySessionId(sessionId as string);

    if (!assessment) {
      return res.status(404).json({ error: 'Assessment not found' });
    }

    // Get answers
    const answers = getAnswersByAssessmentId(assessment.id);

    res.status(200).json({
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
      answers: answers.map((a) => ({
        questionId: a.question_id,
        questionText: a.question_text,
        questionCategory: a.question_category,
        optionId: a.option_id,
        optionText: a.option_text,
        optionValue: a.option_value,
        questionOrder: a.question_order,
      })),
    });
  } catch (error) {
    console.error('Error getting assessment:', error);
    res.status(500).json({ error: 'Failed to get assessment' });
  }
}

