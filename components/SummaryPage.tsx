import React, { useState, useEffect, useCallback } from 'react';
import { jsPDF } from 'jspdf';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { motion } from 'framer-motion';
import { UserProfile } from '../types';
import { summarizeProfile } from '../services/geminiService';
import { Card } from './ui/Card';
import { Button } from './ui/Button';
import { DownloadIcon, SparklesIcon, RestartIcon, InsightIcon, ProfileIcon } from './ui/Icons';

interface SummaryPageProps {
    userProfile: UserProfile;
    onRestart: () => void;
    onTakeQuizAgain: () => void;
}

const LoadingSpinner: React.FC = () => (
    <div className="flex flex-col items-center justify-center space-y-4 h-64">
        <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        >
            <SparklesIcon className="h-12 w-12 text-red-500" />
        </motion.div>
        <p className="text-gray-600 dark:text-gray-400 text-lg">Generating your financial vibe...</p>
    </div>
);

const toTitleCase = (str: string) => {
    return str.replace(/_/g, ' ').replace(/\w\S*/g, (txt) => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase());
};

const SummaryPage: React.FC<SummaryPageProps> = ({ userProfile, onRestart, onTakeQuizAgain }) => {
    const [summary, setSummary] = useState<string>('');
    const [isLoading, setIsLoading] = useState<boolean>(true);

    const { age, gender, ...profileDetails } = userProfile;
    const keyInsights = {
        "Primary Focus": profileDetails.spending_priority,
        "Risk Tolerance": profileDetails.risk_tolerance,
        "Planning Style": profileDetails.financial_planning,
        "Emotional Outlook": profileDetails.money_emotion,
    }

    useEffect(() => {
        const getSummary = async () => {
            setIsLoading(true);
            const result = await summarizeProfile(userProfile);
            setSummary(result);
            setIsLoading(false);
        };
        getSummary();
    }, [userProfile]);

    const handleDownloadPdf = useCallback(() => {
        const doc = new jsPDF();
        const margin = 15;
        let y = 20;

        doc.setFont('Helvetica', 'bold');
        doc.setFontSize(22);
        doc.setTextColor(44, 62, 80);
        doc.text("Your Nischint Financial Profile", margin, y);
        y += 15;

        // AI Summary
        doc.setFont('Helvetica', 'bold');
        doc.setFontSize(14);
        doc.text("AI-Generated Summary", margin, y);
        y += 8;
        doc.setFont('Helvetica', 'normal');
        doc.setFontSize(11);
        const summaryText = summary.replace(/###/g, '').replace(/\*/g, ''); // Basic markdown cleanup
        const splitSummary = doc.splitTextToSize(summaryText, 180);
        doc.text(splitSummary, margin, y);
        y += splitSummary.length * 5 + 10;

        // Key Insights
        doc.setFont('Helvetica', 'bold');
        doc.setFontSize(14);
        doc.text("Key Insights", margin, y);
        y += 8;
        doc.setFontSize(11);
        Object.entries(keyInsights).forEach(([key, value]) => {
            if (value) {
                doc.text(`- ${toTitleCase(key)}: ${toTitleCase(String(value))}`, margin, y);
                y += 7;
            }
        });
        y += 5;
        
        // Profile Details
        doc.setFont('Helvetica', 'bold');
        doc.setFontSize(14);
        doc.text("Profile Details", margin, y);
        y += 8;
        doc.setFontSize(11);
        Object.entries(profileDetails).forEach(([key, value]) => {
             doc.text(`- ${toTitleCase(key)}: ${toTitleCase(String(value))}`, margin, y);
             y += 7;
        });

        doc.save('Nischint-Financial-Profile.pdf');
    }, [summary, profileDetails, keyInsights]);

    return (
        <div className="w-full max-w-3xl mx-auto space-y-6">
            <Card className="p-8 text-center">
                 <h2 className="text-3xl font-bold text-gray-800 dark:text-gray-100 mb-2">
                    Your Financial Profile
                </h2>
                <p className="text-gray-600 dark:text-gray-400">Here's what we discovered about your financial personality.</p>
            </Card>

            {isLoading ? (
                <Card><LoadingSpinner /></Card>
            ) : (
                <>
                    <Card>
                        <div className="p-8">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="bg-red-100 dark:bg-red-900/50 p-2 rounded-full"><SparklesIcon /></div>
                                <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-100">AI-Generated Summary</h3>
                            </div>
                             <div className="prose prose-lg text-gray-600 dark:text-gray-200 max-w-none prose-headings:text-gray-800 dark:prose-headings:text-gray-100 prose-strong:text-gray-700 dark:prose-strong:text-white bg-gray-50 dark:bg-gray-800/50 p-6 rounded-lg">
                                <ReactMarkdown remarkPlugins={[remarkGfm]}>{summary}</ReactMarkdown>
                            </div>
                        </div>
                    </Card>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <Card>
                             <div className="p-6">
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="bg-red-100 dark:bg-red-900/50 p-2 rounded-full"><InsightIcon /></div>
                                    <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-100">Key Insights</h3>
                                </div>
                                <div className="space-y-3">
                                    {Object.entries(keyInsights).map(([key, value]) => value && (
                                        <div key={key} className="bg-gray-50 dark:bg-gray-700/50 p-3 rounded-md text-sm">
                                            <span className="font-semibold text-gray-700 dark:text-gray-300">{toTitleCase(key)}: </span>
                                            <span className="text-gray-600 dark:text-gray-400">{toTitleCase(String(value))}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </Card>
                        <Card>
                             <div className="p-6">
                                 <div className="flex items-center gap-3 mb-4">
                                    <div className="bg-red-100 dark:bg-red-900/50 p-2 rounded-full"><ProfileIcon /></div>
                                    <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-100">Profile Details</h3>
                                </div>
                                 <div className="space-y-3">
                                     {Object.entries(profileDetails).map(([key, value]) => (
                                        <div key={key} className="bg-gray-50 dark:bg-gray-700/50 p-3 rounded-md text-sm">
                                            <span className="font-semibold text-gray-700 dark:text-gray-300">{toTitleCase(key)}: </span>
                                            <span className="text-gray-600 dark:text-gray-400">{toTitleCase(String(value))}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </Card>
                    </div>

                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
                         <Button onClick={onTakeQuizAgain} variant='secondary'>
                            Take Quiz Again
                        </Button>
                        <Button onClick={handleDownloadPdf}>
                            <DownloadIcon />
                            Download Profile
                        </Button>
                        <Button onClick={onRestart} variant='secondary'>
                            <RestartIcon />
                            Start New Assessment
                        </Button>
                    </div>
                </>
            )}
        </div>
    );
};

export default SummaryPage;