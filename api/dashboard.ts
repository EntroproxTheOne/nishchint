/**
 * Dashboard API Endpoint
 * Powers the Nischint Meter and entire dashboard view
 * GET /api/dashboard?userId=xxx
 */

import { VercelRequest, VercelResponse } from '@vercel/node';
import { supabase } from '../lib/supabase';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Only allow GET requests
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const userId = req.query.userId as string;

  if (!userId) {
    return res.status(400).json({ error: 'userId parameter required' });
  }

  try {
    // Fetch all dashboard data in parallel
    const [transactionsResult, goalsResult, predictionResult] = await Promise.all([
      // Last 30 days of transactions
      supabase
        .from('transactions')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(30),

      // Active goals
      supabase
        .from('goals')
        .select('*')
        .eq('user_id', userId)
        .eq('is_active', true),

      // Latest prediction
      supabase
        .from('predictions')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(1)
    ]);

    // Handle errors
    if (transactionsResult.error) {
      console.error('Transactions error:', transactionsResult.error);
      return res.status(500).json({ error: 'Failed to fetch transactions' });
    }

    if (goalsResult.error) {
      console.error('Goals error:', goalsResult.error);
      return res.status(500).json({ error: 'Failed to fetch goals' });
    }

    // Prediction error is non-critical
    if (predictionResult.error) {
      console.warn('Prediction error:', predictionResult.error);
    }

    const transactions = transactionsResult.data || [];
    const goals = goalsResult.data || [];
    const prediction = predictionResult.data?.[0] || null;

    // Calculate financial metrics
    const totalIncome = transactions
      .filter((t) => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);

    const totalExpense = transactions
      .filter((t) => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);

    const balance = totalIncome - totalExpense;

    // Calculate goal reservation (10% of remaining target per month)
    const goalReservation = goals.reduce((sum, goal) => {
      const remaining = goal.target_amount - goal.saved_amount;
      return sum + remaining * 0.1; // Reserve 10% monthly
    }, 0);

    // Emergency buffer (₹1000 minimum)
    const emergencyBuffer = 1000;

    // Safe-to-Spend calculation
    const safeToSpend = Math.max(0, balance - goalReservation - emergencyBuffer);

    // Determine risk level based on safe-to-spend amount
    let riskLevel: 'green' | 'yellow' | 'red';
    if (safeToSpend >= 1500) {
      riskLevel = 'green'; // Safe
    } else if (safeToSpend >= 500) {
      riskLevel = 'yellow'; // Caution
    } else {
      riskLevel = 'red'; // Danger
    }

    // Dhanda vs Ghar split (Business vs Personal expenses)
    const dhandaTotal = transactions
      .filter((t) => t.is_business && t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);

    const gharTotal = transactions
      .filter((t) => !t.is_business && t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);

    // Get primary goal (first active goal)
    const primaryGoal = goals[0];

    // Format response
    return res.status(200).json({
      safe_to_spend: Math.round(safeToSpend),
      risk_level: riskLevel,
      total_balance: balance,
      total_income: totalIncome,
      total_expense: totalExpense,
      prediction: prediction
        ? {
            low: prediction.predicted_expense_low,
            high: prediction.predicted_expense_high,
            confidence: prediction.confidence,
            message: prediction.message
          }
        : null,
      goal: primaryGoal
        ? {
            id: primaryGoal.id,
            name: primaryGoal.name,
            target: primaryGoal.target_amount,
            saved: primaryGoal.saved_amount,
            progress: primaryGoal.saved_amount / primaryGoal.target_amount,
            deadline: primaryGoal.deadline
          }
        : null,
      recent_transactions: transactions.slice(0, 5).map((t) => ({
        id: t.id,
        amount: t.amount,
        type: t.type,
        merchant: t.merchant || t.category,
        category: t.category,
        is_business: t.is_business,
        created_at: t.created_at
      })),
      dhanda_total: dhandaTotal,
      ghar_total: gharTotal,
      transaction_count: transactions.length,
      active_goals_count: goals.length
    });
  } catch (error: any) {
    console.error('Dashboard error:', error);
    return res.status(500).json({
      error: 'Internal server error',
      message: error.message
    });
  }
}
