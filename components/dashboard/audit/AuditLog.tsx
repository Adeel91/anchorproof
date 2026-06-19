// components/dashboard/audit/AuditLog.tsx
'use client';

import { useState, useEffect } from 'react';
import { useDashboardData } from '@/providers/DashboardDataProvider';
import { ExportButton } from './ExportButton';
import { 
  Search, 
  Shield, 
  Clock, 
  FileCheck, 
  FileUp, 
  Trash2, 
  Key, 
  User, 
  AlertTriangle 
} from 'lucide-react';

interface AuditRecord {
  id: string;
  action: string;
  actorId: string;
  actorName: string | null;
  actorEmail: string | null;
  blobId: string | null;
  conversationId: string | null;
  details: any;
  ipAddress: string | null;
  timestamp: string;
  createdAt: string;
}

const ACTION_CONFIG: Record<string, { label: string; icon: React.ReactNode; color: string }> = {
  CONVERSATION_SAVED: {
    label: 'Conversation Saved',
    icon: <FileUp className="w-3 h-3" />,
    color: 'bg-blue-500/10 text-blue-400 border border-blue-500/20',
  },
  CONVERSATION_VERIFIED: {
    label: 'Verified',
    icon: <FileCheck className="w-3 h-3" />,
    color: 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20',
  },
  BLOB_RETRIEVED: {
    label: 'Blob Retrieved',
    icon: <FileCheck className="w-3 h-3" />,
    color: 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20',
  },
  API_KEY_CREATED: {
    label: 'API Key Created',
    icon: <Key className="w-3 h-3" />,
    color: 'bg-purple-500/10 text-purple-400 border border-purple-500/20',
  },
  API_KEY_REVOKED: {
    label: 'API Key Revoked',
    icon: <Trash2 className="w-3 h-3" />,
    color: 'bg-red-500/10 text-red-400 border border-red-500/20',
  },
  TENANT_UPDATED: {
    label: 'Tenant Updated',
    icon: <User className="w-3 h-3" />,
    color: 'bg-amber-500/10 text-amber-400 border border-amber-500/20',
  },
  USER_LOGIN: {
    label: 'User Login',
    icon: <User className="w-3 h-3" />,
    color: 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20',
  },
  USER_LOGOUT: {
    label: 'User Logout',
    icon: <User className="w-3 h-3" />,
    color: 'bg-gray-500/10 text-gray-400 border border-gray-500/20',
  },
  TAMPER_DETECTED: {
    label: '⚠️ Tamper Detected!',
    icon: <AlertTriangle className="w-3 h-3" />,
    color: 'bg-red-500/10 text-red-400 border border-red-500/20',
  },
  VERIFICATION_FAILED: {
    label: 'Verification Failed',
    icon: <AlertTriangle className="w-3 h-3" />,
    color: 'bg-red-500/10 text-red-400 border border-red-500/20',
  },
};

const getDetailText = (record: AuditRecord) => {
  const details = record.details;
  if (!details || typeof details !== 'object') return details || 'No details';

  const actionMap: Record<string, string> = {
    CONVERSATION_SAVED: `Saved ${details.messageCount || 0} messages`,
    CONVERSATION_VERIFIED: '✓ Verified successfully',
    TAMPER_DETECTED: '⚠️ Tampering detected!',
    API_KEY_CREATED: `Created "${details.keyName}"`,
    API_KEY_REVOKED: `Revoked "${details.keyName}"`,
    TENANT_UPDATED: `Renamed from "${details.oldName}" to "${details.newName}"`,
  };

  return actionMap[record.action] || JSON.stringify(details).slice(0, 50);
};

export function AuditLog() {
  const { tenant } = useDashboardData();
  const [records, setRecords] = useState<AuditRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterAction, setFilterAction] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [total, setTotal] = useState(0);

  useEffect(() => {
    if (tenant) fetchAuditLog();
  }, [tenant, filterAction]);

  const fetchAuditLog = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filterAction !== 'all') params.append('action', filterAction);
      params.append('limit', '100');

      const res = await fetch(`/api/audit/list?${params}`);
      const data = await res.json();
      if (res.ok) {
        setRecords(data.logs || []);
        setTotal(data.total || 0);
      }
    } catch (error) {
      console.error('Failed to fetch audit log:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredRecords = records.filter(r => {
    if (!searchTerm) return true;
    const s = searchTerm.toLowerCase();
    return (
      r.actorName?.toLowerCase().includes(s) ||
      r.actorEmail?.toLowerCase().includes(s) ||
      r.action.toLowerCase().includes(s) ||
      r.details?.toString().toLowerCase().includes(s)
    );
  });

  if (loading) {
    return (
      <div className="bg-slate-900/50 border border-slate-800/50 rounded-xl p-8 text-center">
        <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
        <p className="text-slate-500 text-sm">Loading audit log...</p>
      </div>
    );
  }

  return (
    <div className="bg-slate-900/50 border border-slate-800/50 rounded-xl overflow-hidden">
      {/* Header */}
      <div className="px-6 py-4 border-b border-slate-800/50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-sm font-semibold text-white flex items-center gap-2">
            <Shield className="w-4 h-4 text-indigo-400" />
            Audit Log
          </h2>
          <p className="text-xs text-slate-500">{total} events • Immutable & verified</p>
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          <div className="relative">
            <input
              type="text"
              placeholder="Search..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-40 px-8 py-1.5 bg-slate-800/50 border border-slate-700 rounded-lg text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
            />
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-500" />
          </div>
          <select
            value={filterAction}
            onChange={(e) => setFilterAction(e.target.value)}
            className="px-3 py-1.5 bg-slate-800/50 border border-slate-700 rounded-lg text-sm text-slate-300 focus:outline-none focus:border-indigo-500"
          >
            <option value="all">All Actions</option>
            {Object.entries(ACTION_CONFIG).map(([key, config]) => (
              <option key={key} value={key}>{config.label}</option>
            ))}
          </select>
          <ExportButton records={filteredRecords} disabled={filteredRecords.length === 0} />
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-800/50">
              <th className="text-left py-3 px-4 text-slate-500 font-medium text-xs uppercase tracking-wider">Action</th>
              <th className="text-left py-3 px-4 text-slate-500 font-medium text-xs uppercase tracking-wider">Actor</th>
              <th className="text-left py-3 px-4 text-slate-500 font-medium text-xs uppercase tracking-wider">Details</th>
              <th className="text-left py-3 px-4 text-slate-500 font-medium text-xs uppercase tracking-wider">Timestamp</th>
            </tr>
          </thead>
          <tbody>
            {filteredRecords.length === 0 ? (
              <tr>
                <td colSpan={4} className="py-8 text-center text-slate-500 text-sm">
                  No audit records found
                </td>
              </tr>
            ) : (
              filteredRecords.map((record) => {
                const config = ACTION_CONFIG[record.action] || ACTION_CONFIG.CONVERSATION_SAVED;
                return (
                  <tr key={record.id} className="border-b border-slate-800/30 hover:bg-slate-800/20 transition-colors">
                    <td className="py-3 px-4">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-medium flex items-center gap-1.5 ${config.color}`}>
                        {config.icon}
                        {config.label}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="text-white text-xs font-medium">{record.actorName || 'Unknown'}</div>
                      <div className="text-slate-500 text-[10px]">{record.actorEmail || 'No email'}</div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="text-slate-300 text-xs">{getDetailText(record)}</div>
                      {record.blobId && (
                        <div className="text-slate-500 font-mono text-[10px] mt-0.5">Blob: {record.blobId.slice(0, 12)}...</div>
                      )}
                    </td>
                    <td className="py-3 px-4 text-slate-400 text-xs">
                      <div className="flex items-center gap-1.5">
                        <Clock className="w-3 h-3" />
                        {new Date(record.timestamp).toLocaleString()}
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Footer */}
      <div className="px-6 py-3 border-t border-slate-800/50 flex items-center justify-between bg-slate-900/30">
        <span className="text-xs text-slate-500">Showing {filteredRecords.length} of {total} records</span>
        <span className="text-[10px] text-slate-500 font-mono">🔒 Audit trail is immutable and cryptographically verified</span>
      </div>
    </div>
  );
}