/**
 * Agent Widget Component
 * Floating chat bubble for agentic financial coaching
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface AgentWidgetProps {
  userId: string;
}

export default function AgentWidget({ userId }: AgentWidgetProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [message, setMessage] = useState('');
  const [chatHistory, setChatHistory] = useState<Array<{ role: 'user' | 'agent'; text: string }>>([]);
  const [loading, setLoading] = useState(false);

  const handleSend = async () => {
    if (!message.trim() || loading) return;

    const userMessage = message.trim();
    setMessage('');
    setChatHistory([...chatHistory, { role: 'user', text: userMessage }]);
    setLoading(true);

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/agent/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: userId, message: userMessage })
      });

      const data = await response.json();

      if (data.success && data.reply) {
        setChatHistory((prev) => [...prev, { role: 'agent', text: data.reply }]);
      } else {
        setChatHistory((prev) => [
          ...prev,
          { role: 'agent', text: 'Sorry bhai, kuch gadbad ho gayi. Phir se try kar!' }
        ]);
      }
    } catch (error) {
      console.error('Agent chat error:', error);
      setChatHistory((prev) => [
        ...prev,
        { role: 'agent', text: 'Network issue hai. Thodi der baad try kar!' }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 20 }}
            transition={{ type: 'spring', damping: 25 }}
            className="absolute bottom-20 right-0 w-80 sm:w-96 bg-gray-900 border border-gray-700 rounded-3xl shadow-2xl overflow-hidden"
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-yellow-500 to-yellow-600 p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-2xl">
                    🤖
                  </div>
                  <div>
                    <h3 className="text-black font-bold text-lg">Nischint Agent</h3>
                    <p className="text-black/70 text-xs">Your financial buddy</p>
                  </div>
                </div>
                <button
                  onClick={() => setIsExpanded(false)}
                  className="text-black/70 hover:text-black transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Chat Messages */}
            <div className="h-64 overflow-y-auto p-4 space-y-3 bg-gray-800/50">
              {chatHistory.length === 0 && (
                <div className="text-center text-gray-500 text-sm mt-8">
                  <p className="mb-2">👋 Namaste!</p>
                  <p>Main Nischint hoon, tera financial buddy.</p>
                  <p className="mt-2 text-xs">Kuch puchna hai?</p>
                </div>
              )}

              {chatHistory.map((msg, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[80%] p-3 rounded-2xl text-sm ${
                      msg.role === 'user'
                        ? 'bg-yellow-500 text-black rounded-br-none'
                        : 'bg-gray-700 text-white rounded-bl-none'
                    }`}
                  >
                    {msg.text}
                  </div>
                </motion.div>
              ))}

              {loading && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex justify-start"
                >
                  <div className="bg-gray-700 text-white p-3 rounded-2xl rounded-bl-none">
                    <div className="flex gap-1">
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                    </div>
                  </div>
                </motion.div>
              )}
            </div>

            {/* Input */}
            <div className="p-4 border-t border-gray-700 bg-gray-900">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Type your message..."
                  disabled={loading}
                  className="flex-1 bg-gray-800 text-white rounded-full px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-500 disabled:opacity-50"
                />
                <button
                  onClick={handleSend}
                  disabled={!message.trim() || loading}
                  className="bg-yellow-500 hover:bg-yellow-600 text-black px-6 py-2 rounded-full font-semibold text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Send
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Button */}
      <motion.button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-16 h-16 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-full shadow-2xl flex items-center justify-center text-4xl hover:scale-110 transition-transform"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
      >
        {isExpanded ? '✕' : '🤖'}
      </motion.button>
    </div>
  );
}
