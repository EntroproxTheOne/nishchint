import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Question, UserProfile, Answer, Option } from '../types';
import { generateQuestions } from '../services/geminiService';
import { TOTAL_QUESTIONS, INITIAL_QUESTIONS } from '../constants';
import { ProgressBar } from './ui/ProgressBar';
import { NischintLoadingIcon } from './ui/Icons';

const LoadingSpinner: React.FC = () => (
    <div className="absolute inset-0 flex flex-col items-center justify-center space-y-4 bg-white rounded-2xl">
         <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
        >
            <NischintLoadingIcon className="h-12 w-12 text-yellow-400" />
        </motion.div>
        <p className="text-gray-700 text-lg">Nischint is crafting your next questions...</p>
    </div>
);

interface QuestionFlowProps {
    onComplete: (finalProfile: UserProfile) => void;
    userProfile?: UserProfile;
}

const QuestionFlow: React.FC<QuestionFlowProps> = ({ onComplete, userProfile: initialUserProfile = {} }) => {
    const [questions, setQuestions] = useState<Question[]>(INITIAL_QUESTIONS);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [userProfile, setUserProfile] = useState<UserProfile>(initialUserProfile);
    const [allAnswers, setAllAnswers] = useState<Answer[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [direction, setDirection] = useState(1);
    const [batchNumber, setBatchNumber] = useState(1);

    const fetchNextBatch = useCallback(async (currentAnswers: Answer[]) => {
        setIsLoading(true);
        const nextBatchNumber = batchNumber + 1;
        setBatchNumber(nextBatchNumber);
        
        const newQuestions = await generateQuestions(currentAnswers, userProfile, nextBatchNumber);

        if (newQuestions.length === 0) {
            onComplete(userProfile);
        } else {
            setQuestions(newQuestions);
            setCurrentIndex(0);
            setIsLoading(false);
        }
    }, [onComplete, userProfile, batchNumber]);

    const handleAnswerSelect = useCallback(async (question: Question, option: Option) => {
        const newAnswer: Answer = {
            questionId: question.id,
            questionText: question.text,
            questionCategory: question.category,
            optionId: option.id,
            optionText: option.text,
            optionValue: option.value,
        };

        const newAllAnswers = [...allAnswers, newAnswer];
        setAllAnswers(newAllAnswers);
        
        const newProfile = { ...userProfile, [question.category]: option.value };
        setUserProfile(newProfile);

        setDirection(1);

        const isLastInBatch = (newAllAnswers.length % 5) === 0;

        if (newAllAnswers.length >= TOTAL_QUESTIONS) {
            onComplete(newProfile);
            return;
        }

        if (isLastInBatch) {
            // Use all answers for context, not just the last batch's.
            fetchNextBatch(newAllAnswers);
        } else {
            setCurrentIndex(prev => prev + 1);
        }
    }, [currentIndex, userProfile, allAnswers, onComplete, fetchNextBatch]);
    
    const handleKeyDown = (e: React.KeyboardEvent<HTMLButtonElement>, question: Question, option: Option) => {
        if (e.key === 'Enter') {
            handleAnswerSelect(question, option);
        }
    };

    const progress = (allAnswers.length / TOTAL_QUESTIONS) * 100;

    const currentQuestion = questions[currentIndex];

    const variants = {
        enter: (direction: number) => ({
            x: direction > 0 ? '100%' : '-100%',
            opacity: 0,
        }),
        center: {
            x: 0,
            opacity: 1,
        },
        exit: (direction: number) => ({
            x: direction < 0 ? '100%' : '-100%',
            opacity: 0,
        }),
    };

    return (
        <div className="w-full max-w-2xl mx-auto p-6">
            <ProgressBar value={progress} />
            <div className="mt-4 overflow-hidden relative bg-white rounded-2xl shadow-2xl" style={{ minHeight: '420px' }}>
                 {isLoading || !currentQuestion ? <LoadingSpinner /> : (
                    <AnimatePresence initial={false} custom={direction}>
                        <motion.div
                            key={currentQuestion.id}
                            custom={direction}
                            variants={variants}
                            initial="enter"
                            animate="center"
                            exit="exit"
                            transition={{
                                x: { type: "spring", stiffness: 300, damping: 30 },
                                opacity: { duration: 0.2 }
                            }}
                            className="absolute top-0 left-0 w-full h-full p-6 md:p-8 flex flex-col justify-center"
                        >
                            <h2 className="text-2xl font-semibold text-gray-900 mb-8 text-center break-words">
                                {currentQuestion.text}
                            </h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {currentQuestion.options.map((option) => (
                                    <button
                                        key={option.id}
                                        onClick={() => handleAnswerSelect(currentQuestion, option)}
                                        onKeyDown={(e) => handleKeyDown(e, currentQuestion, option)}
                                        className="w-full text-left p-4 bg-gray-200 rounded-xl hover:bg-gray-300 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:ring-offset-2 transition-all duration-200"
                                    >
                                        <span className="font-medium text-gray-900 break-words">{option.text}</span>
                                    </button>
                                ))}
                            </div>
                        </motion.div>
                    </AnimatePresence>
                 )}
            </div>
        </div>
    );
};

export default QuestionFlow;