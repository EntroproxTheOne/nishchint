/**
 * Server-side Supabase Client
 * Uses SERVICE_ROLE_KEY for full database access (backend only)
 */

import { createClient } from '@supabase/supabase-js';

// Validate environment variables
// In Node.js server context, VITE_ prefixed vars won't auto-load, so we check both patterns
const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;

if (!supabaseUrl) {
  throw new Error('Missing SUPABASE_URL or VITE_SUPABASE_URL environment variable');
}

if (!supabaseServiceKey) {
  throw new Error('Missing SUPABASE_SERVICE_KEY environment variable');
}

// Create Supabase client with service role key
// This bypasses Row Level Security - use ONLY in backend
export const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

// Helper function to handle Supabase errors
export function handleSupabaseError(error: any, context: string) {
  console.error(`[Supabase Error - ${context}]:`, error);
  return {
    error: error.message || 'Database operation failed',
    details: error.details,
    hint: error.hint
  };
}
