import React from 'react';
import { Button } from './ui/Button';
import { Card } from './ui/Card';
import { TargetIcon, BrainCircuitIcon, ZapIcon, UserIcon, GenderIcon, ArrowRightIcon } from './ui/Icons';
import { INITIAL_USER_DATA } from '../constants';

interface LandingPageProps {
    onStart: () => void;
}

const FeatureCard: React.FC<{ icon: React.ReactNode; title: string; children: React.ReactNode }> = ({ icon, title, children }) => (
    <div className="bg-red-50/50 dark:bg-red-900/20 p-6 rounded-lg text-center flex flex-col items-center">
        <div className="bg-white dark:bg-gray-700 rounded-full p-3 mb-4 shadow-sm">{icon}</div>
        <h3 className="font-semibold text-gray-800 dark:text-gray-100 mb-2">{title}</h3>
        <p className="text-sm text-gray-600 dark:text-gray-400">{children}</p>
    </div>
);

const LandingPage: React.FC<LandingPageProps> = ({ onStart }) => {
    return (
        <Card className="max-w-2xl mx-auto overflow-hidden">
            <div className="p-8 md:p-10">
                <div className="text-center">
                    <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-2">
                        Welcome to Your Financial Journey
                    </h2>
                    <p className="text-gray-600 dark:text-gray-400 mb-8 max-w-lg mx-auto">
                        Answer a few quick questions and we’ll create a personalized financial profile that understands your unique money personality, goals, and preferences.
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

                <div className="bg-gray-100 dark:bg-gray-700/50 rounded-lg p-4 text-center mb-8">
                    <h4 className="font-semibold text-gray-700 dark:text-gray-300">Demo Mode</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">For this MVP, we'll use sample data:</p>
                    <div className="flex justify-center items-center gap-6 mt-2 text-sm text-gray-700 dark:text-gray-300">
                        <span className="flex items-center gap-2"><UserIcon /> Age: {INITIAL_USER_DATA.age}</span>
                        <span className="flex items-center gap-2"><GenderIcon /> Gender: {INITIAL_USER_DATA.gender}</span>
                    </div>
                </div>

                <div className="text-center">
                    <Button onClick={onStart} size="lg">
                        Start Your Financial Assessment <ArrowRightIcon />
                    </Button>
                </div>
            </div>
        </Card>
    );
};

export default LandingPage;