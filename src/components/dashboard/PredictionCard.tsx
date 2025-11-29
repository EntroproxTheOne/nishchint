/**
 * Prediction Card Component
 * Displays ML-powered week-ahead expense forecast
 */

import React from 'react';
import { motion } from 'framer-motion';

interface PredictionCardProps {
  expenseLow: number;
  expenseHigh: number;
  confidence: number;
  message: string;
}

export default function PredictionCard({
  expenseLow,
  expenseHigh,
  confidence,
  message
}: PredictionCardProps) {
  const confidencePercent = Math.round(confidence * 100);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-3xl p-6 shadow-2xl border border-gray-700"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="text-3xl">📊</div>
          <div>
            <h3 className="text-xl font-bold text-white">Agle Hafte</h3>
            <p className="text-xs text-gray-400">Week-ahead forecast</p>
          </div>
        </div>

        {/* Confidence Badge */}
        <motion.div
          className="px-4 py-2 rounded-full text-sm font-bold"
          style={{
            backgroundColor: 'rgba(251, 191, 36, 0.2)',
            color: '#FBBF24'
          }}
          whileHover={{ scale: 1.05 }}
        >
          {confidencePercent}% sure
        </motion.div>
      </div>

      {/* Expense Range */}
      <div className="mb-6">
        <div className="text-center mb-3">
          <motion.div
            className="text-4xl font-bold text-white mb-2"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', delay: 0.3 }}
          >
            ₹{expenseLow.toLocaleString('en-IN')} - ₹{expenseHigh.toLocaleString('en-IN')}
          </motion.div>
          <p className="text-sm text-gray-400">Expected expenses this week</p>
        </div>

        {/* Visual Range Bar */}
        <div className="relative h-3 bg-gray-700 rounded-full overflow-hidden">
          <motion.div
            className="absolute left-0 top-0 h-full rounded-full"
            style={{
              background: 'linear-gradient(90deg, #FBBF24 0%, #F59E0B 100%)'
            }}
            initial={{ width: 0 }}
            animate={{ width: '100%' }}
            transition={{ duration: 1, delay: 0.4 }}
          />

          {/* Confidence indicator */}
          <motion.div
            className="absolute top-1/2 -translate-y-1/2 w-1 h-5 bg-white rounded-full shadow-lg"
            style={{ left: `${confidencePercent}%` }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1 }}
          />
        </div>

        {/* Range labels */}
        <div className="flex justify-between mt-2 text-xs text-gray-500">
          <span>Low</span>
          <span>High</span>
        </div>
      </div>

      {/* Message */}
      <motion.div
        className="bg-gray-800/50 rounded-2xl p-4 border border-gray-700"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
      >
        <p className="text-gray-300 text-center text-sm leading-relaxed">
          {message}
        </p>
      </motion.div>

      {/* ML Badge */}
      <div className="mt-4 flex items-center justify-center gap-2 text-xs text-gray-500">
        <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
        <span>ML-powered forecast</span>
      </div>
    </motion.div>
  );
}
