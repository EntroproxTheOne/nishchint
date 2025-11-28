import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Transaction, SpendingCategory, FinancialOverview } from '../types';
import { MoneyIcon } from './ui/Icons';

// Mock data - will be replaced with database data later
const mockTransactions: Transaction[] = [
    { id: '1', description: 'Salary', amount: 5000, category: 'Income', type: 'income', date: '2025-01-15' },
    { id: '2', description: 'Grocery Shopping', amount: -150, category: 'Food', type: 'expense', date: '2025-01-14' },
    { id: '3', description: 'Rent', amount: -1200, category: 'Housing', type: 'expense', date: '2025-01-10' },
    { id: '4', description: 'Freelance Work', amount: 800, category: 'Income', type: 'income', date: '2025-01-12' },
    { id: '5', description: 'Restaurant', amount: -45, category: 'Food', type: 'expense', date: '2025-01-13' },
    { id: '6', description: 'Transportation', amount: -80, category: 'Transport', type: 'expense', date: '2025-01-11' },
    { id: '7', description: 'Utilities', amount: -120, category: 'Housing', type: 'expense', date: '2025-01-09' },
    { id: '8', description: 'Entertainment', amount: -60, category: 'Entertainment', type: 'expense', date: '2025-01-08' },
];

const categoryColors: Record<string, string> = {
    'Income': '#eab308',
    'Food': '#ef4444',
    'Housing': '#3b82f6',
    'Transport': '#8b5cf6',
    'Entertainment': '#ec4899',
    'Other': '#6b7280',
};

const MoneyTracker: React.FC = () => {
    const [transactions] = useState<Transaction[]>(mockTransactions);
    const [selectedPeriod, setSelectedPeriod] = useState<'week' | 'month' | 'year'>('month');

    // Calculate financial overview
    const overview: FinancialOverview = useMemo(() => {
        const income = transactions
            .filter(t => t.type === 'income')
            .reduce((sum, t) => sum + t.amount, 0);
        
        const expenses = Math.abs(transactions
            .filter(t => t.type === 'expense')
            .reduce((sum, t) => sum + t.amount, 0));
        
        return {
            totalIncome: income,
            totalExpenses: expenses,
            balance: income - expenses,
            monthlyIncome: income,
            monthlyExpenses: expenses,
        };
    }, [transactions]);

    // Calculate spending by category
    const spendingCategories: SpendingCategory[] = useMemo(() => {
        const categoryMap = new Map<string, number>();
        
        transactions
            .filter(t => t.type === 'expense')
            .forEach(t => {
                const current = categoryMap.get(t.category) || 0;
                categoryMap.set(t.category, current + Math.abs(t.amount));
            });

        const total = Array.from(categoryMap.values()).reduce((sum, val) => sum + val, 0);
        
        return Array.from(categoryMap.entries())
            .map(([name, amount]) => ({
                name,
                amount,
                percentage: total > 0 ? (amount / total) * 100 : 0,
                color: categoryColors[name] || categoryColors['Other'],
            }))
            .sort((a, b) => b.amount - a.amount);
    }, [transactions]);

    // Format currency
    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
        }).format(amount);
    };

    // Format date
    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
        });
    };

    return (
        <div className="min-h-screen bg-[#1a1a1a] text-white p-6">
            <div className="max-w-7xl mx-auto space-y-6">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center justify-between mb-8"
                >
                    <div className="flex items-center space-x-3">
                        <div className="bg-yellow-400/20 p-3 rounded-xl">
                            <MoneyIcon className="w-6 h-6 text-yellow-400" />
                        </div>
                        <h1 className="text-3xl font-bold text-white">Money Tracker</h1>
                    </div>
                    
                    {/* Period Selector */}
                    <div className="flex items-center space-x-2 bg-gray-800/50 p-1 rounded-xl border border-white/10">
                        {(['week', 'month', 'year'] as const).map((period) => (
                            <button
                                key={period}
                                onClick={() => setSelectedPeriod(period)}
                                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                                    selectedPeriod === period
                                        ? 'bg-yellow-400 text-black'
                                        : 'text-gray-400 hover:text-white'
                                }`}
                            >
                                {period.charAt(0).toUpperCase() + period.slice(1)}
                            </button>
                        ))}
                    </div>
                </motion.div>

                {/* Financial Overview Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.1 }}
                        className="bg-gray-800/50 backdrop-blur-md border border-white/10 rounded-2xl p-6"
                    >
                        <div className="text-gray-400 text-sm mb-2">Total Income</div>
                        <div className="text-3xl font-bold text-green-400">
                            {formatCurrency(overview.totalIncome)}
                        </div>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.2 }}
                        className="bg-gray-800/50 backdrop-blur-md border border-white/10 rounded-2xl p-6"
                    >
                        <div className="text-gray-400 text-sm mb-2">Total Expenses</div>
                        <div className="text-3xl font-bold text-red-400">
                            {formatCurrency(overview.totalExpenses)}
                        </div>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.3 }}
                        className="bg-gradient-to-br from-yellow-400/20 to-yellow-500/10 backdrop-blur-md border border-yellow-400/30 rounded-2xl p-6"
                    >
                        <div className="text-gray-300 text-sm mb-2">Balance</div>
                        <div className={`text-3xl font-bold ${
                            overview.balance >= 0 ? 'text-yellow-400' : 'text-red-400'
                        }`}>
                            {formatCurrency(overview.balance)}
                        </div>
                    </motion.div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Spending Categories Chart */}
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.4 }}
                        className="bg-gray-800/50 backdrop-blur-md border border-white/10 rounded-2xl p-6"
                    >
                        <h2 className="text-xl font-bold mb-6 text-white">Spending by Category</h2>
                        <div className="space-y-4">
                            {spendingCategories.map((category, index) => (
                                <div key={category.name} className="space-y-2">
                                    <div className="flex items-center justify-between text-sm">
                                        <div className="flex items-center space-x-3">
                                            <div
                                                className="w-4 h-4 rounded-full"
                                                style={{ backgroundColor: category.color }}
                                            />
                                            <span className="text-gray-300">{category.name}</span>
                                        </div>
                                        <div className="flex items-center space-x-3">
                                            <span className="text-white font-medium">
                                                {formatCurrency(category.amount)}
                                            </span>
                                            <span className="text-gray-400 w-12 text-right">
                                                {category.percentage.toFixed(1)}%
                                            </span>
                                        </div>
                                    </div>
                                    <div className="w-full bg-gray-700/50 rounded-full h-2 overflow-hidden">
                                        <motion.div
                                            initial={{ width: 0 }}
                                            animate={{ width: `${category.percentage}%` }}
                                            transition={{ delay: 0.5 + index * 0.1, duration: 0.5 }}
                                            className="h-full rounded-full"
                                            style={{ backgroundColor: category.color }}
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </motion.div>

                    {/* Transaction History */}
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.5 }}
                        className="bg-gray-800/50 backdrop-blur-md border border-white/10 rounded-2xl p-6"
                    >
                        <h2 className="text-xl font-bold mb-6 text-white">Recent Transactions</h2>
                        <div className="space-y-3 max-h-96 overflow-y-auto">
                            {transactions
                                .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                                .map((transaction) => (
                                    <motion.div
                                        key={transaction.id}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className="flex items-center justify-between p-4 bg-gray-700/30 rounded-xl hover:bg-gray-700/50 transition-colors"
                                    >
                                        <div className="flex items-center space-x-4 flex-1">
                                            <div
                                                className="w-10 h-10 rounded-full flex items-center justify-center"
                                                style={{
                                                    backgroundColor: `${categoryColors[transaction.category] || categoryColors['Other']}20`,
                                                }}
                                            >
                                                <span className="text-xs font-bold" style={{ color: categoryColors[transaction.category] || categoryColors['Other'] }}>
                                                    {transaction.category.charAt(0)}
                                                </span>
                                            </div>
                                            <div className="flex-1">
                                                <div className="text-white font-medium">
                                                    {transaction.description}
                                                </div>
                                                <div className="text-gray-400 text-sm">
                                                    {formatDate(transaction.date)} • {transaction.category}
                                                </div>
                                            </div>
                                        </div>
                                        <div className={`text-lg font-bold ${
                                            transaction.type === 'income' ? 'text-green-400' : 'text-red-400'
                                        }`}>
                                            {transaction.type === 'income' ? '+' : '-'}
                                            {formatCurrency(Math.abs(transaction.amount))}
                                        </div>
                                    </motion.div>
                                ))}
                        </div>
                    </motion.div>
                </div>

                {/* Simple Chart Visualization */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 }}
                    className="bg-gray-800/50 backdrop-blur-md border border-white/10 rounded-2xl p-6"
                >
                    <h2 className="text-xl font-bold mb-6 text-white">Income vs Expenses</h2>
                    <div className="flex items-end justify-between h-64 space-x-2">
                        {transactions.slice(0, 7).map((transaction, index) => {
                            const height = Math.abs(transaction.amount) / 50; // Scale factor
                            const isIncome = transaction.type === 'income';
                            
                            return (
                                <div key={transaction.id} className="flex-1 flex flex-col items-center space-y-2">
                                    <div className="relative w-full flex items-end justify-center h-48">
                                        <motion.div
                                            initial={{ height: 0 }}
                                            animate={{ height: `${Math.min(height, 100)}%` }}
                                            transition={{ delay: 0.7 + index * 0.1, duration: 0.5 }}
                                            className={`w-full rounded-t-lg ${
                                                isIncome ? 'bg-green-400' : 'bg-red-400'
                                            }`}
                                            style={{ minHeight: '4px' }}
                                        />
                                    </div>
                                    <div className="text-xs text-gray-400 text-center">
                                        {formatDate(transaction.date).split(' ')[1]}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </motion.div>
            </div>
        </div>
    );
};

export default MoneyTracker;

