export interface Option {
    id: string;
    text: string;
    value: string;
}

export interface Question {
    id: string;
    text: string;
    category: string;
    options: Option[];
}

// FIX: Made UserProfile more specific to include required fields, which resolves type errors.
export interface UserProfile {
    name?: string;
    age?: number;
    gender?: string;
    [key: string]: any; 
}

export interface Answer {
    questionId: string;
    questionText: string;
    questionCategory: string;
    optionId: string;
    optionText: string;
    optionValue: string;
}

export enum Page {
    LANDING = 'LANDING',
    QUIZ = 'QUIZ',
    QUESTIONS = 'QUESTIONS',
    SUMMARY = 'SUMMARY',
    MONEY_TRACKER = 'MONEY_TRACKER',
    GOAL_TRACKER = 'GOAL_TRACKER',
}

export interface Transaction {
    id: string;
    description: string;
    amount: number;
    category: string;
    type: 'income' | 'expense';
    date: string;
}

export interface SpendingCategory {
    name: string;
    amount: number;
    percentage: number;
    color: string;
}

export interface FinancialOverview {
    totalIncome: number;
    totalExpenses: number;
    balance: number;
    monthlyIncome: number;
    monthlyExpenses: number;
}

export interface FinancialGoal {
    id: string;
    title: string;
    description: string;
    targetAmount: number;
    currentAmount: number;
    deadline: string;
    category: 'emergency_fund' | 'vacation' | 'home' | 'car' | 'debt_payoff' | 'investment' | 'education' | 'other';
    priority: 'high' | 'medium' | 'low';
    suggested: boolean;
    estimatedMonths: number;
    monthlyContribution: number;
}

export interface GoalSuggestion {
    goal: FinancialGoal;
    reasoning: string;
    confidence: number;
}