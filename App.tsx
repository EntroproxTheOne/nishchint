import React, { useState, useCallback, useEffect } from 'react';
import LandingPage from './components/LandingPage';
import QuestionFlow from './components/QuestionFlow';
import SummaryPage from './components/SummaryPage';
import { Page, UserProfile } from './types';
import { INITIAL_USER_DATA } from './constants';
import { Logo } from './components/ui/Icons';
import { ThemeToggle } from './components/ui/ThemeToggle';

const App: React.FC = () => {
    const [currentPage, setCurrentPage] = useState<Page>(Page.LANDING);
    const [userProfile, setUserProfile] = useState<UserProfile>(INITIAL_USER_DATA);
    const [theme, setTheme] = useState<'light' | 'dark'>(() => {
        if (typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
            return 'dark';
        }
        return 'light';
    });
    
    useEffect(() => {
        if (theme === 'dark') {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
    }, [theme]);

    const [questionFlowKey, setQuestionFlowKey] = useState(Date.now());

    const handleStart = useCallback(() => {
        setUserProfile(INITIAL_USER_DATA);
        setQuestionFlowKey(Date.now()); 
        setCurrentPage(Page.QUESTIONS);
    }, []);

    const handleQuizComplete = useCallback((finalProfile: UserProfile) => {
        setUserProfile(finalProfile);
        setCurrentPage(Page.SUMMARY);
    }, []);

    const handleRestart = useCallback(() => {
        setCurrentPage(Page.LANDING);
    }, []);

    const renderPage = () => {
        switch (currentPage) {
            case Page.LANDING:
                return <LandingPage onStart={handleStart} />;
            case Page.QUESTIONS:
                return <QuestionFlow key={questionFlowKey} onComplete={handleQuizComplete} />;
            case Page.SUMMARY:
                return <SummaryPage userProfile={userProfile} onRestart={handleRestart} onTakeQuizAgain={handleStart} />;
            default:
                return <LandingPage onStart={handleStart} />;
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-gray-200 flex flex-col items-center p-4 selection:bg-red-200 dark:selection:bg-red-800/50 resize overflow-auto" style={{ resize: 'both', minWidth: '320px', minHeight: '100vh' }}>
             <header className="w-full max-w-4xl mx-auto py-6 flex items-center justify-between">
                <div className="flex items-center space-x-3">
                    <Logo />
                    <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-100 tracking-tight">Nischint</h1>
                </div>
                <ThemeToggle theme={theme} setTheme={setTheme} />
            </header>
            <main className="flex-grow flex items-center justify-center w-full">
                {renderPage()}
            </main>
             <footer className="w-full text-center py-4">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                    Aapka sapna, zimmedari humari
                </p>
            </footer>
        </div>
    );
};

export default App;