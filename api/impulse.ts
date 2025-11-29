/**
 * Impulse Simulator API Endpoint
 * Tests "what if I buy X" scenarios
 * POST /api/impulse - Simulate impulse purchase impact
 */

import { VercelRequest, VercelResponse } from '@vercel/node';
import { supabase } from '../lib/supabase';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { user_id, item, amount } = req.body;

  if (!user_id || !amount) {
    return res.status(400).json({
      error: 'Missing required fields',
      required: ['user_id', 'amount']
    });
  }

  try {
    // Fetch active goals
    const { data: goals, error: goalsError } = await supabase
      .from('goals')
      .select('*')
      .eq('user_id', user_id)
      .eq('is_active', true)
      .limit(1);

    if (goalsError) {
      console.error('Goals fetch error:', goalsError);
      return res.status(500).json({ error: 'Failed to fetch goals' });
    }

    if (!goals || goals.length === 0) {
      return res.status(404).json({
        error: 'No active goal found',
        message: 'User must have an active goal to simulate impulse purchases'
      });
    }

    const goal = goals[0];
    const purchaseAmount = parseInt(amount);

    // Current progress
    const currentProgress = goal.saved_amount / goal.target_amount;

    // Progress after purchase (assuming it reduces savings)
    const afterPurchase = Math.max(0, (goal.saved_amount - purchaseAmount) / goal.target_amount);

    // Calculate delay in days
    // Assume average saving rate of ₹100/day (can be made dynamic based on transaction history)
    const avgDailySaving = 100;
    const daysDelayed = Math.ceil(purchaseAmount / avgDailySaving);

    // Generate contextual warning message
    let severity: 'low' | 'medium' | 'high';
    let agentWarning: string;

    if (purchaseAmount >= 2000) {
      severity = 'high';
      agentWarning = `Bhai, ye ₹${purchaseAmount.toLocaleString()} ka kharcha tere ${goal.name} ko ${daysDelayed} din late kar dega! Soch le ek baar 😰`;
    } else if (purchaseAmount >= 1000) {
      severity = 'medium';
      agentWarning = `Boss, ₹${purchaseAmount.toLocaleString()} kharch karoge toh ${daysDelayed} din ka delay hoga ${goal.name} mein. Tu sure hai?`;
    } else if (purchaseAmount >= 500) {
      severity = 'medium';
      agentWarning = `₹${purchaseAmount.toLocaleString()} se ${daysDelayed} din ka delay hoga. Zaroorat hai kya?`;
    } else {
      severity = 'low';
      agentWarning = `Chalta hai yaar, ₹${purchaseAmount} toh manage ho jayega. Par dhyan rakh!`;
    }

    // Calculate new safe-to-spend after purchase
    const { data: transactions } = await supabase
      .from('transactions')
      .select('amount, type')
      .eq('user_id', user_id)
      .order('created_at', { ascending: false })
      .limit(30);

    const totalIncome = transactions
      ?.filter((t) => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0) || 0;

    const totalExpense = transactions
      ?.filter((t) => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0) || 0;

    const currentBalance = totalIncome - totalExpense;
    const balanceAfterPurchase = currentBalance - purchaseAmount;

    // Save impulse simulation as a nudge
    await supabase.from('nudges').insert({
      user_id,
      message: agentWarning,
      type: severity === 'high' ? 'warning' : 'info',
      trigger: 'impulse',
      metadata: {
        item_name: item,
        amount: purchaseAmount,
        goal_name: goal.name,
        days_delayed: daysDelayed,
        severity
      },
      is_read: false
    });

    return res.status(200).json({
      success: true,
      goal_impact: {
        goal_name: goal.name,
        current_progress: parseFloat(currentProgress.toFixed(4)),
        after_purchase: parseFloat(afterPurchase.toFixed(4)),
        progress_loss: parseFloat((currentProgress - afterPurchase).toFixed(4)),
        days_delayed: daysDelayed,
        severity
      },
      financial_impact: {
        purchase_amount: purchaseAmount,
        current_balance: currentBalance,
        balance_after: balanceAfterPurchase,
        can_afford: balanceAfterPurchase >= 1000 // Minimum ₹1000 buffer
      },
      agent_warning: agentWarning,
      recommendation:
        severity === 'high'
          ? 'We strongly recommend postponing this purchase'
          : severity === 'medium'
          ? 'Consider if this purchase is necessary right now'
          : 'This purchase is manageable, but stay mindful of your goal'
    });
  } catch (error: any) {
    console.error('Impulse simulation error:', error);
    return res.status(500).json({
      error: 'Internal server error',
      message: error.message
    });
  }
}
