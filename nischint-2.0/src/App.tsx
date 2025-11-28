import React, { useState, useEffect } from 'react';
import { motion, LayoutGroup } from 'framer-motion';
import { HomeIcon, MoneyIcon, GoalIcon, SettingsIcon, MicIcon } from './components/ui/Icons';

// CSS for the Mic Button (adapted to Neon Yellow)
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

export default function App() {
    // Initial order: Money, Goal, Home (with Home active)
    // Or maybe just Money, Goal, Home.
    // Let's start with [Money, Goal, Home] and Home is Active.
    const [leftTabs, setLeftTabs] = useState<TabId[]>(['money', 'goal', 'home']);
    const [activeTab, setActiveTab] = useState<TabId | 'settings'>('home');
    
    // Visualizer state
    const [isListening, setIsListening] = useState(false);

    const handleTabClick = (clickedId: TabId) => {
        if (activeTab === clickedId) return;

        // If currently on settings, just switch back to the clicked tab (no swap needed if it was already in the list?)
        // Or if we were on settings, we just highlight the new one.
        if (activeTab === 'settings') {
            setActiveTab(clickedId);
            return;
        }

        // Swap logic:
        // Find index of clicked tab
        const clickedIndex = leftTabs.indexOf(clickedId);
        // Find index of currently active tab
        const activeIndex = leftTabs.indexOf(activeTab as TabId);

        if (clickedIndex !== -1 && activeIndex !== -1) {
            const newOrder = [...leftTabs];
            // Swap
            newOrder[clickedIndex] = activeTab as TabId;
            newOrder[activeIndex] = clickedId;
            
            setLeftTabs(newOrder);
        }
        
        setActiveTab(clickedId);
    };

    const handleSettingsClick = () => {
        setActiveTab('settings');
    };

    const handleMicClick = () => {
        setIsListening(!isListening);
        // Simulate processing
        if (!isListening) {
            setTimeout(() => {
                setIsListening(false);
                alert("Demo: Voice processed! (Simulated)");
            }, 3000);
        }
    };

    return (
        <div className="min-h-screen bg-[#1a1a1a] text-white font-sans selection:bg-yellow-400 selection:text-black overflow-hidden flex flex-col">
            <style>{buttonStyles}</style>

            {/* Ribbon Navigation */}
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
            <main className="flex-grow flex flex-col items-center justify-center relative">
                {/* Background Elements */}
                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                    <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-yellow-500/10 rounded-full blur-3xl" />
                    <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl" />
                </div>

                <div className="z-10 text-center space-y-12">
                    
                    {/* Content Switcher */}
                    <div className="min-h-[200px] flex items-center justify-center">
                        {activeTab === 'home' && (
                            <motion.div initial={{opacity: 0, y: 20}} animate={{opacity: 1, y: 0}} exit={{opacity: 0}} className="text-center">
                                <h1 className="text-4xl md:text-6xl font-bold mb-4">
                                    Welcome to <span className="text-yellow-400">Nischint</span>
                                </h1>
                                <p className="text-gray-400 text-lg max-w-md mx-auto">
                                    Your AI-powered financial personality assessment.
                                </p>
                            </motion.div>
                        )}
                        {activeTab === 'money' && (
                            <motion.div initial={{opacity: 0}} animate={{opacity: 1}} className="text-yellow-400 text-2xl font-bold">
                                Money Tracker Dashboard
                            </motion.div>
                        )}
                        {activeTab === 'goal' && (
                            <motion.div initial={{opacity: 0}} animate={{opacity: 1}} className="text-yellow-400 text-2xl font-bold">
                                Goal Tracker Graphs
                            </motion.div>
                        )}
                        {activeTab === 'settings' && (
                            <motion.div initial={{opacity: 0}} animate={{opacity: 1}} className="text-white text-2xl font-bold">
                                User Settings
                            </motion.div>
                        )}
                    </div>

                    {/* Mic Section */}
                    <div className="flex flex-col items-center space-y-8">
                        
                        {/* Visualizer (Stylistic) */}
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

                        {/* Neon Mic Button */}
                        <button className="mic-button flex items-center space-x-3" onClick={handleMicClick}>
                            <MicIcon className="w-6 h-6" />
                            <span>{isListening ? 'Listening...' : 'Start Speaking'}</span>
                        </button>

                    </div>
                </div>
            </main>
        </div>
    );
}

