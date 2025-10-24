import { GoogleGenAI, Type } from "@google/genai";
import { UserProfile, Question, Answer } from "../types";

const FALLBACK_SUMMARY = `
### The Resilient Planner

Based on your responses, you appear to be someone who is thoughtful about your financial future. You show a tendency to balance immediate needs with long-term goals, which is a fantastic foundation. 

*   **Strength:** You are likely good at considering different options before making a financial decision.
*   **Area for Growth:** Continue building on this by creating a more structured plan to turn your goals into actionable steps.

To get a more detailed AI-powered analysis, please ensure your connection is stable and try again.
`;

export const summarizeProfile = async (profile: UserProfile): Promise<string> => {
    try {
        if (!process.env.API_KEY) {
            console.error("Gemini API key not found.");
            return FALLBACK_SUMMARY;
        }

        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

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

        return response.text;
    } catch (error) {
        console.error("Error calling Gemini API:", error);
        return FALLBACK_SUMMARY;
    }
};

const parseGeminiResponseToQuestions = (responseText: string): Question[] => {
    try {
        const responseObject = JSON.parse(responseText);
        const questions = responseObject.questions;

        if (!Array.isArray(questions) || questions.length === 0) {
            throw new Error("Parsed JSON's 'questions' field is not a valid question array.");
        }
        
        return questions.map((q, index) => ({
            id: q.id || `q_${Date.now()}_${index}`,
            text: q.text,
            category: q.category || 'general',
            options: q.options.map((opt: any, optIndex: number) => ({
                id: opt.id || String.fromCharCode(97 + optIndex),
                text: opt.text,
                value: opt.value
            }))
        }));

    } catch (error) {
        console.error("Failed to parse questions from Gemini response:", error);
        console.error("Raw response text:", responseText);
        return [];
    }
}

export const generateQuestions = async (
    previousAnswers: Answer[],
    userData: { age: number, gender: string },
    currentBatch: number
): Promise<Question[]> => {

    const systemPrompt = `You are Nischint, an empathetic financial co-pilot. Your job is to generate the next 5 multiple-choice questions for a financial personality assessment.

USER CONTEXT:
- Age: ${userData.age}
- Gender: ${userData.gender}
- Current Batch: ${currentBatch}

PREVIOUS ANSWERS:
${JSON.stringify(previousAnswers.map(a => ({ question: a.questionText, answer: a.optionText })), null, 2)}

RULES:
1. Generate EXACTLY 5 questions.
2. Each question must have EXACTLY 4 options.
3. Questions should be a logical drill-down based on the PREVIOUS ANSWERS provided.
4. Focus on financial behaviors, habits, and psychology, not just numbers or knowledge.
5. Make questions specific and situational to reveal personality.
6. Use clear, simple, and encouraging language.

OUTPUT FORMAT (MUST BE A SINGLE, VALID JSON OBJECT):
Your entire output must be a single JSON object. Do not include any text or markdown before or after the JSON.
`;

    try {
        if (!process.env.API_KEY) {
            console.error("Gemini API key not found.");
            return [];
        }

        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        
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
        return parseGeminiResponseToQuestions(responseText);
        
    } catch (error) {
        console.error("Error calling Gemini API for question generation:", error);
        return [];
    }
};