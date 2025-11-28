import React, { useState, useCallback, useEffect } from 'react';
import { motion, LayoutGroup, AnimatePresence } from 'framer-motion';
import HomePage from './components/HomePage';
import QuizPage from './components/QuizPage';
import QuestionFlow from './components/QuestionFlow';
import SummaryPage from './components/SummaryPage';
import MoneyTracker from './components/MoneyTracker';
import GoalTracker from './components/GoalTracker';
import { Page, UserProfile } from './types';
import { HomeIcon, MoneyIcon, GoalIcon, SettingsIcon } from './components/ui/Icons';

// CSS for the Mic Button (2.0 style)
const buttonStyles = `
.mic-button {
  font-size: 16px;
  padding: 1em 3.3em;
  cursor: pointer;
  transform: perspective(200px) rotateX(15deg);
  color: #1a1a1a;
  font-weight: 900;
  border: none;
  border-radius: 5px;
  background: linear-gradient(
    0deg,
    rgba(234, 179, 8, 1) 0%,
    rgba(250, 204, 21, 1) 100%
  );
  box-shadow: rgba(234, 179, 8, 0.2) 0px 40px 29px 0px;
  will-change: transform;
  transition: all 0.3s;
  border-bottom: 2px solid rgba(202, 138, 4, 1);
}

.mic-button:hover {
  transform: perspective(180px) rotateX(30deg) translateY(2px);
  box-shadow: rgba(234, 179, 8, 0.4) 0px 50px 35px 0px;
}

.mic-button:active {
  transform: perspective(170px) rotateX(36deg) translateY(5px);
}

.mic-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
`;

type TabId = 'money' | 'goal' | 'home';

interface TabItem {
    id: TabId;
    label: string;
    icon: React.FC<{className?: string}>;
}

const TABS_DATA: Record<TabId, TabItem> = {
    money: { id: 'money', label: 'Money Tracker', icon: MoneyIcon },
    goal: { id: 'goal', label: 'Goal Tracker', icon: GoalIcon },
    home: { id: 'home', label: 'Home', icon: HomeIcon },
};

const App: React.FC = () => {
    // 1.0 Features - Page navigation and user data
    const [currentPage, setCurrentPage] = useState<Page>(Page.LANDING);
    const [userProfile, setUserProfile] = useState<UserProfile>({});
    const [questionFlowKey, setQuestionFlowKey] = useState(Date.now());

    // 2.0 Features - Ribbon navigation
    const [leftTabs, setLeftTabs] = useState<TabId[]>(['money', 'goal', 'home']);
    const [activeTab, setActiveTab] = useState<TabId | 'settings' | 'quiz' | 'summary'>('home');
    
    // Mic/voice state
    const [isListening, setIsListening] = useState(false);
    const [showQuizOption, setShowQuizOption] = useState(false);

    // Handle quiz flow (1.0 functionality)
    const handleStart = useCallback((userData: UserProfile) => {
        setUserProfile(userData);
        setQuestionFlowKey(Date.now());
        setCurrentPage(Page.QUESTIONS);
        setActiveTab('quiz');
    }, []);

    const handleQuizPageClick = useCallback(() => {
        setCurrentPage(Page.QUIZ);
        setActiveTab('quiz');
    }, []);

    const handleQuizComplete = useCallback((finalProfile: UserProfile) => {
        setUserProfile(finalProfile);
        setCurrentPage(Page.SUMMARY);
        setActiveTab('summary');
    }, []);

    const handleRestart = useCallback(() => {
        setCurrentPage(Page.LANDING);
        setActiveTab('home');
        setUserProfile({});
    }, []);

    const handleBackToHome = useCallback(() => {
        setCurrentPage(Page.LANDING);
        setActiveTab('home');
    }, []);

    // 2.0 Ribbon navigation handlers
    const handleTabClick = (clickedId: TabId) => {
        if (activeTab === clickedId) return;

        // If currently on a special page (quiz, summary, settings), just switch
        if (['quiz', 'summary', 'settings'].includes(activeTab)) {
            setActiveTab(clickedId);
            if (clickedId === 'money') {
                setCurrentPage(Page.MONEY_TRACKER);
            } else if (clickedId === 'goal') {
                setCurrentPage(Page.GOAL_TRACKER);
            } else if (clickedId === 'home') {
                setCurrentPage(Page.LANDING);
            }
            return;
        }

        // Swap logic for ribbon tabs
        const clickedIndex = leftTabs.indexOf(clickedId);
        const activeIndex = leftTabs.indexOf(activeTab as TabId);

        if (clickedIndex !== -1 && activeIndex !== -1) {
            const newOrder = [...leftTabs];
            newOrder[clickedIndex] = activeTab as TabId;
            newOrder[activeIndex] = clickedId;
            setLeftTabs(newOrder);
        }

        setActiveTab(clickedId);
        
        // Update current page based on tab
        if (clickedId === 'money') {
            setCurrentPage(Page.MONEY_TRACKER);
        } else if (clickedId === 'goal') {
            setCurrentPage(Page.GOAL_TRACKER);
        } else if (clickedId === 'home') {
            setCurrentPage(Page.LANDING);
        }
    };

    const handleSettingsClick = () => {
        setActiveTab('settings');
        // TODO: Implement settings page
    };

    // Mic button handler (2.0 style - for future voice integration)
    const handleMicClick = () => {
        setIsListening(!isListening);
        if (!isListening) {
            // Simulate voice processing
            setTimeout(() => {
                setIsListening(false);
                setShowQuizOption(true);
                // In future: Process voice, extract data, then show quiz option
            }, 3000);
        } else {
            setIsListening(false);
        }
    };

    // Render content based on active tab/page
    const renderContent = () => {
        // Quiz page (separate route)
        if (currentPage === Page.QUIZ) {
            return <QuizPage onStart={handleStart} onBack={handleBackToHome} />;
        }

        // Question flow (during quiz)
        if (activeTab === 'quiz' || currentPage === Page.QUESTIONS) {
            return (
                <QuestionFlow 
                    key={questionFlowKey} 
                    onComplete={handleQuizComplete} 
                    userProfile={userProfile} 
                />
            );
        }

        // Summary page
        if (activeTab === 'summary' || currentPage === Page.SUMMARY) {
            return (
                <SummaryPage 
                    userProfile={userProfile} 
                    onRestart={handleRestart} 
                    onTakeQuizAgain={handleStart} 
                />
            );
        }

        // Regular tab-based navigation
        switch (activeTab) {
            case 'money':
                return <MoneyTracker />;
            case 'goal':
                return <GoalTracker />;
            case 'home':
                return (
                    <HomePage 
                        onMicClick={handleMicClick}
                        onQuizClick={handleQuizPageClick}
                        isListening={isListening}
                    />
                );
            case 'settings':
                return (
                    <div className="text-center">
                        <motion.div 
                            initial={{ opacity: 0 }} 
                            animate={{ opacity: 1 }} 
                            className="text-white text-2xl font-bold"
                        >
                            Settings (Coming Soon)
                        </motion.div>
                        <p className="text-gray-400 mt-4">Settings page will be implemented in TODO #6</p>
                    </div>
                );
            default:
                return (
                    <HomePage 
                        onMicClick={handleMicClick}
                        onQuizClick={handleQuizPageClick}
                        isListening={isListening}
                    />
                );
        }
    };

    return (
        <div className="min-h-screen bg-[#1a1a1a] text-white font-sans selection:bg-yellow-400 selection:text-black overflow-hidden flex flex-col">
            <style>{buttonStyles}</style>

            {/* 2.0 Ribbon Navigation */}
            <header className="w-full p-4 flex justify-between items-center max-w-6xl mx-auto relative z-10">
                <LayoutGroup>
                    <div className="flex items-center space-x-4 bg-gray-800/50 p-2 rounded-2xl backdrop-blur-md border border-white/10">
                        {leftTabs.map((tabId) => {
                            const tab = TABS_DATA[tabId];
                            const isActive = activeTab === tabId;
                            return (
                                <motion.button
                                    key={tabId}
                                    layout
                                    onClick={() => handleTabClick(tabId)}
                                    className={`relative p-3 rounded-xl transition-colors duration-300 ${
                                        isActive ? 'text-black' : 'text-gray-400 hover:text-white'
                                    }`}
                                >
                                    {isActive && (
                                        <motion.div
                                            layoutId="active-bg"
                                            className="absolute inset-0 bg-yellow-400 rounded-xl"
                                            transition={{ type: "spring", stiffness: 300, damping: 30 }}
                                        />
                                    )}
                                    <div className="relative z-10 flex items-center justify-center">
                                        <tab.icon className="w-6 h-6" />
                                    </div>
                                </motion.button>
                            );
                        })}
                    </div>

                    <div className="bg-gray-800/50 p-2 rounded-2xl backdrop-blur-md border border-white/10">
                        <button
                            onClick={handleSettingsClick}
                            className={`p-3 rounded-xl transition-colors duration-300 ${
                                activeTab === 'settings' ? 'bg-yellow-400 text-black' : 'text-gray-400 hover:text-white'
                            }`}
                        >
                            <SettingsIcon className="w-6 h-6" />
                        </button>
                    </div>
                </LayoutGroup>
            </header>

            {/* Main Content Area */}
            <main className="flex-grow flex flex-col items-center justify-center relative overflow-y-auto">
                {/* Background Elements */}
                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                    <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-yellow-500/10 rounded-full blur-3xl" />
                    <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl" />
                </div>

                {/* Content with proper styling for each page */}
                <div className="z-10 w-full">
                    <AnimatePresence mode="wait">
                        {renderContent()}
                    </AnimatePresence>
                </div>
            </main>
        </div>
    );
};

export default App;
