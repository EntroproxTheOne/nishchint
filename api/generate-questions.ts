import { VercelRequest, VercelResponse } from '@vercel/node';
import { GoogleGenAI, Type } from "@google/genai";

export default async function handler(req: VercelRequest, res: VercelResponse) {
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
    const { previousAnswers, userData, currentBatch } = req.body;

    if (!process.env.GEMINI_API_KEY) {
      console.error("Gemini API key not found.");
      return res.status(500).json({ error: 'API key not configured' });
    }

    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

    const systemPrompt = `You are Nischint, an empathetic financial co-pilot. Your job is to generate the next 5 multiple-choice questions for a financial personality assessment.

USER CONTEXT:
- Age: ${userData.age}
- Gender: ${userData.gender}
- Current Batch: ${currentBatch}

PREVIOUS ANSWERS:
${JSON.stringify(previousAnswers.map((a: any) => ({ question: a.questionText, answer: a.optionText })), null, 2)}

RULES:
1. Generate EXACTLY 5 questions.
2. Each question must have EXACTLY 4 options.
3. Questions should be a logical drill-down based on the PREVIOUS ANSWERS provided.
4. Focus on financial behaviors, habits, and psychology, not just numbers or knowledge.
5. Make questions specific and situational to reveal personality.
6. Use clear, simple, and encouraging language.

OUTPUT FORMAT (MUST BE A SINGLE, VALID JSON OBJECT):
Your entire output must be a single JSON object. Do not include any text or markdown before or after the JSON.`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: systemPrompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            questions: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  id: { type: Type.STRING },
                  text: { type: Type.STRING },
                  category: { type: Type.STRING },
                  options: {
                    type: Type.ARRAY,
                    items: {
                      type: Type.OBJECT,
                      properties: {
                        id: { type: Type.STRING },
                        text: { type: Type.STRING },
                        value: { type: Type.STRING },
                      },
                      required: ['id', 'text', 'value'],
                    }
                  }
                },
                required: ['id', 'text', 'category', 'options'],
              }
            }
          },
          required: ['questions']
        }
      }
    });

    const responseText = response.text;
    const responseObject = JSON.parse(responseText);
    const questions = responseObject.questions;

    if (!Array.isArray(questions) || questions.length === 0) {
      throw new Error("Parsed JSON's 'questions' field is not a valid question array.");
    }
    
    const formattedQuestions = questions.map((q: any, index: number) => ({
      id: q.id || `q_${Date.now()}_${index}`,
      text: q.text,
      category: q.category || 'general',
      options: q.options.map((opt: any, optIndex: number) => ({
        id: opt.id || String.fromCharCode(97 + optIndex),
        text: opt.text,
        value: opt.value
      }))
    }));

    res.status(200).json({ questions: formattedQuestions });

  } catch (error) {
    console.error("Error calling Gemini API for question generation:", error);
    res.status(500).json({ error: 'Failed to generate questions' });
  }
}
