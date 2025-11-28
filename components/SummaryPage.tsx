import React, { useState, useEffect, useCallback } from 'react';
import { jsPDF } from 'jspdf';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { motion } from 'framer-motion';
import { UserProfile } from '../types';
import { summarizeProfile } from '../services/geminiService';
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
        <p className="text-gray-400 text-lg">Generating your financial vibe...</p>
    </div>
);

const toTitleCase = (str: string) => {
    return str.replace(/_/g, ' ').replace(/\w\S*/g, (txt) => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase());
};

const SummaryPage: React.FC<SummaryPageProps> = ({ userProfile, onRestart, onTakeQuizAgain }) => {
    const [summary, setSummary] = useState<string>('');
    const [isLoading, setIsLoading] = useState<boolean>(true);

    const { name, age, gender, ...profileDetails } = userProfile;
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
        <div className="w-full max-w-3xl mx-auto space-y-6 p-6">
            <div className="bg-gray-800/50 backdrop-blur-md border border-white/10 rounded-2xl p-8 text-center">
                 <h2 className="text-3xl font-bold text-white mb-2">
                    {name ? `${name}'s` : 'Your'} Financial Profile
                </h2>
                <p className="text-gray-400">Here's what we discovered about your financial personality.</p>
            </div>

            {isLoading ? (
                <div className="bg-gray-800/50 backdrop-blur-md border border-white/10 rounded-2xl"><LoadingSpinner /></div>
            ) : (
                <>
                    <div className="bg-gray-800/50 backdrop-blur-md border border-white/10 rounded-2xl">
                        <div className="p-8">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="bg-yellow-400/20 p-2 rounded-full"><SparklesIcon className="text-yellow-400" /></div>
                                <h3 className="text-xl font-semibold text-white">AI-Generated Summary</h3>
                            </div>
                             <div className="prose prose-lg text-gray-300 max-w-none prose-headings:text-white prose-strong:text-yellow-400 bg-gray-700/30 p-6 rounded-lg">
                                <ReactMarkdown remarkPlugins={[remarkGfm]}>{summary}</ReactMarkdown>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="bg-gray-800/50 backdrop-blur-md border border-white/10 rounded-2xl">
                             <div className="p-6">
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="bg-yellow-400/20 p-2 rounded-full"><InsightIcon className="text-yellow-400" /></div>
                                    <h3 className="text-xl font-semibold text-white">Key Insights</h3>
                                </div>
                                <div className="space-y-3">
                                    {Object.entries(keyInsights).map(([key, value]) => value && (
                                        <div key={key} className="bg-gray-700/50 p-3 rounded-md text-sm">
                                            <span className="font-semibold text-gray-300">{toTitleCase(key)}: </span>
                                            <span className="text-gray-400">{toTitleCase(String(value))}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                        <div className="bg-gray-800/50 backdrop-blur-md border border-white/10 rounded-2xl">
                             <div className="p-6">
                                 <div className="flex items-center gap-3 mb-4">
                                    <div className="bg-yellow-400/20 p-2 rounded-full"><ProfileIcon className="text-yellow-400" /></div>
                                    <h3 className="text-xl font-semibold text-white">Profile Details</h3>
                                </div>
                                 <div className="space-y-3">
                                     {Object.entries(profileDetails).map(([key, value]) => (
                                        <div key={key} className="bg-gray-700/50 p-3 rounded-md text-sm">
                                            <span className="font-semibold text-gray-300">{toTitleCase(key)}: </span>
                                            <span className="text-gray-400">{toTitleCase(String(value))}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
                         <button 
                            onClick={onTakeQuizAgain} 
                            className="px-6 py-3 bg-gray-700/50 border border-white/10 rounded-xl text-white font-medium hover:bg-gray-700/70 transition-colors"
                        >
                            Take Quiz Again
                        </button>
                        <button 
                            onClick={handleDownloadPdf}
                            className="px-6 py-3 bg-yellow-400 text-black rounded-xl font-medium hover:bg-yellow-500 transition-colors flex items-center gap-2"
                        >
                            <DownloadIcon />
                            Download Profile
                        </button>
                        <button 
                            onClick={onRestart} 
                            className="px-6 py-3 bg-gray-700/50 border border-white/10 rounded-xl text-white font-medium hover:bg-gray-700/70 transition-colors flex items-center gap-2"
                        >
                            <RestartIcon />
                            Start New Assessment
                        </button>
                    </div>
                </>
            )}
        </div>
    );
};

export default SummaryPage;