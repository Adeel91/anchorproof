'use client';

import { useDashboardData } from '@/providers/DashboardDataProvider';
import {
  Shield,
  Database,
  Zap,
  Activity,
  Clock,
  AlertTriangle,
} from 'lucide-react';

export function SystemStatus() {
  const { stats, conversations, tenant } = useDashboardData();

  const totalConversations = stats.total;
  const verifiedCount = stats.verified;
  const pendingCount = stats.pending;
  const lastConversation = conversations[0]?.createdAt;

  const verificationRate =
    totalConversations > 0
      ? Math.round((verifiedCount / totalConversations) * 100)
      : 0;

  const isHealthy = verificationRate >= 70 || totalConversations === 0;
  const hasPending = pendingCount > 0;
  const hasActivity = totalConversations > 0;

  const tenantName = tenant?.name || 'Unknown';
  const subscriptionTier = tenant?.subscriptionTier || 'Free';

  return (
    <div
      className={`bg-gradient-to-r ${isHealthy ? 'from-emerald-500/10 via-cyan-500/10 to-indigo-500/10 border-emerald-500/20' : 'from-amber-500/10 via-red-500/10 to-orange-500/10 border-amber-500/20'} border rounded-xl p-3 sm:p-4 transition-all duration-500`}
    >
      {/* Mobile Layout - Stacked */}
      <div className="flex flex-col gap-2 sm:hidden">
        {/* Status Line */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div
              className={`w-1.5 h-1.5 rounded-full ${isHealthy ? 'bg-emerald-400' : 'bg-amber-400'} animate-pulse`}
            />
            <span
              className={`text-[10px] font-mono ${isHealthy ? 'text-emerald-400' : 'text-amber-400'}`}
            >
              {isHealthy ? 'SYSTEM OPERATIONAL' : 'REVIEW REQUIRED'}
            </span>
          </div>
          <div className="text-[10px] text-slate-500 font-mono">
            {tenantName}
          </div>
        </div>

        {/* Metrics Row */}
        <div className="flex flex-wrap items-center gap-3 text-[10px] text-slate-400">
          <div className="flex items-center gap-1">
            <Shield
              className={`w-3 h-3 ${verificationRate >= 80 ? 'text-emerald-400' : verificationRate >= 50 ? 'text-amber-400' : 'text-red-400'}`}
            />
            <span
              className={`font-mono ${
                verificationRate >= 80
                  ? 'text-emerald-400'
                  : verificationRate >= 50
                    ? 'text-amber-400'
                    : 'text-red-400'
              }`}
            >
              {verificationRate}%
            </span>
          </div>

          <div className="flex items-center gap-1">
            <Database className="w-3 h-3 text-cyan-400" />
            <span className="text-white font-mono">{totalConversations}</span>
          </div>

          {hasPending && (
            <div className="flex items-center gap-1">
              <Clock className="w-3 h-3 text-amber-400" />
              <span className="text-amber-400 font-mono">{pendingCount}</span>
            </div>
          )}

          {!hasActivity && (
            <div className="flex items-center gap-1 text-amber-400">
              <AlertTriangle className="w-3 h-3" />
              <span>No data</span>
            </div>
          )}
        </div>
      </div>

      {/* Tablet+ Layout - Horizontal */}
      <div className="hidden sm:flex flex-wrap items-center justify-between gap-2 md:gap-4">
        {/* LEFT SECTION */}
        <div className="flex flex-wrap items-center gap-2 md:gap-3">
          <div className="flex items-center gap-1.5 md:gap-2">
            <div
              className={`w-1.5 h-1.5 md:w-2 md:h-2 rounded-full ${isHealthy ? 'bg-emerald-400' : 'bg-amber-400'} animate-pulse`}
            />
            <span
              className={`text-[10px] md:text-xs font-mono ${isHealthy ? 'text-emerald-400' : 'text-amber-400'}`}
            >
              {isHealthy ? 'SYSTEM OPERATIONAL' : 'REVIEW REQUIRED'}
            </span>
          </div>

          <div className="flex items-center gap-1.5 md:gap-2 text-[10px] md:text-xs text-slate-400">
            <span className="hidden md:inline">Tenant:</span>
            <span className="text-white font-mono truncate max-w-[100px] md:max-w-[150px]">
              {tenantName}
            </span>
            <span className="hidden lg:inline text-slate-600">|</span>
            <span className="hidden lg:inline">Tier:</span>
            <span className="hidden lg:inline text-white font-mono">
              {subscriptionTier}
            </span>
          </div>
        </div>

        {/* RIGHT SECTION */}
        <div className="flex flex-wrap items-center gap-1.5 md:gap-2 lg:gap-4">
          {/* Compliance */}
          <div className="flex items-center gap-1 md:gap-1.5 text-[10px] md:text-xs text-slate-400">
            <Shield
              className={`w-3 h-3 md:w-3.5 md:h-3.5 ${verificationRate >= 80 ? 'text-emerald-400' : verificationRate >= 50 ? 'text-amber-400' : 'text-red-400'}`}
            />
            <span className="hidden sm:inline">Compliance:</span>
            <span
              className={`font-mono ${
                verificationRate >= 80
                  ? 'text-emerald-400'
                  : verificationRate >= 50
                    ? 'text-amber-400'
                    : 'text-red-400'
              }`}
            >
              {verificationRate}%
            </span>
          </div>

          {/* Records */}
          <div className="flex items-center gap-1 md:gap-1.5 text-[10px] md:text-xs text-slate-400">
            <Database className="w-3 h-3 md:w-3.5 md:h-3.5 text-cyan-400" />
            <span className="hidden sm:inline">Records:</span>
            <span className="text-white font-mono">{totalConversations}</span>
          </div>

          {/* Pending */}
          {hasPending && (
            <div className="flex items-center gap-1 md:gap-1.5 text-[10px] md:text-xs text-slate-400">
              <Clock className="w-3 h-3 md:w-3.5 md:h-3.5 text-amber-400" />
              <span className="hidden md:inline">Pending:</span>
              <span className="text-amber-400 font-mono">{pendingCount}</span>
            </div>
          )}

          {/* Last Activity */}
          {lastConversation && (
            <div className="hidden lg:flex items-center gap-1 md:gap-1.5 text-[10px] md:text-xs text-slate-400">
              <Activity className="w-3 h-3 md:w-3.5 md:h-3.5 text-purple-400" />
              <span className="hidden xl:inline">Last:</span>
              <span className="text-white font-mono">
                {new Date(lastConversation).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                })}
              </span>
            </div>
          )}

          {/* Verification Rate */}
          {totalConversations > 0 && (
            <div className="hidden xl:flex items-center gap-1 md:gap-1.5 text-[10px] md:text-xs text-slate-400">
              <Zap className="w-3 h-3 md:w-3.5 md:h-3.5 text-indigo-400" />
              <span>Rate:</span>
              <span
                className={`font-mono ${
                  verificationRate >= 80
                    ? 'text-emerald-400'
                    : verificationRate >= 50
                      ? 'text-amber-400'
                      : 'text-red-400'
                }`}
              >
                {verificationRate}%
              </span>
            </div>
          )}

          {/* No Data Warning */}
          {!hasActivity && (
            <div className="flex items-center gap-1 md:gap-1.5 text-[10px] md:text-xs text-amber-400">
              <AlertTriangle className="w-3 h-3 md:w-3.5 md:h-3.5" />
              <span className="hidden sm:inline">No conversations yet</span>
              <span className="sm:hidden">No data</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
