import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { SunIcon, MoonIcon } from './Icons';

interface ThemeToggleProps {
    theme: 'light' | 'dark';
    setTheme: (theme: 'light' | 'dark') => void;
}

export const ThemeToggle: React.FC<ThemeToggleProps> = ({ theme, setTheme }) => {
    const toggleTheme = () => {
        setTheme(theme === 'light' ? 'dark' : 'light');
    };

    const iconVariants = {
        hidden: { opacity: 0, scale: 0.5, rotate: -90 },
        visible: { opacity: 1, scale: 1, rotate: 0 },
    };

    return (
        <button
            onClick={toggleTheme}
            className={`relative inline-flex items-center h-8 w-14 rounded-full transition-colors duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-red-500/50 focus:ring-offset-2 dark:focus:ring-offset-gray-900 ring-1 ring-inset ring-red-400/80 ${theme === 'light' ? 'bg-blue-100' : 'bg-gray-700'}`}
            aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
        >
            <motion.span
                layout
                transition={{ type: 'spring', stiffness: 700, damping: 30 }}
                className="absolute top-1 left-1 h-6 w-6 rounded-full bg-white shadow-md flex items-center justify-center overflow-hidden"
                style={{
                    transform: theme === 'light' ? 'translateX(24px)' : 'translateX(0px)',
                }}
            >
                <AnimatePresence initial={false} mode="wait">
                    <motion.div
                        key={theme}
                        variants={iconVariants}
                        initial="hidden"
                        animate="visible"
                        exit="hidden"
                        transition={{ duration: 0.2 }}
                        className="flex items-center justify-center"
                    >
                        {theme === 'light' ? <SunIcon /> : <MoonIcon />}
                    </motion.div>
                </AnimatePresence>
            </motion.span>
        </button>
    );
};