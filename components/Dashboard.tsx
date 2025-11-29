/**
 * Dashboard Component
 * Main dashboard view with Nischint Meter, Predictions, and Agent Widget
 */

import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'sonner';
import NischintMeter from '../src/components/dashboard/NischintMeter';
import PredictionCard from '../src/components/dashboard/PredictionCard';
import AgentWidget from '../src/components/dashboard/AgentWidget';
import { useDashboard } from '../src/hooks/useDashboard';
import { useRealtimeTransactions } from '../src/hooks/useRealtimeTransactions';

// Demo user ID (from Supabase)
const DEMO_USER_ID = '00000000-0000-0000-0000-000000000001';

// Create a client for React Query
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1
    }
  }
});

function DashboardContent() {
  // Fetch dashboard data
  const { data, isLoading, error, refetch } = useDashboard(DEMO_USER_ID);

  // Subscribe to real-time transaction updates
  useRealtimeTransactions(DEMO_USER_ID, () => {
    refetch(); // Refresh dashboard when new transaction comes in
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-yellow-400 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-400">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center">
        <div className="text-center max-w-md">
          <div className="text-6xl mb-4">😰</div>
          <h2 className="text-2xl font-bold text-white mb-2">Oops!</h2>
          <p className="text-gray-400 mb-4">
            Kuch gadbad ho gayi. Server se connect nahi ho pa raha.
          </p>
          <button
            onClick={() => refetch()}
            className="bg-yellow-500 text-black px-6 py-2 rounded-full font-semibold hover:bg-yellow-600 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-4 md:p-8">
      {/* Header */}
      <div className="max-w-6xl mx-auto mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
              Nischint Dashboard
            </h1>
            <p className="text-gray-400">
              Namaste! Your financial overview
            </p>
          </div>

          {/* Balance Stats */}
          <div className="hidden md:flex gap-6">
            <div className="text-right">
              <p className="text-sm text-gray-400">Total Balance</p>
              <p className="text-2xl font-bold text-white">
                ₹{data?.total_balance.toLocaleString('en-IN')}
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-400">Transactions</p>
              <p className="text-2xl font-bold text-yellow-400">
                {data?.transaction_count}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left Column - Nischint Meter */}
        <div className="space-y-8">
          <NischintMeter
            safeToSpend={data?.safe_to_spend || 0}
            maxAmount={10000}
            riskLevel={data?.risk_level || 'green'}
          />

          {/* Recent Transactions */}
          <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-3xl p-6 shadow-2xl border border-gray-700">
            <h3 className="text-xl font-bold text-white mb-4">Recent Activity</h3>
            <div className="space-y-3">
              {data?.recent_transactions.slice(0, 5).map((txn) => (
                <div
                  key={txn.id}
                  className="flex items-center justify-between p-3 bg-gray-800/50 rounded-xl hover:bg-gray-700/50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="text-2xl">
                      {txn.type === 'income' ? '💰' : '💸'}
                    </div>
                    <div>
                      <p className="text-white font-medium text-sm">{txn.merchant}</p>
                      <p className="text-gray-400 text-xs">{txn.category}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p
                      className={`font-bold ${
                        txn.type === 'income' ? 'text-emerald-400' : 'text-red-400'
                      }`}
                    >
                      {txn.type === 'income' ? '+' : '-'}₹{txn.amount}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column - Prediction & Goal */}
        <div className="space-y-8">
          {/* ML Prediction */}
          {data?.prediction && (
            <PredictionCard
              expenseLow={data.prediction.low}
              expenseHigh={data.prediction.high}
              confidence={data.prediction.confidence}
              message={data.prediction.message}
            />
          )}

          {/* Active Goal */}
          {data?.goal && (
            <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-3xl p-6 shadow-2xl border border-gray-700">
              <h3 className="text-xl font-bold text-white mb-4">Active Goal</h3>
              <div className="mb-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-lg text-white font-semibold">{data.goal.name}</span>
                  <span className="text-yellow-400 font-bold">
                    {Math.round(data.goal.progress * 100)}%
                  </span>
                </div>

                {/* Progress Bar */}
                <div className="h-4 bg-gray-700 rounded-full overflow-hidden mb-2">
                  <div
                    className="h-full bg-gradient-to-r from-yellow-400 to-yellow-600 transition-all duration-500"
                    style={{ width: `${data.goal.progress * 100}%` }}
                  />
                </div>

                <div className="flex justify-between text-sm text-gray-400">
                  <span>₹{data.goal.saved.toLocaleString('en-IN')}</span>
                  <span>₹{data.goal.target.toLocaleString('en-IN')}</span>
                </div>
              </div>

              {/* Bike Visualization */}
              <div className="text-center py-4">
                <div className="text-6xl mb-2">🏍️</div>
                <p className="text-gray-400 text-sm">
                  ₹{(data.goal.target - data.goal.saved).toLocaleString('en-IN')} to go!
                </p>
              </div>
            </div>
          )}

          {/* Dhanda vs Ghar */}
          <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-3xl p-6 shadow-2xl border border-gray-700">
            <h3 className="text-xl font-bold text-white mb-4">Dhanda vs Ghar</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-blue-500/10 border border-blue-500/30 rounded-2xl p-4 text-center">
                <div className="text-3xl mb-2">🏪</div>
                <p className="text-gray-400 text-sm mb-1">Business</p>
                <p className="text-2xl font-bold text-blue-400">
                  ₹{data?.dhanda_total.toLocaleString('en-IN')}
                </p>
              </div>
              <div className="bg-purple-500/10 border border-purple-500/30 rounded-2xl p-4 text-center">
                <div className="text-3xl mb-2">🏠</div>
                <p className="text-gray-400 text-sm mb-1">Personal</p>
                <p className="text-2xl font-bold text-purple-400">
                  ₹{data?.ghar_total.toLocaleString('en-IN')}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Agent Widget (floating) */}
      <AgentWidget userId={DEMO_USER_ID} />
    </div>
  );
}

// Wrap with QueryClientProvider
export default function Dashboard() {
  return (
    <QueryClientProvider client={queryClient}>
      <Toaster position="top-right" richColors />
      <DashboardContent />
    </QueryClientProvider>
  );
}
