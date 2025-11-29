/**
 * Real-time Transactions Hook
 * Subscribes to new transactions via Supabase real-time
 */

import { useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { toast } from 'sonner';

export function useRealtimeTransactions(userId: string, onNewTransaction?: () => void) {
  useEffect(() => {
    // Subscribe to INSERT events on transactions table
    const channel = supabase
      .channel(`transactions:${userId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'transactions',
          filter: `user_id=eq.${userId}`
        },
        (payload) => {
          const transaction = payload.new as any;

          // Show toast notification
          const emoji = transaction.type === 'income' ? '💰' : '💸';
          const sign = transaction.type === 'income' ? '+' : '-';

          toast.success(`${emoji} New ${transaction.type}!`, {
            description: `${sign}₹${transaction.amount} - ${transaction.merchant || transaction.category}`,
            duration: 4000
          });

          // Trigger callback (typically to refetch dashboard)
          onNewTransaction?.();
        }
      )
      .subscribe();

    // Cleanup on unmount
    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId, onNewTransaction]);
}
