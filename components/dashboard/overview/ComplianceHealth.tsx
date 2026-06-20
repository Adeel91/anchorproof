// components/dashboard/overview/ComplianceHealth.tsx
'use client';

import { useDashboardData } from '@/providers/DashboardDataProvider';
import { CheckCircle, Shield, Clock } from 'lucide-react';

type HealthStatus = 'good' | 'warning' | 'critical';

export function ComplianceHealth() {
  const { stats, conversations } = useDashboardData();

  const totalVerified = stats.verified;
  const totalPending = stats.pending;
  const verificationRate = stats.total > 0 
    ? Math.round((stats.verified / stats.total) * 100) 
    : 0;

  const healthMetrics: Array<{
    label: string;
    value: string | number;
    status: HealthStatus;
    icon: React.ElementType;
  }> = [
    {
      label: 'Verification Rate',
      value: `${verificationRate}%`,
      status: verificationRate >= 80 ? 'good' : verificationRate >= 50 ? 'warning' : 'critical',
      icon: Shield,
    },
    {
      label: 'Total Records',
      value: stats.total,
      status: stats.total > 0 ? 'good' : 'warning',
      icon: CheckCircle,
    },
    {
      label: 'Pending Review',
      value: stats.pending,
      status: stats.pending > 0 ? 'warning' : 'good',
      icon: Clock,
    },
  ];

  // Calculate overall system health based on worst status
  const overallStatus = healthMetrics.some(m => m.status === 'critical') 
    ? 'critical' 
    : healthMetrics.some(m => m.status === 'warning') 
      ? 'warning' 
      : 'good';

  const statusColors: Record<HealthStatus, string> = {
    good: 'text-emerald-400 border-emerald-500/20 bg-emerald-500/10',
    warning: 'text-amber-400 border-amber-500/20 bg-amber-500/10',
    critical: 'text-red-400 border-red-500/20 bg-red-500/10',
  };

  const statusBadges = {
    good: { label: 'ALL SYSTEMS NOMINAL', color: 'text-emerald-400' },
    warning: { label: 'REVIEW RECOMMENDED', color: 'text-amber-400' },
    critical: { label: 'ACTION REQUIRED', color: 'text-red-400' },
  };

  const statusDots = {
    good: 'bg-emerald-400',
    warning: 'bg-amber-400',
    critical: 'bg-red-400',
  };

  return (
    <div className="bg-slate-900/50 border border-slate-800/50 rounded-xl p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-sm font-semibold text-white">Compliance & Security Health</h3>
          <p className="text-xs text-slate-500 mt-0.5">
            {stats.total === 0 
              ? 'No data available yet' 
              : `${stats.total} record${stats.total !== 1 ? 's' : ''} monitored`
            }
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${statusDots[overallStatus]} animate-pulse`} />
          <span className={`text-[10px] font-mono ${statusBadges[overallStatus].color}`}>
            {stats.total === 0 ? 'NO DATA' : statusBadges[overallStatus].label}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {healthMetrics.map((metric, index) => {
          const Icon = metric.icon;
          const statusClass = statusColors[metric.status];
          
          return (
            <div
              key={index}
              className={`p-4 rounded-lg border ${statusClass} transition-all duration-300 hover:scale-[1.02]`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-medium opacity-70">{metric.label}</span>
                <Icon className="w-4 h-4" />
              </div>
              <div className="text-2xl font-bold">{metric.value}</div>
              <div className="mt-2 h-1 w-full bg-slate-800/50 rounded-full overflow-hidden">
                <div 
                  className={`h-full rounded-full transition-all duration-500 ${
                    metric.status === 'good' ? 'bg-emerald-400' : 
                    metric.status === 'warning' ? 'bg-amber-400' : 'bg-red-400'
                  }`}
                  style={{ 
                    width: `${metric.status === 'good' ? 100 : metric.status === 'warning' ? 60 : 30}%`,
                    opacity: metric.value === 0 ? 0.3 : 1
                  }}
                />
              </div>
              {/* Add contextual message */}
              {metric.label === 'Pending Review' && metric.value === 0 && (
                <div className="mt-1 text-[10px] text-emerald-400/70">✓ All clear</div>
              )}
              {metric.label === 'Total Records' && metric.value === 0 && (
                <div className="mt-1 text-[10px] text-amber-400/70">No records yet</div>
              )}
              {metric.label === 'Verification Rate' && metric.value === '0%' && stats.total > 0 && (
                <div className="mt-1 text-[10px] text-red-400/70">Action needed</div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}