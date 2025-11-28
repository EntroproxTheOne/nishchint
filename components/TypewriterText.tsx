import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface TypewriterTextProps {
    texts: string[];
    typingSpeed?: number;
    deletingSpeed?: number;
    pauseDuration?: number;
}

const TypewriterText: React.FC<TypewriterTextProps> = ({
    texts,
    typingSpeed = 100,
    deletingSpeed = 50,
    pauseDuration = 2000,
}) => {
    const [currentTextIndex, setCurrentTextIndex] = useState(0);
    const [currentText, setCurrentText] = useState('');
    const [isDeleting, setIsDeleting] = useState(false);
    const [isPaused, setIsPaused] = useState(false);

    useEffect(() => {
        if (isPaused) {
            const pauseTimer = setTimeout(() => {
                setIsPaused(false);
                setIsDeleting(true);
            }, pauseDuration);
            return () => clearTimeout(pauseTimer);
        }

        const currentFullText = texts[currentTextIndex];
        const speed = isDeleting ? deletingSpeed : typingSpeed;

        const timer = setTimeout(() => {
            if (!isDeleting) {
                // Typing
                if (currentText.length < currentFullText.length) {
                    setCurrentText(currentFullText.slice(0, currentText.length + 1));
                } else {
                    // Finished typing, pause then delete
                    setIsPaused(true);
                }
            } else {
                // Deleting
                if (currentText.length > 0) {
                    setCurrentText(currentText.slice(0, -1));
                } else {
                    // Finished deleting, move to next text
                    setIsDeleting(false);
                    setCurrentTextIndex((prev) => (prev + 1) % texts.length);
                }
            }
        }, speed);

        return () => clearTimeout(timer);
    }, [currentText, isDeleting, isPaused, currentTextIndex, texts, typingSpeed, deletingSpeed, pauseDuration]);

    return (
        <div className="text-center">
            <motion.span
                key={currentTextIndex}
                className="text-2xl md:text-3xl font-bold text-white"
            >
                {currentText}
                <motion.span
                    animate={{ opacity: [1, 0] }}
                    transition={{ duration: 0.8, repeat: Infinity, repeatType: "reverse" }}
                    className="inline-block w-1 h-8 bg-yellow-400 ml-1"
                />
            </motion.span>
        </div>
    );
};

export default TypewriterText;

