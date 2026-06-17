// components/dashboard/overview/QuickOverview.tsx
'use client';

import { useDashboardData } from '@/providers/DashboardDataProvider';
import { Clock, CheckCircle, AlertCircle, Key } from 'lucide-react';
import Link from 'next/link';

export function QuickOverview() {
  const { stats, conversations, apiKeys, loading } = useDashboardData();

  if (loading) {
    return (
      <div className="bg-slate-900/50 border border-slate-800/50 rounded-xl p-6 animate-pulse">
        <div className="h-4 bg-slate-800 rounded w-32 mb-4" />
        <div className="space-y-3">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-12 bg-slate-800/50 rounded" />
          ))}
        </div>
      </div>
    );
  }

  const pendingCount = conversations.filter(c => !c.verifiedAt).length;
  const verifiedCount = conversations.filter(c => c.verifiedAt).length;

  return (
    <div className="bg-slate-900/50 border border-slate-800/50 rounded-xl p-6">
      <h3 className="text-sm font-semibold text-white mb-4">Quick Overview</h3>
      
      <div className="space-y-3">
        <Link href="/dashboard/conversations" className="block">
          <div className="flex items-center justify-between p-3 rounded-lg bg-slate-800/30 hover:bg-slate-800/50 transition-colors border border-slate-700/30">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center">
                <Clock className="w-4 h-4 text-blue-400" />
              </div>
              <div>
                <p className="text-sm text-white">Conversations</p>
                <p className="text-xs text-slate-500">{stats.total} total</p>
              </div>
            </div>
            <span className="text-xs text-slate-400">{stats.total}</span>
          </div>
        </Link>

        <Link href="/dashboard/verification" className="block">
          <div className="flex items-center justify-between p-3 rounded-lg bg-slate-800/30 hover:bg-slate-800/50 transition-colors border border-slate-700/30">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                <CheckCircle className="w-4 h-4 text-emerald-400" />
              </div>
              <div>
                <p className="text-sm text-white">Verifications</p>
                <p className="text-xs text-slate-500">{verifiedCount} verified</p>
              </div>
            </div>
            <span className="text-xs text-slate-400">{verifiedCount}</span>
          </div>
        </Link>

        {pendingCount > 0 && (
          <Link href="/dashboard/conversations" className="block">
            <div className="flex items-center justify-between p-3 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 transition-colors border border-amber-500/20">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-amber-500/10 flex items-center justify-center">
                  <AlertCircle className="w-4 h-4 text-amber-400" />
                </div>
                <div>
                  <p className="text-sm text-white">Pending Review</p>
                  <p className="text-xs text-amber-400">{pendingCount} need verification</p>
                </div>
              </div>
              <span className="text-xs text-amber-400">{pendingCount}</span>
            </div>
          </Link>
        )}

        <Link href="/dashboard/keys" className="block">
          <div className="flex items-center justify-between p-3 rounded-lg bg-slate-800/30 hover:bg-slate-800/50 transition-colors border border-slate-700/30">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-purple-500/10 flex items-center justify-center">
                <Key className="w-4 h-4 text-purple-400" />
              </div>
              <div>
                <p className="text-sm text-white">API Keys</p>
                <p className="text-xs text-slate-500">{apiKeys.length} active</p>
              </div>
            </div>
            <span className="text-xs text-slate-400">{apiKeys.length}</span>
          </div>
        </Link>
      </div>
    </div>
  );
}