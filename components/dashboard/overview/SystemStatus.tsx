// components/dashboard/overview/SystemStatus.tsx
'use client';

import { useDashboardData } from '@/providers/DashboardDataProvider';
import { Shield, Database, Zap, Activity, Clock, AlertTriangle } from 'lucide-react';

export function SystemStatus() {
  const { stats, conversations, tenant, user } = useDashboardData();

  // REAL DATA from your system:
  const totalConversations = stats.total;
  const verifiedCount = stats.verified;
  const pendingCount = stats.pending;
  const lastVerification = conversations.find(c => c.verifiedAt)?.verifiedAt;
  const lastConversation = conversations[0]?.createdAt;
  
  // Calculate verification rate
  const verificationRate = totalConversations > 0 
    ? Math.round((verifiedCount / totalConversations) * 100) 
    : 0;

  // Determine system health based on real data
  const isHealthy = verificationRate >= 70 || totalConversations === 0;
  const hasPending = pendingCount > 0;
  const hasActivity = totalConversations > 0;

  // Tenant info (real data)
  const tenantName = tenant?.name || 'Unknown';
  const subscriptionTier = tenant?.subscriptionTier || 'Free';

  return (
    <div className={`bg-gradient-to-r ${isHealthy ? 'from-emerald-500/10 via-cyan-500/10 to-indigo-500/10 border-emerald-500/20' : 'from-amber-500/10 via-red-500/10 to-orange-500/10 border-amber-500/20'} border rounded-xl p-4 mb-8 transition-all duration-500`}>
      <div className="flex flex-wrap items-center justify-between gap-4">
        {/* Left Section - Status & Tenant */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${isHealthy ? 'bg-emerald-400' : 'bg-amber-400'} animate-pulse`} />
            <span className={`text-xs font-mono ${isHealthy ? 'text-emerald-400' : 'text-amber-400'}`}>
              {isHealthy ? 'SYSTEM OPERATIONAL' : 'REVIEW REQUIRED'}
            </span>
          </div>
          
          {/* Tenant Info - REAL DATA */}
          <div className="hidden sm:flex items-center gap-2 text-xs text-slate-400">
            <span>Tenant: <span className="text-white font-mono">{tenantName}</span></span>
            <span className="w-px h-3 bg-slate-700" />
            <span>Tier: <span className="text-white font-mono">{subscriptionTier}</span></span>
          </div>
        </div>

        {/* Right Section - Metrics */}
        <div className="flex flex-wrap items-center gap-4">
          {/* Compliance Status - Based on verification rate */}
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <Shield className={`w-3 h-3 ${verificationRate >= 80 ? 'text-emerald-400' : verificationRate >= 50 ? 'text-amber-400' : 'text-red-400'}`} />
            <span>Compliance: 
              <span className={`font-mono ml-1 ${
                verificationRate >= 80 ? 'text-emerald-400' : 
                verificationRate >= 50 ? 'text-amber-400' : 'text-red-400'
              }`}>
                {verificationRate}% Verified
              </span>
            </span>
          </div>

          {/* Real Database Stats */}
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <Database className="w-3 h-3 text-cyan-400" />
            <span>Records: <span className="text-white font-mono">{totalConversations}</span></span>
          </div>

          {/* Pending Items - REAL DATA */}
          {hasPending && (
            <div className="flex items-center gap-2 text-xs text-slate-400">
              <Clock className="w-3 h-3 text-amber-400" />
              <span>Pending: <span className="text-amber-400 font-mono">{pendingCount}</span></span>
            </div>
          )}

          {/* Last Activity - REAL DATA */}
          {lastConversation && (
            <div className="flex items-center gap-2 text-xs text-slate-400">
              <Activity className="w-3 h-3 text-purple-400" />
              <span>Last: <span className="text-white font-mono">
                {new Date(lastConversation).toLocaleDateString('en-US', { 
                  month: 'short', 
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </span></span>
            </div>
          )}

          {/* Verification Rate - REAL DATA */}
          {totalConversations > 0 && (
            <div className="flex items-center gap-2 text-xs text-slate-400">
              <Zap className="w-3 h-3 text-indigo-400" />
              <span>Rate: <span className={`font-mono ${
                verificationRate >= 80 ? 'text-emerald-400' : 
                verificationRate >= 50 ? 'text-amber-400' : 'text-red-400'
              }`}>
                {verificationRate}%
              </span></span>
            </div>
          )}

          {/* Warning if no activity */}
          {!hasActivity && (
            <div className="flex items-center gap-2 text-xs text-slate-400">
              <AlertTriangle className="w-3 h-3 text-amber-400" />
              <span className="text-amber-400">No conversations yet</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}