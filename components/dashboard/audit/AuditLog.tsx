// components/dashboard/audit/AuditLog.tsx
'use client';

import { useState, useEffect, useMemo } from 'react';
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
  Database
} from 'lucide-react';

interface AuditRecord {
  id: string;
  action: string;
  actorName: string | null;
  actorEmail: string | null;
  blobId: string | null;
  conversationId: string | null;
  details: any;
  ipAddress: string | null;
  createdAt: string;
}

const ACTION_CONFIG: Record<string, { label: string; icon: React.ReactNode; color: string; description: string }> = {
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

const getActionConfig = (action: string) => ACTION_CONFIG[action] || DEFAULT_CONFIG;

const getUserDisplay = (record: AuditRecord): { name: string; email: string } => {
  // Try to get from details first (where we store actor info)
  const details = record.details;
  if (details && typeof details === 'object') {
    if (details.actorName) {
      return {
        name: details.actorName,
        email: details.actorEmail || 'Unknown',
      };
    }
    if (details.email) {
      return {
        name: details.name || details.email,
        email: details.email,
      };
    }
  }
  
  // Fallback to direct fields
  if (record.actorName) {
    return {
      name: record.actorName,
      email: record.actorEmail || 'Unknown',
    };
  }
  
  // Default for system actions
  return {
    name: 'AnchorProof',
    email: 'system@anchorproof.io',
  };
};

const getDetailSummary = (record: AuditRecord): string => {
  const details = record.details;
  if (!details || typeof details !== 'object') return String(details || '');

  const summaries: Record<string, string> = {
    CONVERSATION_SAVED: `${details.messageCount || 0} messages • Customer: ${details.customerId || 'Unknown'} • Agent: ${details.agentId || 'Unknown'}`,
    CONVERSATION_VERIFIED: `${details.messageCount || 0} messages verified successfully`,
    TAMPER_DETECTED: `Original content didn't match claimed content`,
    API_KEY_CREATED: `"${details.keyName || 'Unnamed'}" • Role: ${details.role || 'viewer'}`,
    API_KEY_REVOKED: `"${details.keyName || 'Unnamed'}"`,
    TENANT_UPDATED: `"${details.oldName}" → "${details.newName}"`,
    REPORT_GENERATED: `"${details.reportName || 'Unnamed'}" • ${details.type || 'full'} • ${details.size || 0}KB`,
    REPORT_DELETED: `"${details.reportName || 'Unnamed'}"`,
    USER_LOGIN: `${details.email || details.name || 'Unknown'}`,
    USER_LOGOUT: `${details.email || details.name || 'Unknown'}`,
    BLOB_RETRIEVED: `${details.blobId || record.blobId || 'Unknown'}`,
  };

  return summaries[record.action] || JSON.stringify(details).slice(0, 100);
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
      second: '2-digit',
    });
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

  const fetchAuditLog = async () => {
    if (!tenant) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const params = new URLSearchParams();
      if (filterAction !== 'all') params.append('action', filterAction);
      params.append('limit', '100');

      const res = await fetch(`/api/audit/list?${params}`);
      const data = await res.json();
      
      if (!res.ok) throw new Error(data.error || 'Failed to fetch audit logs');
      
      setRecords(data.logs || []);
      setTotal(data.total || 0);
    } catch (err) {
      console.error('Failed to fetch audit log:', err);
      setError(err instanceof Error ? err.message : 'Failed to load audit logs');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAuditLog();
  }, [tenant, filterAction]);

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
      <div className="bg-slate-900/50 border border-slate-800/50 rounded-xl p-12 text-center">
        <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
        <p className="text-slate-500 text-sm">Loading audit log...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-slate-900/50 border border-red-500/20 rounded-xl p-12 text-center">
        <AlertTriangle className="w-8 h-8 text-red-400 mx-auto mb-3" />
        <p className="text-red-400 text-sm">{error}</p>
        <button 
          onClick={fetchAuditLog} 
          className="mt-4 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 rounded-lg text-sm text-white transition-colors"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="bg-slate-900/50 border border-slate-800/50 rounded-xl overflow-hidden">
      <div className="px-6 py-3 border-b border-slate-800/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <h2 className="text-sm font-semibold text-white flex items-center gap-2">
          <Shield className="w-4 h-4 text-indigo-400" />
          Audit Trail
          <span className="text-xs text-slate-500 font-normal ml-2">({total} events)</span>
        </h2>
        
        <div className="flex items-center gap-3 flex-wrap">
          <div className="relative">
            <input
              type="text"
              placeholder="Search events..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-48 px-8 py-1.5 bg-slate-800/50 border border-slate-700 rounded-lg text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
            />
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-500" />
          </div>
          
          <select
            value={filterAction}
            onChange={(e) => setFilterAction(e.target.value)}
            className="px-3 py-1.5 bg-slate-800/50 border border-slate-700 rounded-lg text-sm text-slate-300 focus:outline-none focus:border-indigo-500 transition-colors"
          >
            <option value="all">All Actions</option>
            {Object.entries(ACTION_CONFIG)
              .sort((a, b) => a[1].label.localeCompare(b[1].label))
              .map(([key, config]) => (
                <option key={key} value={key}>{config.label}</option>
              ))}
          </select>
          
          <ExportButton records={filteredRecords} disabled={filteredRecords.length === 0} />
        </div>
      </div>

      <div className="overflow-x-auto">
        {filteredRecords.length === 0 ? (
          <div className="py-12 text-center">
            <Shield className="w-10 h-10 text-slate-600 mx-auto mb-3" />
            <p className="text-slate-500 text-sm">
              {records.length === 0 ? 'No audit events yet' : 'No matching records found'}
            </p>
            <p className="text-slate-600 text-xs mt-1">
              {records.length === 0 ? 'Events will appear here as they happen' : 'Try adjusting your search or filters'}
            </p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-800/50 bg-slate-800/20">
                <th className="text-left py-3 px-4 text-slate-500 font-medium text-xs uppercase tracking-wider">Event</th>
                <th className="text-left py-3 px-4 text-slate-500 font-medium text-xs uppercase tracking-wider">User</th>
                <th className="text-left py-3 px-4 text-slate-500 font-medium text-xs uppercase tracking-wider">Details</th>
                <th className="text-left py-3 px-4 text-slate-500 font-medium text-xs uppercase tracking-wider">Date & Time</th>
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
                        <span className={`p-1 rounded ${config.color.replace('border', 'bg').replace('/20', '/10')}`}>
                          {config.icon}
                        </span>
                        <div>
                          <div className="text-white text-xs font-medium">{config.label}</div>
                          <div className="text-slate-500 text-[10px] hidden sm:block">{config.description}</div>
                        </div>
                      </div>
                    </td>
                    
                    <td className="py-3 px-4">
                      <div className="text-white text-xs font-medium">
                        {user.name}
                      </div>
                      <div className="text-slate-500 text-[10px]">
                        {user.email}
                      </div>
                    </td>
                    
                    <td className="py-3 px-4">
                      <div className="text-slate-300 text-xs">
                        {getDetailSummary(record)}
                      </div>
                      {record.blobId && (
                        <div className="text-slate-500 font-mono text-[10px] mt-0.5">
                          Blob: {record.blobId}
                        </div>
                      )}
                      {record.conversationId && (
                        <div className="text-slate-500 font-mono text-[10px] mt-0.5">
                          Conversation: {record.conversationId}
                        </div>
                      )}
                    </td>
                    
                    <td className="py-3 px-4">
                      <div className="text-slate-400 text-xs whitespace-nowrap">
                        <div className="font-medium">{formatDate(record.createdAt)}</div>
                        <div className="text-slate-500 text-[10px]">{formatTime(record.createdAt)}</div>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      <div className="px-6 py-2.5 border-t border-slate-800/50 flex flex-col sm:flex-row sm:items-center justify-between gap-2 bg-slate-900/30">
        <span className="text-xs text-slate-500">
          Showing {filteredRecords.length} of {total} events
        </span>
        <span className="text-[10px] text-slate-500 font-mono flex items-center gap-1.5">
          <Shield className="w-3 h-3" />
          Immutable • On-chain verified • Court-admissible
        </span>
      </div>
    </div>
  );
}