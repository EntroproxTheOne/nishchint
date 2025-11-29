import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { FinancialGoal, GoalSuggestion, UserProfile } from '../types';
import { GoalIcon } from './ui/Icons';

// Mock user profile data - will be replaced with actual data from database
const mockUserProfile: UserProfile = {
    name: 'George',
    age: 25,
    spending_priority: 'savings_focused',
    risk_tolerance: 'moderate_risk',
    financial_planning: 'strict_budgeter',
    goal_horizon: 'long_term',
    money_emotion: 'confidence',
};

// Mock financial data - will be replaced with actual data
const mockMonthlyIncome = 5000;
const mockMonthlyExpenses = 3000;
const mockSavingsRate = (mockMonthlyIncome - mockMonthlyExpenses) / mockMonthlyIncome;

// Goal categories with icons and colors
const goalCategories = {
    emergency_fund: { label: 'Emergency Fund', color: '#ef4444', icon: '🛡️' },
    vacation: { label: 'Vacation', color: '#3b82f6', icon: '✈️' },
    home: { label: 'Home Purchase', color: '#8b5cf6', icon: '🏠' },
    car: { label: 'Car Purchase', color: '#ec4899', icon: '🚗' },
    debt_payoff: { label: 'Debt Payoff', color: '#f59e0b', icon: '💳' },
    investment: { label: 'Investment', color: '#10b981', icon: '📈' },
    education: { label: 'Education', color: '#06b6d4', icon: '🎓' },
    other: { label: 'Other', color: '#6b7280', icon: '🎯' },
};

// Function to suggest goals based on user profile and financial data
const suggestGoals = (
    userProfile: UserProfile,
    monthlyIncome: number,
    monthlyExpenses: number
): GoalSuggestion[] => {
    const suggestions: GoalSuggestion[] = [];
    const savingsRate = (monthlyIncome - monthlyExpenses) / monthlyIncome;
    const monthlySavings = monthlyIncome - monthlyExpenses;

    // Emergency Fund (always suggested)
    const emergencyFundMonths = 6; // 6 months of expenses
    const emergencyFundTarget = monthlyExpenses * emergencyFundMonths;
    suggestions.push({
        goal: {
            id: 'emergency_fund',
            title: 'Emergency Fund',
            description: `Build a ${emergencyFundMonths}-month emergency fund to cover unexpected expenses`,
            targetAmount: emergencyFundTarget,
            currentAmount: 0,
            deadline: new Date(Date.now() + 12 * 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            category: 'emergency_fund',
            priority: 'high',
            suggested: true,
            estimatedMonths: 12,
            monthlyContribution: monthlySavings * 0.4, // 40% of savings
        },
        reasoning: 'Essential for financial security. Based on your spending patterns, this should be your top priority.',
        confidence: 0.95,
    });

    // Based on spending priority
    if (userProfile.spending_priority === 'debt_reduction') {
        const debtAmount = monthlyExpenses * 12; // Estimate based on expenses
        suggestions.push({
            goal: {
                id: 'debt_payoff',
                title: 'Pay Off Debt',
                description: 'Eliminate high-interest debt to improve your financial health',
                targetAmount: debtAmount,
                currentAmount: 0,
                deadline: new Date(Date.now() + 18 * 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                category: 'debt_payoff',
                priority: 'high',
                suggested: true,
                estimatedMonths: 18,
                monthlyContribution: monthlySavings * 0.5,
            },
            reasoning: 'Your quiz responses indicate debt reduction is a priority. This goal aligns with your financial values.',
            confidence: 0.85,
        });
    }

    // Based on goal horizon
    if (userProfile.goal_horizon === 'long_term') {
        const homeDownPayment = 50000; // Example amount
        suggestions.push({
            goal: {
                id: 'home_purchase',
                title: 'Home Down Payment',
                description: 'Save for a down payment on your first home',
                targetAmount: homeDownPayment,
                currentAmount: 0,
                deadline: new Date(Date.now() + 60 * 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                category: 'home',
                priority: 'medium',
                suggested: true,
                estimatedMonths: 60,
                monthlyContribution: monthlySavings * 0.3,
            },
            reasoning: 'Your long-term focus suggests home ownership is important. Based on your savings rate, this is achievable.',
            confidence: 0.75,
        });
    }

    // Based on risk tolerance
    if (userProfile.risk_tolerance === 'moderate_risk' || userProfile.risk_tolerance === 'high_risk') {
        const investmentTarget = monthlyIncome * 12; // 1 year of income
        suggestions.push({
            goal: {
                id: 'investment',
                title: 'Investment Portfolio',
                description: 'Build a diversified investment portfolio for long-term wealth',
                targetAmount: investmentTarget,
                currentAmount: 0,
                deadline: new Date(Date.now() + 36 * 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                category: 'investment',
                priority: 'medium',
                suggested: true,
                estimatedMonths: 36,
                monthlyContribution: monthlySavings * 0.25,
            },
            reasoning: 'Your risk tolerance indicates you\'re comfortable with investments. This can help grow your wealth over time.',
            confidence: 0.70,
        });
    }

    // Vacation goal (always suggested as medium priority)
    const vacationTarget = monthlyExpenses * 2; // 2 months of expenses
    suggestions.push({
        goal: {
            id: 'vacation',
            title: 'Dream Vacation',
            description: 'Save for a well-deserved vacation',
            targetAmount: vacationTarget,
            currentAmount: 0,
            deadline: new Date(Date.now() + 12 * 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            category: 'vacation',
            priority: 'low',
            suggested: true,
            estimatedMonths: 12,
            monthlyContribution: monthlySavings * 0.1,
        },
        reasoning: 'A balanced approach includes enjoying life. This goal is achievable alongside your other priorities.',
        confidence: 0.60,
    });

    return suggestions;
};

// Mock existing goals (user-created)
const mockExistingGoals: FinancialGoal[] = [
    {
        id: 'goal_1',
        title: 'Emergency Fund',
        description: 'Build 6 months of expenses',
        targetAmount: 18000,
        currentAmount: 8500,
        deadline: '2025-12-31',
        category: 'emergency_fund',
        priority: 'high',
        suggested: false,
        estimatedMonths: 12,
        monthlyContribution: 800,
    },
    {
        id: 'goal_2',
        title: 'New Car',
        description: 'Save for a reliable used car',
        targetAmount: 15000,
        currentAmount: 3200,
        deadline: '2026-06-30',
        category: 'car',
        priority: 'medium',
        suggested: false,
        estimatedMonths: 18,
        monthlyContribution: 650,
    },
];

const GoalTracker: React.FC = () => {
    const [userProfile] = useState<UserProfile>(mockUserProfile);
    const [existingGoals, setExistingGoals] = useState<FinancialGoal[]>(mockExistingGoals);
    const [showSuggestions, setShowSuggestions] = useState(true);

    // Calculate suggested goals
    const suggestedGoals = useMemo(() => {
        return suggestGoals(userProfile, mockMonthlyIncome, mockMonthlyExpenses);
    }, [userProfile]);

    // Format currency
    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
        }).format(amount);
    };

    // Format currency compact for mobile (33000 -> $33k)
    const formatCurrencyCompact = (amount: number) => {
        if (amount >= 1000) {
            return `$${(amount / 1000).toFixed(amount >= 10000 ? 0 : 1)}k`;
        }
        return `$${amount}`;
    };

    // Calculate progress percentage
    const getProgress = (goal: FinancialGoal) => {
        return Math.min((goal.currentAmount / goal.targetAmount) * 100, 100);
    };

    // Calculate days until deadline
    const getDaysUntilDeadline = (deadline: string) => {
        const today = new Date();
        const deadlineDate = new Date(deadline);
        const diffTime = deadlineDate.getTime() - today.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays;
    };

    // Add suggested goal
    const addSuggestedGoal = (suggestion: GoalSuggestion) => {
        setExistingGoals([...existingGoals, suggestion.goal]);
    };

    // Get priority color
    const getPriorityColor = (priority: string) => {
        switch (priority) {
            case 'high':
                return 'text-red-400 bg-red-400/20';
            case 'medium':
                return 'text-yellow-400 bg-yellow-400/20';
            case 'low':
                return 'text-green-400 bg-green-400/20';
            default:
                return 'text-gray-400 bg-gray-400/20';
        }
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
                            <GoalIcon className="w-6 h-6 text-yellow-400" />
                        </div>
                        <h1 className="text-3xl font-bold text-white">Goal Tracker</h1>
                    </div>
                    
                    <button
                        onClick={() => setShowSuggestions(!showSuggestions)}
                        className="px-4 py-2 bg-gray-800/50 border border-white/10 rounded-xl text-sm font-medium text-gray-300 hover:text-white transition-colors"
                    >
                        {showSuggestions ? 'Hide' : 'Show'} Suggestions
                    </button>
                </motion.div>

                {/* Summary Cards */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-6 mb-8">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.1 }}
                        className="bg-gray-800/50 backdrop-blur-md border border-white/10 rounded-2xl p-4 md:p-6"
                    >
                        <div className="text-gray-400 text-xs md:text-sm mb-2">Active Goals</div>
                        <div className="text-2xl md:text-3xl font-bold text-white">
                            {existingGoals.length}
                        </div>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.2 }}
                        className="bg-gray-800/50 backdrop-blur-md border border-white/10 rounded-2xl p-4 md:p-6"
                    >
                        <div className="text-gray-400 text-xs md:text-sm mb-2">Total Target</div>
                        <div className="text-2xl md:text-3xl font-bold text-yellow-400">
                            <span className="md:hidden">
                                {formatCurrencyCompact(existingGoals.reduce((sum, g) => sum + g.targetAmount, 0))}
                            </span>
                            <span className="hidden md:inline">
                                {formatCurrency(existingGoals.reduce((sum, g) => sum + g.targetAmount, 0))}
                            </span>
                        </div>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.3 }}
                        className="bg-gray-800/50 backdrop-blur-md border border-white/10 rounded-2xl p-4 md:p-6"
                    >
                        <div className="text-gray-400 text-xs md:text-sm mb-2">Total Saved</div>
                        <div className="text-2xl md:text-3xl font-bold text-green-400">
                            <span className="md:hidden">
                                {formatCurrencyCompact(existingGoals.reduce((sum, g) => sum + g.currentAmount, 0))}
                            </span>
                            <span className="hidden md:inline">
                                {formatCurrency(existingGoals.reduce((sum, g) => sum + g.currentAmount, 0))}
                            </span>
                        </div>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.4 }}
                        className="bg-gradient-to-br from-yellow-400/20 to-yellow-500/10 backdrop-blur-md border border-yellow-400/30 rounded-2xl p-4 md:p-6"
                    >
                        <div className="text-gray-300 text-xs md:text-sm mb-2">Overall Progress</div>
                        <div className="text-2xl md:text-3xl font-bold text-yellow-400">
                            {Math.round(
                                (existingGoals.reduce((sum, g) => sum + g.currentAmount, 0) /
                                    existingGoals.reduce((sum, g) => sum + g.targetAmount, 0)) * 100
                            )}%
                        </div>
                    </motion.div>
                </div>

                {/* Suggested Goals */}
                {showSuggestions && suggestedGoals.length > 0 && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.5 }}
                        className="bg-gray-800/50 backdrop-blur-md border border-yellow-400/30 rounded-2xl p-6 mb-6"
                    >
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-xl font-bold text-white flex items-center space-x-2">
                                <span className="text-yellow-400">💡</span>
                                <span>AI-Suggested Goals</span>
                            </h2>
                            <span className="text-sm text-gray-400">
                                Based on your quiz responses
                            </span>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {suggestedGoals.map((suggestion, index) => (
                                <motion.div
                                    key={suggestion.goal.id}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 0.6 + index * 0.1 }}
                                    className="bg-gray-700/30 border border-white/10 rounded-xl p-5 hover:bg-gray-700/50 transition-colors"
                                >
                                    <div className="flex items-start justify-between mb-3">
                                        <div className="flex items-center space-x-3">
                                            <span className="text-2xl">
                                                {goalCategories[suggestion.goal.category].icon}
                                            </span>
                                            <div>
                                                <h3 className="text-white font-semibold">
                                                    {suggestion.goal.title}
                                                </h3>
                                                <p className="text-gray-400 text-sm">
                                                    {suggestion.goal.description}
                                                </p>
                                            </div>
                                        </div>
                                        <span className={`px-2 py-1 rounded-lg text-xs font-medium ${getPriorityColor(suggestion.goal.priority)}`}>
                                            {suggestion.goal.priority}
                                        </span>
                                    </div>
                                    
                                    <div className="mb-3">
                                        <div className="flex items-center justify-between text-sm mb-1">
                                            <span className="text-gray-400">Target</span>
                                            <span className="text-white font-medium">
                                                {formatCurrency(suggestion.goal.targetAmount)}
                                            </span>
                                        </div>
                                        <div className="flex items-center justify-between text-sm mb-1">
                                            <span className="text-gray-400">Monthly Contribution</span>
                                            <span className="text-green-400 font-medium">
                                                {formatCurrency(suggestion.goal.monthlyContribution)}
                                            </span>
                                        </div>
                                        <div className="flex items-center justify-between text-sm">
                                            <span className="text-gray-400">Estimated Time</span>
                                            <span className="text-gray-300">
                                                {suggestion.goal.estimatedMonths} months
                                            </span>
                                        </div>
                                    </div>

                                    <p className="text-xs text-gray-400 mb-4 italic">
                                        "{suggestion.reasoning}"
                                    </p>

                                    <button
                                        onClick={() => addSuggestedGoal(suggestion)}
                                        className="w-full px-4 py-2 bg-yellow-400 text-black rounded-lg font-medium hover:bg-yellow-500 transition-colors"
                                    >
                                        Add Goal
                                    </button>
                                </motion.div>
                            ))}
                        </div>
                    </motion.div>
                )}

                {/* Active Goals */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.7 }}
                >
                    <h2 className="text-xl font-bold text-white mb-6">Your Goals</h2>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {existingGoals.map((goal, index) => {
                            const progress = getProgress(goal);
                            const daysLeft = getDaysUntilDeadline(goal.deadline);
                            const category = goalCategories[goal.category];

                            return (
                                <motion.div
                                    key={goal.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.8 + index * 0.1 }}
                                    className="bg-gray-800/50 backdrop-blur-md border border-white/10 rounded-2xl p-6"
                                >
                                    <div className="flex items-start justify-between mb-4">
                                        <div className="flex items-center space-x-3">
                                            <span className="text-3xl">{category.icon}</span>
                                            <div>
                                                <h3 className="text-white font-bold text-lg">
                                                    {goal.title}
                                                </h3>
                                                <p className="text-gray-400 text-sm">
                                                    {goal.description}
                                                </p>
                                            </div>
                                        </div>
                                        <span className={`px-3 py-1 rounded-lg text-xs font-medium ${getPriorityColor(goal.priority)}`}>
                                            {goal.priority}
                                        </span>
                                    </div>

                                    {/* Progress Bar */}
                                    <div className="mb-4">
                                        <div className="flex items-center justify-between text-sm mb-2">
                                            <span className="text-gray-400">Progress</span>
                                            <span className="text-white font-bold">
                                                {progress.toFixed(1)}%
                                            </span>
                                        </div>
                                        <div className="w-full bg-gray-700/50 rounded-full h-3 overflow-hidden">
                                            <motion.div
                                                initial={{ width: 0 }}
                                                animate={{ width: `${progress}%` }}
                                                transition={{ delay: 0.9 + index * 0.1, duration: 0.8 }}
                                                className="h-full rounded-full"
                                                style={{ backgroundColor: category.color }}
                                            />
                                        </div>
                                    </div>

                                    {/* Financial Details */}
                                    <div className="space-y-2 mb-4">
                                        <div className="flex items-center justify-between">
                                            <span className="text-gray-400 text-sm">Saved</span>
                                            <span className="text-green-400 font-semibold">
                                                {formatCurrency(goal.currentAmount)}
                                            </span>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <span className="text-gray-400 text-sm">Target</span>
                                            <span className="text-white font-semibold">
                                                {formatCurrency(goal.targetAmount)}
                                            </span>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <span className="text-gray-400 text-sm">Remaining</span>
                                            <span className="text-yellow-400 font-semibold">
                                                {formatCurrency(goal.targetAmount - goal.currentAmount)}
                                            </span>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <span className="text-gray-400 text-sm">Monthly Contribution</span>
                                            <span className="text-white font-medium">
                                                {formatCurrency(goal.monthlyContribution)}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Deadline */}
                                    <div className="pt-4 border-t border-white/10">
                                        <div className="flex items-center justify-between">
                                            <span className="text-gray-400 text-sm">Deadline</span>
                                            <span className={`font-medium text-sm ${
                                                daysLeft < 30 ? 'text-red-400' :
                                                daysLeft < 90 ? 'text-yellow-400' :
                                                'text-green-400'
                                            }`}>
                                                {daysLeft > 0 ? `${daysLeft} days left` : 'Overdue'}
                                            </span>
                                        </div>
                                    </div>
                                </motion.div>
                            );
                        })}
                    </div>
                </motion.div>
            </div>
        </div>
    );
};

export default GoalTracker;

