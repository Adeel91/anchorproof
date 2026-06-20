'use client';

import { useDashboardData } from '@/providers/DashboardDataProvider';
import { MessageSquare, CheckCircle, Clock, FileText, TrendingUp, TrendingDown } from 'lucide-react';

export function StatsCards() {
  const { stats, loading } = useDashboardData();

  const statCards = [
    {
      label: 'Total Conversations',
      value: stats.total,
      icon: MessageSquare,
      color: 'from-blue-500 to-cyan-500',
      trend: '+12%',
      trendUp: true,
    },
    {
      label: 'Verified Records',
      value: stats.verified,
      icon: CheckCircle,
      color: 'from-emerald-500 to-green-500',
      trend: stats.verified > 0 ? '+8%' : '0%',
      trendUp: true,
    },
    {
      label: 'Pending Verification',
      value: stats.pending,
      icon: Clock,
      color: 'from-amber-500 to-yellow-500',
      trend: stats.pending > 0 ? '-3%' : '0%',
      trendUp: false,
    },
    {
      label: 'Total Messages',
      value: stats.totalMessages,
      icon: FileText,
      color: 'from-purple-500 to-pink-500',
      trend: '+24%',
      trendUp: true,
    },
  ];

  if (loading) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="bg-slate-900/50 border border-slate-800/50 rounded-xl p-4 sm:p-6 animate-pulse">
            <div className="h-3 sm:h-4 bg-slate-800 rounded w-20 sm:w-24 mb-2 sm:mb-3" />
            <div className="h-6 sm:h-8 bg-slate-800 rounded w-12 sm:w-16" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
      {statCards.map((card, index) => {
        const Icon = card.icon;
        return (
          <div
            key={index}
            className="bg-slate-900/50 border border-slate-800/50 rounded-xl p-4 sm:p-6 hover:border-slate-700/70 transition-all duration-300 hover:shadow-[0_0_30px_rgba(99,102,241,0.05)]"
          >
            <div className="flex items-center justify-between mb-2 sm:mb-4">
              <span className="text-[10px] sm:text-sm font-medium text-slate-400 tracking-wide uppercase">
                <span className="hidden xs:inline">{card.label}</span>
                <span className="xs:hidden">
                  {card.label === 'Total Conversations' ? 'Conversations' :
                   card.label === 'Verified Records' ? 'Verified' :
                   card.label === 'Pending Verification' ? 'Pending' : 'Messages'}
                </span>
              </span>
              <Icon className="w-3.5 h-3.5 sm:w-5 sm:h-5 text-slate-400" />
            </div>
            <div className="flex items-end justify-between">
              <div className={`text-xl sm:text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r ${card.color}`}>
                {card.value}
              </div>
              {card.trend && (
                <div className={`flex items-center gap-0.5 sm:gap-1 text-[9px] sm:text-xs font-medium ${
                  card.trendUp ? 'text-emerald-400' : 'text-red-400'
                }`}>
                  {card.trendUp ? <TrendingUp className="w-2.5 h-2.5 sm:w-3 sm:h-3" /> : <TrendingDown className="w-2.5 h-2.5 sm:w-3 sm:h-3" />}
                  <span className="hidden xs:inline">{card.trend}</span>
                </div>
              )}
            </div>
            <div className="mt-2 sm:mt-3 h-0.5 sm:h-1 w-full bg-slate-800/50 rounded-full overflow-hidden">
              <div 
                className={`h-full bg-gradient-to-r ${card.color} rounded-full transition-all duration-1000`}
                style={{ 
                  width: `${Math.min(100, (card.value / (stats.total || 1)) * 100)}%`,
                  opacity: 0.5
                }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}