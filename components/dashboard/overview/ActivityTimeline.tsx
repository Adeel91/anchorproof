'use client';

import { useDashboardData } from '@/providers/DashboardDataProvider';
import {
  MessageSquare,
  CheckCheck,
  Key,
  Shield,
  Clock,
  AlertTriangle,
} from 'lucide-react';
import { useState, useMemo } from 'react';

type ActivityStatus = 'verified' | 'pending' | 'info' | 'warning' | 'success';

interface Activity {
  id: string;
  type: 'conversation' | 'verification' | 'api_key' | 'system';
  icon: React.ElementType;
  color: string;
  title: string;
  description: string;
  time: Date;
  status?: ActivityStatus;
  metadata?: Record<string, string | number>;
}

export function ActivityTimeline() {
  const { conversations, apiKeys, loading } = useDashboardData();
  const [showAll, setShowAll] = useState(false);

  const activities = useMemo<Activity[]>(() => {
    const result: Activity[] = [];

    for (const c of conversations.slice(0, 5)) {
      result.push({
        id: `conv-${c.id}`,
        type: 'conversation',
        icon: MessageSquare,
        color: 'text-blue-400 bg-blue-500/10',
        title: `New conversation ${c.conversationId.slice(0, 8)}...`,
        description: `${c.messageCount} message${c.messageCount !== 1 ? 's' : ''} from ${c.customerId || 'Unknown'}`,
        time: new Date(c.createdAt),
        status: c.verifiedAt ? 'verified' : 'pending',
        metadata: { conversationId: c.conversationId, blobId: c.blobId },
      });
    }

    for (const c of conversations.filter((c) => c.verifiedAt).slice(0, 3)) {
      result.push({
        id: `ver-${c.id}`,
        type: 'verification',
        icon: CheckCheck,
        color: 'text-emerald-400 bg-emerald-500/10',
        title: 'Conversation verified on-chain',
        description: `Blob ${c.blobId.slice(0, 12)}... verified`,
        time: new Date(c.verifiedAt!),
        status: 'success',
        metadata: { blobId: c.blobId, conversationId: c.conversationId },
      });
    }

    for (const k of apiKeys.slice(0, 3)) {
      result.push({
        id: `key-${k.id}`,
        type: 'api_key',
        icon: Key,
        color: 'text-purple-400 bg-purple-500/10',
        title: `API key "${k.name}" ${k.lastUsedAt ? 'was used' : 'created'}`,
        description: k.lastUsedAt
          ? `Last used ${new Date(k.lastUsedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`
          : `Created ${new Date(k.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`,
        time: new Date(k.lastUsedAt || k.createdAt),
        status: 'info',
        metadata: { keyName: k.name, keyId: k.id },
      });
    }

    const pendingCount = conversations.filter((c) => !c.verifiedAt).length;
    if (pendingCount > 0) {
      const stableId = `system-pending-${pendingCount}-${conversations.length}`;
      result.push({
        id: stableId,
        type: 'system',
        icon: AlertTriangle,
        color: 'text-amber-400 bg-amber-500/10',
        title: `${pendingCount} conversation${pendingCount !== 1 ? 's' : ''} pending verification`,
        description: `Review ${pendingCount} pending conversation${pendingCount !== 1 ? 's' : ''}`,
        time: new Date(),
        status: 'warning',
      });
    }

    const verificationRate =
      conversations.length > 0
        ? Math.round(
            (conversations.filter((c) => c.verifiedAt).length /
              conversations.length) *
              100
          )
        : 0;

    if (verificationRate >= 80 && conversations.length > 0) {
      const stableId = `system-success-${verificationRate}-${conversations.length}`;
      result.push({
        id: stableId,
        type: 'system',
        icon: Shield,
        color: 'text-emerald-400 bg-emerald-500/10',
        title: 'High verification rate maintained',
        description: `${verificationRate}% of all conversations are verified`,
        time: new Date(),
        status: 'success',
      });
    }

    return result;
  }, [conversations, apiKeys]);

  const uniqueActivities = useMemo(() => {
    const seen = new Set<string>();
    const unique: Activity[] = [];

    for (const activity of activities) {
      if (!seen.has(activity.id)) {
        seen.add(activity.id);
        unique.push(activity);
      }
    }

    return unique.sort((a, b) => b.time.getTime() - a.time.getTime());
  }, [activities]);

  const displayedActivities = showAll
    ? uniqueActivities
    : uniqueActivities.slice(0, 5);
  const hasMore = uniqueActivities.length > 5;

  if (loading) {
    return (
      <div className="bg-slate-900/50 border border-slate-800/50 rounded-xl p-4 sm:p-6">
        <div className="animate-pulse space-y-3 sm:space-y-4">
          <div className="h-4 bg-slate-800 rounded w-24 sm:w-32" />
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-12 sm:h-16 bg-slate-800/50 rounded" />
          ))}
        </div>
      </div>
    );
  }

  if (uniqueActivities.length === 0) {
    return (
      <div className="bg-slate-900/50 border border-slate-800/50 rounded-xl p-6 sm:p-8 text-center">
        <Clock className="w-6 h-6 sm:w-8 sm:h-8 text-slate-600 mx-auto mb-2 sm:mb-3" />
        <p className="text-sm text-slate-400">No recent activity</p>
        <p className="text-xs text-slate-500 mt-1">
          Activity will appear here as you use the platform
        </p>
        <button
          onClick={() => window.location.reload()}
          className="mt-3 sm:mt-4 text-xs text-indigo-400 hover:text-indigo-300 transition-colors"
        >
          Refresh
        </button>
      </div>
    );
  }

  const getStatusBadge = (status?: ActivityStatus) => {
    const badges: Record<ActivityStatus, string> = {
      verified: 'bg-emerald-500/10 text-emerald-400',
      pending: 'bg-amber-500/10 text-amber-400',
      info: 'bg-blue-500/10 text-blue-400',
      warning: 'bg-amber-500/10 text-amber-400',
      success: 'bg-emerald-500/10 text-emerald-400',
    };

    const labels: Record<ActivityStatus, string> = {
      verified: 'Verified',
      pending: 'Pending',
      info: 'Info',
      warning: 'Review',
      success: 'Success',
    };

    if (!status) return null;

    return (
      <span
        className={`px-1.5 sm:px-2 py-0.5 rounded-full text-[7px] sm:text-[9px] font-medium ${badges[status]}`}
      >
        {labels[status]}
      </span>
    );
  };

  const getTimeAgo = (date: Date) => {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  return (
    <div className="bg-slate-900/50 border border-slate-800/50 rounded-xl overflow-hidden">
      <div className="px-4 sm:px-6 py-3 sm:py-4 border-b border-slate-800/50 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <h3 className="text-sm font-semibold text-white flex items-center gap-2">
            <Clock className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-indigo-400" />
            Live Activity Feed
          </h3>
          <p className="text-[8px] sm:text-[10px] text-slate-500 mt-0.5">
            {uniqueActivities.length} recent events
          </p>
        </div>
        <div className="flex items-center gap-2 sm:gap-3">
          <span className="text-[8px] sm:text-[10px] text-slate-500 font-mono hidden xs:inline">
            {new Date().toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
            })}
          </span>
          <div className="w-1 h-1 sm:w-1.5 sm:h-1.5 rounded-full bg-emerald-400 animate-pulse" />
        </div>
      </div>

      <div className="divide-y divide-slate-800/30 max-h-[400px] sm:max-h-[500px] overflow-y-auto">
        {displayedActivities.map((activity) => {
          const Icon = activity.icon;
          return (
            <div
              key={activity.id}
              className="px-4 sm:px-6 py-2.5 sm:py-3 hover:bg-slate-800/20 transition-colors group"
            >
              <div className="flex items-start gap-2.5 sm:gap-3">
                <div
                  className={`p-1 sm:p-1.5 rounded-lg ${activity.color} flex-shrink-0 mt-0.5 group-hover:scale-110 transition-transform duration-200`}
                >
                  <Icon className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-start justify-between gap-1 sm:gap-2">
                    <p className="text-xs sm:text-sm font-medium text-white truncate max-w-[150px] sm:max-w-none">
                      {activity.title}
                    </p>
                    <span className="text-[8px] sm:text-[10px] text-slate-500 whitespace-nowrap flex-shrink-0">
                      {getTimeAgo(activity.time)}
                    </span>
                  </div>
                  <div className="flex flex-wrap items-center gap-1 sm:gap-2 mt-0.5">
                    <p className="text-[10px] sm:text-xs text-slate-400 truncate max-w-[180px] sm:max-w-none">
                      {activity.description}
                    </p>
                    {activity.status && getStatusBadge(activity.status)}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {hasMore && (
        <div className="px-4 sm:px-6 py-2 sm:py-3 border-t border-slate-800/30 bg-slate-900/30">
          <button
            onClick={() => setShowAll(!showAll)}
            className="text-[10px] sm:text-xs text-indigo-400 hover:text-indigo-300 transition-colors w-full text-center"
          >
            {showAll
              ? 'Show less'
              : `Show ${uniqueActivities.length - 5} more events`}
          </button>
        </div>
      )}
    </div>
  );
}
