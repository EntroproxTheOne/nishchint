
import React from 'react';

interface CardProps {
    children: React.ReactNode;
    className?: string;
    style?: React.CSSProperties;
}

export const Card: React.FC<CardProps> = ({ children, className = '', style }) => {
    return (
        <div 
            className={`bg-white dark:bg-gray-800 rounded-xl shadow-md dark:shadow-black/20 w-full ${className}`}
            style={style}
        >
            {children}
        </div>
    );
};