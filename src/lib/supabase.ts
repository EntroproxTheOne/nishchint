/**
 * Client-side Supabase Client
 * Uses ANON_KEY for frontend (safe for browser exposure)
 */

import { createClient } from '@supabase/supabase-js';

// Read Vite environment variables
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl) {
  throw new Error('Missing VITE_SUPABASE_URL environment variable');
}

if (!supabaseAnonKey) {
  throw new Error('Missing VITE_SUPABASE_ANON_KEY environment variable');
}

// Create Supabase client with anon key (safe for frontend)
// This respects Row Level Security policies
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Database types (add as needed)
export type Transaction = {
  id: string;
  user_id: string;
  amount: number;
  type: 'income' | 'expense';
  category: string;
  merchant?: string;
  is_business: boolean;
  created_at: string;
};

export type Goal = {
  id: string;
  user_id: string;
  name: string;
  description?: string;
  target_amount: number;
  saved_amount: number;
  deadline?: string;
  is_active: boolean;
  created_at: string;
};

export type Nudge = {
  id: string;
  user_id: string;
  message: string;
  type: 'warning' | 'success' | 'info' | 'tip';
  trigger: string;
  metadata?: any;
  is_read: boolean;
  created_at: string;
};
