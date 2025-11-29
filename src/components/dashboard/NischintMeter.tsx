/**
 * Nischint Meter - HERO Component
 * Animated semi-circle gauge showing Safe-to-Spend amount
 */

import React from 'react';
import { motion } from 'framer-motion';

interface NischintMeterProps {
  safeToSpend: number;
  maxAmount?: number;
  riskLevel: 'green' | 'yellow' | 'red';
}

const RISK_COLORS = {
  green: '#10B981', // Emerald
  yellow: '#F59E0B', // Amber
  red: '#EF4444' // Red
};

const RISK_EMOJIS = {
  green: '😊',
  yellow: '😐',
  red: '😰'
};

const RISK_MESSAGES = {
  green: 'Kharcha kar sakta hai!',
  yellow: 'Thoda sambhal ke',
  red: 'Careful bhai!'
};

export default function NischintMeter({
  safeToSpend,
  maxAmount = 10000,
  riskLevel
}: NischintMeterProps) {
  // Calculate needle rotation (-90deg to 90deg)
  const progress = Math.min(Math.max(safeToSpend / maxAmount, 0), 1);
  const rotation = -90 + progress * 180;

  const color = RISK_COLORS[riskLevel];

  return (
    <div className="relative w-full max-w-md mx-auto">
      {/* Card Container */}
      <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-3xl p-8 shadow-2xl border border-gray-700">
        {/* Title */}
        <div className="text-center mb-4">
          <h2 className="text-gray-400 text-sm font-medium uppercase tracking-wider">
            Nischint Meter
          </h2>
          <p className="text-gray-500 text-xs mt-1">{RISK_MESSAGES[riskLevel]}</p>
        </div>

        {/* Gauge Container */}
        <div className="relative w-full" style={{ height: '160px' }}>
          {/* SVG Gauge Arc */}
          <svg
            viewBox="0 0 200 120"
            className="w-full h-full"
            style={{ overflow: 'visible' }}
          >
            {/* Background arc */}
            <path
              d="M 20 100 A 80 80 0 0 1 180 100"
              fill="none"
              stroke="#1F2937"
              strokeWidth="18"
              strokeLinecap="round"
            />

            {/* Red zone (left third) */}
            <path
              d="M 20 100 A 80 80 0 0 1 66.67 35"
              fill="none"
              stroke={RISK_COLORS.red}
              strokeWidth="18"
              strokeLinecap="round"
              opacity="0.3"
            />

            {/* Yellow zone (middle third) */}
            <path
              d="M 66.67 35 A 80 80 0 0 1 133.33 35"
              fill="none"
              stroke={RISK_COLORS.yellow}
              strokeWidth="18"
              strokeLinecap="round"
              opacity="0.3"
            />

            {/* Green zone (right third) */}
            <path
              d="M 133.33 35 A 80 80 0 0 1 180 100"
              fill="none"
              stroke={RISK_COLORS.green}
              strokeWidth="18"
              strokeLinecap="round"
              opacity="0.3"
            />

            {/* Active progress arc */}
            <motion.path
              d={`M 20 100 A 80 80 0 ${progress > 0.5 ? '1' : '0'} 1 ${
                100 + 80 * Math.cos((-90 + progress * 180) * (Math.PI / 180))
              } ${100 + 80 * Math.sin((-90 + progress * 180) * (Math.PI / 180))}`}
              fill="none"
              stroke={color}
              strokeWidth="18"
              strokeLinecap="round"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 1.5, ease: 'easeOut' }}
            />
          </svg>

          {/* Animated Needle */}
          <motion.div
            className="absolute bottom-0 left-1/2 origin-bottom"
            style={{
              width: '4px',
              height: '70px',
              marginLeft: '-2px',
              transformOrigin: 'bottom center'
            }}
            initial={{ rotate: -90 }}
            animate={{ rotate: rotation }}
            transition={{
              type: 'spring',
              stiffness: 80,
              damping: 15,
              mass: 1
            }}
          >
            {/* Needle stick */}
            <div
              className="w-full h-full rounded-full"
              style={{ backgroundColor: color }}
            />

            {/* Needle dot */}
            <motion.div
              className="absolute -top-3 left-1/2 w-6 h-6 rounded-full border-4 border-white shadow-lg"
              style={{
                backgroundColor: color,
                marginLeft: '-12px'
              }}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.5 }}
            />
          </motion.div>

          {/* Center pivot */}
          <div
            className="absolute bottom-0 left-1/2 w-4 h-4 rounded-full bg-gray-700 border-2 border-gray-600"
            style={{ marginLeft: '-8px', marginBottom: '-8px' }}
          />
        </div>

        {/* Amount Display - BELOW the gauge, clearly separated */}
        <div className="text-center mt-6">
          <motion.div
            className="text-6xl font-bold mb-2 tabular-nums"
            style={{ color }}
            key={safeToSpend}
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 200 }}
          >
            ₹{safeToSpend.toLocaleString('en-IN')}
          </motion.div>
          <div className="text-base text-gray-400 font-medium flex items-center gap-2 justify-center">
            <span>Safe to Spend</span>
            <span className="text-2xl">{RISK_EMOJIS[riskLevel]}</span>
          </div>
        </div>

        {/* Risk Level Indicator */}
        <div className="mt-6 flex items-center justify-between px-2">
          <div className="text-xs text-gray-500">Low</div>
          <div
            className="px-4 py-2 rounded-full text-xs font-semibold uppercase tracking-wider"
            style={{
              backgroundColor: `${color}20`,
              color: color
            }}
          >
            {riskLevel === 'green'
              ? 'Safe Zone'
              : riskLevel === 'yellow'
              ? 'Caution'
              : 'Danger'}
          </div>
          <div className="text-xs text-gray-500">High</div>
        </div>
      </div>
    </div>
  );
}
