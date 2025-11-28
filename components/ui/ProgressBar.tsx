
import React from 'react';

interface ProgressBarProps {
    value: number; // value from 0 to 100
}

export const ProgressBar: React.FC<ProgressBarProps> = ({ value }) => {
    const clampedValue = Math.max(0, Math.min(100, value));

    return (
        <div className="w-full bg-gray-700/50 rounded-full h-2.5">
            <div
                className="bg-yellow-400 h-2.5 rounded-full transition-all duration-500 ease-out"
                style={{ width: `${clampedValue}%` }}
            ></div>
        </div>
    );
};
