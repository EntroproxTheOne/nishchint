/**
 * Transactions API Endpoint
 * Handles transaction CRUD for mobile app integration
 * POST /api/transactions - Create new transaction
 * GET /api/transactions?userId=xxx&days=7 - Get transaction history
 */

import { VercelRequest, VercelResponse } from '@vercel/node';
import { supabase } from '../lib/supabase';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // POST - Create new transaction (from mobile app)
  if (req.method === 'POST') {
    const { user_id, amount, type, category, source, merchant, is_business, raw_text } = req.body;

    // Validate required fields
    if (!user_id || !amount || !type) {
      return res.status(400).json({
        error: 'Missing required fields',
        required: ['user_id', 'amount', 'type']
      });
    }

    // Validate type
    if (!['income', 'expense'].includes(type)) {
      return res.status(400).json({
        error: 'Invalid type',
        message: 'type must be either "income" or "expense"'
      });
    }

    try {
      const { data, error } = await supabase
        .from('transactions')
        .insert({
          user_id,
          amount: parseInt(amount),
          type,
          category: category || 'other',
          source: source || 'manual',
          merchant,
          is_business: is_business || false,
          raw_text
        })
        .select()
        .single();

      if (error) {
        console.error('Transaction insert error:', error);
        return res.status(500).json({
          error: 'Failed to create transaction',
          details: error.message
        });
      }

      return res.status(201).json({
        success: true,
        transaction: data,
        message: 'Transaction created successfully'
      });
    } catch (error: any) {
      console.error('Transaction creation error:', error);
      return res.status(500).json({
        error: 'Internal server error',
        message: error.message
      });
    }
  }

  // GET - Fetch transaction history
  if (req.method === 'GET') {
    const userId = req.query.userId as string;
    const days = parseInt((req.query.days as string) || '7');

    if (!userId) {
      return res.status(400).json({ error: 'userId parameter required' });
    }

    try {
      // Calculate date range
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);

      const { data, error } = await supabase
        .from('transactions')
        .select('*')
        .eq('user_id', userId)
        .gte('created_at', startDate.toISOString())
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Transaction fetch error:', error);
        return res.status(500).json({
          error: 'Failed to fetch transactions',
          details: error.message
        });
      }

      // Calculate summary statistics
      const totalIncome = data
        .filter((t) => t.type === 'income')
        .reduce((sum, t) => sum + t.amount, 0);

      const totalExpense = data
        .filter((t) => t.type === 'expense')
        .reduce((sum, t) => sum + t.amount, 0);

      const balance = totalIncome - totalExpense;

      return res.status(200).json({
        success: true,
        transactions: data,
        summary: {
          total_income: totalIncome,
          total_expense: totalExpense,
          balance,
          count: data.length,
          period_days: days
        }
      });
    } catch (error: any) {
      console.error('Transaction fetch error:', error);
      return res.status(500).json({
        error: 'Internal server error',
        message: error.message
      });
    }
  }

  // Method not allowed
  return res.status(405).json({ error: 'Method not allowed' });
}
