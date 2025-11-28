import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { TargetIcon, BrainCircuitIcon, ZapIcon, ArrowRightIcon } from './ui/Icons';
import { UserProfile } from '../types';

interface QuizPageProps {
    onStart: (userData: UserProfile) => void;
    onBack?: () => void;
}

const FeatureCard: React.FC<{ icon: React.ReactNode; title: string; children: React.ReactNode }> = ({ icon, title, children }) => (
    <div className="bg-yellow-400/10 border border-yellow-400/20 p-6 rounded-lg text-center flex flex-col items-center">
        <div className="bg-yellow-400/20 rounded-full p-3 mb-4">{icon}</div>
        <h3 className="font-semibold text-white mb-2">{title}</h3>
        <p className="text-sm text-gray-400">{children}</p>
    </div>
);

const QuizPage: React.FC<QuizPageProps> = ({ onStart, onBack }) => {
    const [name, setName] = useState('');
    const [age, setAge] = useState('');
    const [gender, setGender] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const userData: UserProfile = {
            ...(name && { name: name.trim() }),
            ...(age && { age: parseInt(age, 10) }),
            ...(gender && { gender: gender }),
        };
        onStart(userData);
    };

    const canStart = name.trim().length > 0 || age || gender;

    return (
        <div className="w-full max-w-4xl mx-auto p-6">
            {onBack && (
                <motion.button
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    onClick={onBack}
                    className="mb-4 px-4 py-2 bg-gray-800/50 border border-white/10 rounded-xl text-white hover:bg-gray-700/50 transition-colors"
                >
                    ← Back to Home
                </motion.button>
            )}
            <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-gray-800/50 backdrop-blur-md border border-white/10 rounded-2xl p-8 md:p-10"
            >
                <div className="text-center mb-8">
                    <h2 className="text-3xl font-bold text-white mb-2">
                        Welcome to Your Financial Journey
                    </h2>
                    <p className="text-gray-400 max-w-lg mx-auto">
                        Answer a few quick questions and we'll create a personalized financial profile that understands your unique money personality, goals, and preferences.
                    </p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                    <FeatureCard icon={<TargetIcon />} title="Personalized Goals">
                        Understand your financial priorities and create a roadmap
                    </FeatureCard>
                    <FeatureCard icon={<BrainCircuitIcon />} title="Smart Analysis">
                        AI-powered insights into your financial behavior patterns
                    </FeatureCard>
                    <FeatureCard icon={<ZapIcon />} title="Quick & Easy">
                        Complete in under 3 minutes with simple multiple choice
                    </FeatureCard>
                </div>

                <form onSubmit={handleSubmit} className="bg-gray-700/30 border border-white/10 rounded-lg p-6 mb-8">
                    <h4 className="font-semibold text-white mb-4 text-center">
                        Tell Us About Yourself
                    </h4>
                    <div className="space-y-4">
                        <div>
                            <label htmlFor="quiz-name" className="block text-sm font-medium text-gray-300 mb-2">
                                Name <span className="text-yellow-400">*</span>
                            </label>
                            <input
                                id="quiz-name"
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                placeholder="Enter your name"
                                className="w-full px-4 py-2 border border-white/20 rounded-lg focus:ring-2 focus:ring-yellow-400 focus:border-transparent bg-gray-800/50 text-white placeholder-gray-500"
                                required
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label htmlFor="quiz-age" className="block text-sm font-medium text-gray-300 mb-2">
                                    Age
                                </label>
                                <input
                                    id="quiz-age"
                                    type="number"
                                    value={age}
                                    onChange={(e) => setAge(e.target.value)}
                                    placeholder="e.g., 28"
                                    min="1"
                                    max="120"
                                    className="w-full px-4 py-2 border border-white/20 rounded-lg focus:ring-2 focus:ring-yellow-400 focus:border-transparent bg-gray-800/50 text-white placeholder-gray-500"
                                />
                            </div>
                            <div>
                                <label htmlFor="quiz-gender" className="block text-sm font-medium text-gray-300 mb-2">
                                    Gender
                                </label>
                                <select
                                    id="quiz-gender"
                                    value={gender}
                                    onChange={(e) => setGender(e.target.value)}
                                    className="w-full px-4 py-2 border border-white/20 rounded-lg focus:ring-2 focus:ring-yellow-400 focus:border-transparent bg-gray-800/50 text-white"
                                >
                                    <option value="">Select...</option>
                                    <option value="male">Male</option>
                                    <option value="female">Female</option>
                                    <option value="other">Other</option>
                                    <option value="prefer-not-to-say">Prefer not to say</option>
                                </select>
                            </div>
                        </div>
                    </div>
                </form>

                <div className="text-center">
                    <button
                        onClick={handleSubmit}
                        disabled={!canStart}
                        className={`px-8 py-4 bg-yellow-400 text-black rounded-xl font-bold text-lg hover:bg-yellow-500 transition-colors flex items-center gap-2 mx-auto ${
                            !canStart ? 'opacity-50 cursor-not-allowed' : ''
                        }`}
                    >
                        Start Your Financial Assessment
                        <ArrowRightIcon />
                    </button>
                    {!canStart && (
                        <p className="text-sm text-gray-400 mt-2">
                            Please enter at least your name to continue
                        </p>
                    )}
                </div>
            </motion.div>
        </div>
    );
};

export default QuizPage;

