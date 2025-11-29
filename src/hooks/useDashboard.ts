/**
 * Dashboard Hook
 * Fetches complete dashboard data from backend
 */

import { useQuery } from '@tanstack/react-query';

interface DashboardData {
  safe_to_spend: number;
  risk_level: 'green' | 'yellow' | 'red';
  total_balance: number;
  total_income: number;
  total_expense: number;
  prediction: {
    low: number;
    high: number;
    confidence: number;
    message: string;
  } | null;
  goal: {
    id: string;
    name: string;
    target: number;
    saved: number;
    progress: number;
    deadline?: string;
  } | null;
  recent_transactions: Array<{
    id: string;
    amount: number;
    type: 'income' | 'expense';
    merchant: string;
    category: string;
    is_business: boolean;
    created_at: string;
  }>;
  dhanda_total: number;
  ghar_total: number;
  transaction_count: number;
  active_goals_count: number;
}

export function useDashboard(userId: string) {
  return useQuery<DashboardData>({
    queryKey: ['dashboard', userId],
    queryFn: async () => {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001';
      const response = await fetch(`${apiUrl}/api/dashboard?userId=${userId}`);

      if (!response.ok) {
        throw new Error(`Dashboard fetch failed: ${response.statusText}`);
      }

      return response.json();
    },
    // Auto-refresh every 30 seconds
    refetchInterval: 30000,
    // Stale after 10 seconds (will refetch in background)
    staleTime: 10000,
    // Keep cached for 5 minutes
    cacheTime: 5 * 60 * 1000,
    // Retry failed requests
    retry: 2,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000)
  });
}
