/**
 * Agent API Endpoint
 * Agentic chat and proactive nudges using Gemini AI
 * POST /api/agent/chat - Chat with financial agent
 */

import { VercelRequest, VercelResponse } from '@vercel/node';
import { supabase } from '../lib/supabase';
import { GoogleGenAI } from '@google/genai';

// Initialize Gemini AI
const genai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { user_id, message } = req.body;

  if (!user_id || !message) {
    return res.status(400).json({
      error: 'Missing required fields',
      required: ['user_id', 'message']
    });
  }

  try {
    // Fetch user context for personalized responses
    const [userResult, goalsResult, transactionsResult] = await Promise.all([
      supabase.from('users').select('*').eq('id', user_id).single(),
      supabase
        .from('goals')
        .select('*')
        .eq('user_id', user_id)
        .eq('is_active', true),
      supabase
        .from('transactions')
        .select('*')
        .eq('user_id', user_id)
        .order('created_at', { ascending: false })
        .limit(10)
    ]);

    const user = userResult.data;
    const goals = goalsResult.data || [];
    const transactions = transactionsResult.data || [];

    // Calculate context
    const totalIncome = transactions
      .filter((t) => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);

    const totalExpense = transactions
      .filter((t) => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);

    const balance = totalIncome - totalExpense;

    // Build contextual prompt
    const contextPrompt = `
You are Nischint, a friendly and street-smart financial coach for informal sector workers in India.

## User Context
- Name: ${user?.name || 'Friend'}
- Age: ${user?.age || 'Unknown'}
- Occupation: ${user?.onboarding_profile?.occupation || 'Delivery partner'}
- Income Range: ${user?.onboarding_profile?.income_range || '20k-30k/month'}

## Financial Situation
- Current Balance: ₹${balance}
- Total Income (Last 10 transactions): ₹${totalIncome}
- Total Expenses (Last 10 transactions): ₹${totalExpense}

## Active Goals
${goals.map(g => `- ${g.name}: ₹${g.saved_amount} / ₹${g.target_amount} (${Math.round(g.saved_amount / g.target_amount * 100)}% complete)`).join('\n') || '- No active goals'}

## Recent Transactions
${transactions.slice(0, 5).map(t => `- ${t.type === 'income' ? '+' : '-'}₹${t.amount} - ${t.merchant || t.category}`).join('\n')}

## Your Personality
- Speak in friendly Hinglish (mix of Hindi and English)
- Use words like "Bhai", "Tu", "Yaar", "Boss" naturally
- Be encouraging but honest about money
- Keep responses brief (2-3 sentences max)
- Use rupee symbol (₹) instead of "Rs"
- Be relatable to a 24-year-old delivery partner
- Avoid formal language or banking jargon

## User's Question
"${message}"

## Instructions
Respond as Nischint would - friendly, street-smart, and genuinely helpful. If the question is about spending money, gently remind them about their goals. If they're doing well, celebrate with them!
`;

    // Call Gemini API
    const response = await genai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: contextPrompt
    });

    const reply = response.text;

    // Save the interaction as a nudge
    await supabase.from('nudges').insert({
      user_id,
      message: reply,
      type: 'info',
      trigger: 'chat',
      metadata: {
        user_message: message,
        context: {
          balance,
          goals_count: goals.length,
          recent_transactions_count: transactions.length
        }
      },
      is_read: false
    });

    return res.status(200).json({
      success: true,
      reply,
      context: {
        balance,
        goals_count: goals.length
      }
    });
  } catch (error: any) {
    console.error('Agent error:', error);

    // Fallback response if Gemini fails
    const fallbackResponse = "Bhai, main abhi thoda busy hoon. Baad mein baat karte hain! 😊";

    return res.status(200).json({
      success: true,
      reply: fallbackResponse,
      fallback: true,
      error: error.message
    });
  }
}
