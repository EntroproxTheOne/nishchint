import { UserProfile, Question } from './types';

export const INITIAL_USER_DATA: UserProfile = {
    name: undefined,
    age: undefined,
    gender: undefined,
};

export const TOTAL_QUESTIONS = 20;

export const INITIAL_QUESTIONS: Question[] = [
    {
        id: "q1_priority",
        text: "If you received an unexpected $1,000 today, what's your first instinct?",
        category: "spending_priority",
        options: [
            { id: "opt1_a", text: "Pay off some debt.", value: "debt_reduction" },
            { id: "opt1_b", text: "Put it straight into savings.", value: "savings_focused" },
            { id: "opt1_c", text: "Invest it for long-term growth.", value: "investment_focused" },
            { id: "opt1_d", text: "Treat myself to something nice.", value: "discretionary_spending" }
        ]
    },
    {
        id: "q2_risk_tolerance",
        text: "How do you feel about investing in the stock market?",
        category: "risk_tolerance",
        options: [
            { id: "opt2_a", text: "Excited! High risk, high reward.", value: "high_risk" },
            { id: "opt2_b", text: "Cautiously optimistic, with a balanced portfolio.", value: "moderate_risk" },
            { id: "opt2_c", text: "Nervous. I prefer safer options like savings accounts.", value: "low_risk" },
            { id: "opt2_d", text: "I don't know enough about it to invest.", value: "uninformed" }
        ]
    },
    {
        id: "q3_financial_planning",
        text: "Which statement best describes your approach to budgeting?",
        category: "financial_planning",
        options: [
            { id: "opt3_a", text: "I have a detailed budget and track every expense.", value: "strict_budgeter" },
            // FIX: Corrected typo `id:_id` to `id`.
            { id: "opt3_b", text: "I have a general idea of my spending, but don't track closely.", value: "loose_budgeter" },
            { id: "opt3_c", text: "I just try to spend less than I earn.", value: "intuitive_spender" },
            { id: "opt3_d", text: "What's a budget?", value: "no_budget" }
        ]
    },
    {
        id: "q4_goal_horizon",
        text: "When you think about financial goals, what's your primary focus?",
        category: "goal_horizon",
        options: [
            { id: "opt4_a", text: "Short-term goals (e.g., vacation, new phone).", value: "short_term" },
            { id: "opt4_b", text: "Mid-term goals (e.g., buying a car, down payment).", value: "mid_term" },
            { id: "opt4_c", text: "Long-term goals (e.g., retirement, buying a home).", value: "long_term" },
            { id: "opt4_d", text: "I'm mostly focused on getting through the current month.", value: "immediate_needs" }
        ]
    },
    {
        id: "q5_money_emotion",
        text: "What emotion do you most associate with managing your finances?",
        category: "money_emotion",
        options: [
            { id: "opt5_a", text: "Confidence - I feel in control.", value: "confidence" },
            { id: "opt5_b", text: "Anxiety - It's a constant source of stress.", value: "anxiety" },
            { id: "opt5_c", text: "Apathy - I try not to think about it.", value: "apathy" },
            { id: "opt5_d", text: "Curiosity - I'm eager to learn and improve.", value: "curiosity" }
        ]
    }
];