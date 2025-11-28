import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { MicIcon } from './ui/Icons';
import TypewriterText from './TypewriterText';

interface HomePageProps {
    onMicClick: () => void;
    onQuizClick: () => void;
    isListening: boolean;
}

// CSS for the Quiz Button (inverted mic button style)
const quizButtonStyles = `
.quiz-button {
  font-size: 16px;
  padding: 1em 3.3em;
  cursor: pointer;
  transform: perspective(200px) rotateX(-15deg);
  color: #1a1a1a;
  font-weight: 900;
  border: none;
  border-radius: 5px;
  background: linear-gradient(
    180deg,
    rgba(234, 179, 8, 1) 0%,
    rgba(250, 204, 21, 1) 100%
  );
  box-shadow: rgba(234, 179, 8, 0.2) 0px -40px 29px 0px;
  will-change: transform;
  transition: all 0.3s;
  border-top: 2px solid rgba(202, 138, 4, 1);
}

.quiz-button:hover {
  transform: perspective(180px) rotateX(-30deg) translateY(-2px);
  box-shadow: rgba(234, 179, 8, 0.4) 0px -50px 35px 0px;
}

.quiz-button:active {
  transform: perspective(170px) rotateX(-36deg) translateY(-5px);
}
`;

const HomePage: React.FC<HomePageProps> = ({ onMicClick, onQuizClick, isListening }) => {
    const englishTexts = [
        "Your AI-powered financial personality assessment.",
    ];
    
    const hindiTexts = [
        "कृपया नीचे विवरण दर्ज करें",
    ];

    return (
        <div className="w-full max-w-4xl mx-auto">
            <style>{quizButtonStyles}</style>
            
            <div className="text-center space-y-12">
                {/* Welcome Text */}
                <motion.div 
                    initial={{ opacity: 0, y: 20 }} 
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center mb-8"
                >
                    <h1 className="text-4xl md:text-6xl font-bold mb-6">
                        Welcome to <span className="text-yellow-400">Nischint</span>
                    </h1>
                </motion.div>

                {/* Typewriter Text - English and Hindi in sync */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5 }}
                    className="mb-8 space-y-4"
                >
                    <TypewriterText 
                        texts={englishTexts}
                        typingSpeed={80}
                        deletingSpeed={40}
                        pauseDuration={3000}
                    />
                    <TypewriterText 
                        texts={hindiTexts}
                        typingSpeed={100}
                        deletingSpeed={50}
                        pauseDuration={3000}
                    />
                </motion.div>

                {/* Visualizer */}
                <div className="flex flex-col items-center space-y-8">
                    <div className="h-16 flex items-center space-x-1">
                        {isListening ? (
                            Array.from({ length: 20 }).map((_, i) => (
                                <motion.div
                                    key={i}
                                    className="w-1 bg-yellow-400 rounded-full"
                                    animate={{
                                        height: [10, Math.random() * 50 + 10, 10],
                                        opacity: [0.5, 1, 0.5]
                                    }}
                                    transition={{
                                        duration: 0.5,
                                        repeat: Infinity,
                                        repeatType: "reverse",
                                        delay: i * 0.05
                                    }}
                                />
                            ))
                        ) : (
                            <div className="h-1 w-full bg-gray-800 rounded-full w-64" />
                        )}
                    </div>

                    {/* Mic Button */}
                    <button 
                        className="mic-button flex items-center space-x-3" 
                        onClick={onMicClick}
                        disabled={isListening}
                    >
                        <MicIcon className="w-6 h-6" />
                        <span>{isListening ? 'Listening...' : 'Start Speaking'}</span>
                    </button>

                    {/* Divider */}
                    <div className="flex items-center space-x-4 my-4">
                        <div className="h-px bg-gray-700 w-24"></div>
                        <span className="text-gray-500 text-sm">or</span>
                        <div className="h-px bg-gray-700 w-24"></div>
                    </div>

                    {/* Quiz Button (Inverted) */}
                    <button 
                        className="quiz-button flex items-center space-x-3" 
                        onClick={onQuizClick}
                    >
                        <span>Take Financial Assessment Quiz</span>
                    </button>
                </div>
            </div>
        </div>
    );
};

export default HomePage;

