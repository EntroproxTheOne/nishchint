import { VercelRequest, VercelResponse } from '@vercel/node';
import { GoogleGenAI } from "@google/genai";

const FALLBACK_SUMMARY = `
### The Resilient Planner

Based on your responses, you appear to be someone who is thoughtful about your financial future. You show a tendency to balance immediate needs with long-term goals, which is a fantastic foundation. 

*   **Strength:** You are likely good at considering different options before making a financial decision.
*   **Area for Growth:** Continue building on this by creating a more structured plan to turn your goals into actionable steps.

To get a more detailed AI-powered analysis, please ensure your connection is stable and try again.
`;

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
    const { profile } = req.body;

    if (!process.env.GEMINI_API_KEY) {
      console.error("Gemini API key not found.");
      return res.status(200).json({ summary: FALLBACK_SUMMARY });
    }

    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

    // Remove initial user data for a cleaner summary prompt
    const { age, gender, ...answers } = profile;
    const profileJsonString = JSON.stringify(answers, null, 2);

    const prompt = `You are an expert financial analyst named 'Nischint'. Your tone is encouraging, insightful, and professional. Summarize the following user's financial answers into a 'financial vibe' persona. 

Follow these rules STRICTLY:
1.  **Format your entire response in Markdown.**
2.  Start with a title for the persona using a level 3 heading (e.g., \`### The Cautious Cultivator\`).
3.  Write a single paragraph (3-4 sentences) describing their likely behaviors and mindset.
4.  Add a bulleted list with two items: one highlighting a key **Strength** and one suggesting a potential **Area for Growth**.
5.  Do NOT mention the input was JSON or refer to "your answers". Speak about the person directly.

User's Financial Answers:
${profileJsonString}
`;
    
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });

    res.status(200).json({ summary: response.text });

  } catch (error) {
    console.error("Error calling Gemini API:", error);
    res.status(200).json({ summary: FALLBACK_SUMMARY });
  }
}
