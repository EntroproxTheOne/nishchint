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
    age: number;
    gender: string;
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
    QUESTIONS = 'QUESTIONS',
    SUMMARY = 'SUMMARY',
}