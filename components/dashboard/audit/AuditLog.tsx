'use client';

import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { useDashboardData } from '@/providers/DashboardDataProvider';
import { ExportButton } from './ExportButton';
import {
  Search,
  Shield,
  FileCheck,
  FileUp,
  Trash2,
  Key,
  AlertTriangle,
  LogIn,
  LogOut,
  RefreshCw,
  Database,
  User,
} from 'lucide-react';

interface AuditRecord {
  id: string;
  action: string;
  actorName: string | null;
  actorEmail: string | null;
  blobId: string | null;
  conversationId: string | null;
  details: Record<string, unknown> | null;
  ipAddress: string | null;
  createdAt: string;
}

const ACTION_CONFIG: Record<
  string,
  { label: string; icon: React.ReactNode; color: string; description: string }
> = {
  CONVERSATION_SAVED: {
    label: 'Conversation Saved',
    icon: <FileUp className="w-3 h-3" />,
    color: 'bg-blue-500/10 text-blue-400 border border-blue-500/20',
    description: 'Encrypted and stored on Walrus',
  },
  CONVERSATION_VERIFIED: {
    label: 'Verified',
    icon: <FileCheck className="w-3 h-3" />,
    color: 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20',
    description: 'Verified against on-chain record',
  },
  BLOB_RETRIEVED: {
    label: 'Blob Retrieved',
    icon: <Database className="w-3 h-3" />,
    color: 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20',
    description: 'Fetched from Walrus storage',
  },
  API_KEY_CREATED: {
    label: 'API Key Created',
    icon: <Key className="w-3 h-3" />,
    color: 'bg-purple-500/10 text-purple-400 border border-purple-500/20',
    description: 'New API key generated',
  },
  API_KEY_REVOKED: {
    label: 'API Key Revoked',
    icon: <Trash2 className="w-3 h-3" />,
    color: 'bg-red-500/10 text-red-400 border border-red-500/20',
    description: 'API key permanently revoked',
  },
  TENANT_UPDATED: {
    label: 'Tenant Updated',
    icon: <RefreshCw className="w-3 h-3" />,
    color: 'bg-amber-500/10 text-amber-400 border border-amber-500/20',
    description: 'Tenant configuration updated',
  },
  USER_LOGIN: {
    label: 'User Login',
    icon: <LogIn className="w-3 h-3" />,
    color: 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20',
    description: 'User authenticated',
  },
  USER_LOGOUT: {
    label: 'User Logout',
    icon: <LogOut className="w-3 h-3" />,
    color: 'bg-gray-500/10 text-gray-400 border border-gray-500/20',
    description: 'User session ended',
  },
  TAMPER_DETECTED: {
    label: 'Tamper Detected!',
    icon: <AlertTriangle className="w-3 h-3" />,
    color: 'bg-red-500/10 text-red-400 border border-red-500/20',
    description: 'CRITICAL: Data tampering detected',
  },
  VERIFICATION_FAILED: {
    label: 'Verification Failed',
    icon: <AlertTriangle className="w-3 h-3" />,
    color: 'bg-red-500/10 text-red-400 border border-red-500/20',
    description: 'Verification check failed',
  },
  REPORT_GENERATED: {
    label: 'Report Generated',
    icon: <FileCheck className="w-3 h-3" />,
    color: 'bg-green-500/10 text-green-400 border border-green-500/20',
    description: 'Compliance report generated',
  },
  REPORT_DELETED: {
    label: 'Report Deleted',
    icon: <Trash2 className="w-3 h-3" />,
    color: 'bg-red-500/10 text-red-400 border border-red-500/20',
    description: 'Report permanently deleted',
  },
};

const DEFAULT_CONFIG = {
  label: 'Unknown Action',
  icon: <Shield className="w-3 h-3" />,
  color: 'bg-slate-500/10 text-slate-400 border border-slate-500/20',
  description: 'Unknown action type',
};

const getActionConfig = (action: string) =>
  ACTION_CONFIG[action] || DEFAULT_CONFIG;

const getUserDisplay = (
  record: AuditRecord
): { name: string; email: string } => {
  const details = record.details;
  if (details && typeof details === 'object') {
    if ('actorName' in details && details.actorName) {
      return {
        name: String(details.actorName),
        email: details.actorEmail ? String(details.actorEmail) : 'Unknown',
      };
    }
    if ('email' in details && details.email) {
      return {
        name:
          'name' in details && details.name
            ? String(details.name)
            : String(details.email),
        email: String(details.email),
      };
    }
  }

  if (record.actorName) {
    return {
      name: record.actorName,
      email: record.actorEmail || 'Unknown',
    };
  }

  return {
    name: 'AnchorProof',
    email: 'system@anchorproof.io',
  };
};

const getDetailSummary = (record: AuditRecord): string => {
  const details = record.details;
  if (!details || typeof details !== 'object') return String(details || '');

  const summaries: Record<string, string> = {
    CONVERSATION_SAVED: `${(details.messageCount as number) || 0} messages • Customer: ${(details.customerId as string) || 'Unknown'} • Agent: ${(details.agentId as string) || 'Unknown'}`,
    CONVERSATION_VERIFIED: `${(details.messageCount as number) || 0} messages verified`,
    TAMPER_DETECTED: `⚠️ Tampering detected!`,
    API_KEY_CREATED: `"${(details.keyName as string) || 'Unnamed'}" • ${(details.role as string) || 'viewer'}`,
    API_KEY_REVOKED: `"${(details.keyName as string) || 'Unnamed'}"`,
    TENANT_UPDATED: `"${details.oldName as string}" → "${details.newName as string}"`,
    REPORT_GENERATED: `"${(details.reportName as string) || 'Unnamed'}" • ${(details.type as string) || 'full'}`,
    REPORT_DELETED: `"${(details.reportName as string) || 'Unnamed'}"`,
    USER_LOGIN: `${(details.email as string) || (details.name as string) || 'Unknown'}`,
    USER_LOGOUT: `${(details.email as string) || (details.name as string) || 'Unknown'}`,
    BLOB_RETRIEVED: `${(details.blobId as string) || record.blobId || 'Unknown'}`,
  };

  return summaries[record.action] || JSON.stringify(details).slice(0, 60);
};

const formatDate = (timestamp: string) => {
  try {
    return new Date(timestamp).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  } catch {
    return timestamp;
  }
};

const formatTime = (timestamp: string) => {
  try {
    return new Date(timestamp).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return timestamp;
  }
};

const formatRelativeTime = (timestamp: string) => {
  try {
    const now = new Date();
    const then = new Date(timestamp);
    const diffMs = now.getTime() - then.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return formatDate(timestamp);
  } catch {
    return timestamp;
  }
};

export function AuditLog() {
  const { tenant } = useDashboardData();
  const [records, setRecords] = useState<AuditRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filterAction, setFilterAction] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [total, setTotal] = useState(0);
  const isMounted = useRef(true);
  const hasFetched = useRef(false);

  const fetchAuditLog = useCallback(async () => {
    if (!tenant || !isMounted.current || hasFetched.current) return;
    hasFetched.current = true;

    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams();
      if (filterAction !== 'all') params.append('action', filterAction);
      params.append('limit', '100');

      const res = await fetch(`/api/audit/list?${params}`);
      const data = await res.json();

      if (!isMounted.current) return;

      if (!res.ok) throw new Error(data.error || 'Failed to fetch audit logs');

      setRecords(data.logs || []);
      setTotal(data.total || 0);
    } catch (err) {
      if (!isMounted.current) return;
      console.error('Failed to fetch audit log:', err);
      setError(
        err instanceof Error ? err.message : 'Failed to load audit logs'
      );
    } finally {
      if (isMounted.current) {
        setLoading(false);
      }
    }
  }, [tenant, filterAction]);

  useEffect(() => {
    isMounted.current = true;
    hasFetched.current = false;

    const timer = setTimeout(() => {
      fetchAuditLog();
    }, 0);

    return () => {
      isMounted.current = false;
      clearTimeout(timer);
    };
  }, [fetchAuditLog]);

  useEffect(() => {
    hasFetched.current = false;
  }, [filterAction]);

  const filteredRecords = useMemo(() => {
    if (!searchTerm.trim()) return records;

    const search = searchTerm.toLowerCase().trim();
    return records.filter((record) => {
      const user = getUserDisplay(record);
      return (
        user.name.toLowerCase().includes(search) ||
        user.email.toLowerCase().includes(search) ||
        record.action.toLowerCase().includes(search) ||
        record.blobId?.toLowerCase().includes(search) ||
        record.conversationId?.toLowerCase().includes(search) ||
        record.details?.toString().toLowerCase().includes(search)
      );
    });
  }, [records, searchTerm]);

  if (loading) {
    return (
      <div className="bg-slate-900/50 border border-slate-800/50 rounded-xl p-8 text-center">
        <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
        <p className="text-slate-500 text-sm">Loading audit log...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-slate-900/50 border border-red-500/20 rounded-xl p-8 text-center">
        <AlertTriangle className="w-8 h-8 text-red-400 mx-auto mb-3" />
        <p className="text-red-400 text-sm">{error}</p>
        <button
          onClick={() => {
            hasFetched.current = false;
            fetchAuditLog();
          }}
          className="mt-4 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 rounded-lg text-sm text-white transition-colors"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="bg-slate-900/50 border border-slate-800/50 rounded-xl overflow-hidden">
      <div className="px-4 sm:px-6 py-3 sm:py-4 border-b border-slate-800/50 flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Shield className="w-4 h-4 text-indigo-400 flex-shrink-0" />
          <h2 className="text-sm font-semibold text-white">Audit Trail</h2>
          <span className="text-xs text-slate-500">({total} events)</span>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full md:w-auto">
          <div className="relative flex-1 sm:flex-none">
            <input
              type="text"
              placeholder="Search..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full sm:w-48 md:w-44 lg:w-48 pl-8 pr-3 py-1.5 bg-slate-800/50 border border-slate-700 rounded-lg text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
            />
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-500" />
          </div>

          <select
            value={filterAction}
            onChange={(e) => setFilterAction(e.target.value)}
            className="px-3 py-1.5 bg-slate-800/50 border border-slate-700 rounded-lg text-sm text-slate-300 focus:outline-none focus:border-indigo-500 transition-colors w-full sm:w-auto"
          >
            <option value="all">All Actions</option>
            {Object.entries(ACTION_CONFIG)
              .sort((a, b) => a[1].label.localeCompare(b[1].label))
              .map(([key, config]) => (
                <option key={key} value={key}>
                  {config.label}
                </option>
              ))}
          </select>

          <ExportButton
            records={filteredRecords}
            disabled={filteredRecords.length === 0}
          />
        </div>
      </div>

      <div className="sm:hidden divide-y divide-slate-800/30">
        {filteredRecords.length === 0 ? (
          <div className="py-12 text-center">
            <Shield className="w-10 h-10 text-slate-600 mx-auto mb-3" />
            <p className="text-slate-500 text-sm">No events found</p>
          </div>
        ) : (
          filteredRecords.map((record) => {
            const config = getActionConfig(record.action);
            const user = getUserDisplay(record);

            return (
              <div
                key={record.id}
                className="px-4 py-3 hover:bg-slate-800/20 transition-colors"
              >
                <div className="flex items-start gap-3">
                  <span
                    className={`p-1.5 rounded-lg ${config.color.replace('border', 'bg').replace('/20', '/10')} flex-shrink-0 mt-0.5`}
                  >
                    {config.icon}
                  </span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="text-sm font-medium text-white">
                          {config.label}
                        </p>
                        <p className="text-xs text-slate-400 truncate">
                          {getDetailSummary(record)}
                        </p>
                      </div>
                      <span className="text-[10px] text-slate-500 whitespace-nowrap flex-shrink-0">
                        {formatRelativeTime(record.createdAt)}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 mt-1.5">
                      <div className="flex items-center gap-1 text-[10px] text-slate-500">
                        <User className="w-3 h-3" />
                        <span className="truncate max-w-[100px]">
                          {user.name}
                        </span>
                      </div>
                      {record.blobId && (
                        <span className="text-[8px] text-slate-600 font-mono truncate max-w-[80px]">
                          #{record.blobId.slice(0, 8)}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      <div className="hidden sm:block overflow-x-auto">
        {filteredRecords.length === 0 ? (
          <div className="py-12 text-center">
            <Shield className="w-10 h-10 text-slate-600 mx-auto mb-3" />
            <p className="text-slate-500 text-sm">No events found</p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-800/50 bg-slate-800/20">
                <th className="text-left py-3 px-4 text-slate-500 font-medium text-xs uppercase tracking-wider">
                  Event
                </th>
                <th className="text-left py-3 px-4 text-slate-500 font-medium text-xs uppercase tracking-wider hidden md:table-cell">
                  User
                </th>
                <th className="text-left py-3 px-4 text-slate-500 font-medium text-xs uppercase tracking-wider">
                  Details
                </th>
                <th className="text-left py-3 px-4 text-slate-500 font-medium text-xs uppercase tracking-wider hidden lg:table-cell">
                  Date & Time
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredRecords.map((record) => {
                const config = getActionConfig(record.action);
                const user = getUserDisplay(record);

                return (
                  <tr
                    key={record.id}
                    className="border-b border-slate-800/30 hover:bg-slate-800/20 transition-colors"
                  >
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <span
                          className={`p-1 rounded ${config.color.replace('border', 'bg').replace('/20', '/10')}`}
                        >
                          {config.icon}
                        </span>
                        <div>
                          <div className="text-sm font-medium text-white">
                            {config.label}
                          </div>
                          <div className="text-[10px] text-slate-500 hidden lg:block">
                            {config.description}
                          </div>
                        </div>
                      </div>
                    </td>

                    <td className="hidden md:table-cell py-3 px-4">
                      <div className="text-sm text-white truncate max-w-[120px]">
                        {user.name}
                      </div>
                      <div className="text-[10px] text-slate-500 truncate max-w-[120px]">
                        {user.email}
                      </div>
                    </td>

                    <td className="py-3 px-4">
                      <div className="text-xs text-slate-300 max-w-[180px] lg:max-w-none truncate lg:whitespace-normal">
                        {getDetailSummary(record)}
                      </div>
                      {record.blobId && (
                        <div className="text-[10px] text-slate-500 font-mono truncate max-w-[120px]">
                          Blob: {record.blobId.slice(0, 12)}...
                        </div>
                      )}
                    </td>

                    <td className="hidden lg:table-cell py-3 px-4">
                      <div className="text-xs text-slate-400 whitespace-nowrap">
                        <div className="font-medium">
                          {formatDate(record.createdAt)}
                        </div>
                        <div className="text-[10px] text-slate-500">
                          {formatTime(record.createdAt)}
                        </div>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      <div className="px-4 sm:px-6 py-2.5 border-t border-slate-800/50 bg-slate-900/30 flex flex-col sm:flex-row sm:items-center justify-between gap-1.5">
        <span className="text-xs text-slate-500">
          Showing {filteredRecords.length} of {total} events
        </span>
        <span className="text-[8px] sm:text-[10px] text-slate-500 font-mono flex items-center gap-1.5">
          <Shield className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
          <span className="hidden xs:inline">
            Immutable • On-chain verified
          </span>
          <span className="xs:hidden">Immutable • Verified</span>
        </span>
      </div>
    </div>
  );
}
