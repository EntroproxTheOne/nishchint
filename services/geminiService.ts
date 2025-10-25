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
        const response = await fetch('/api/summarize-profile', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ profile }),
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        return data.summary || FALLBACK_SUMMARY;
    } catch (error) {
        console.error("Error calling summarize API:", error);
        return FALLBACK_SUMMARY;
    }
};


export const generateQuestions = async (
    previousAnswers: Answer[],
    userData: { age: number, gender: string },
    currentBatch: number
): Promise<Question[]> => {

    try {
        const response = await fetch('/api/generate-questions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                previousAnswers,
                userData,
                currentBatch
            }),
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        return data.questions || [];
        
    } catch (error) {
        console.error("Error calling generate questions API:", error);
        return [];
    }
};