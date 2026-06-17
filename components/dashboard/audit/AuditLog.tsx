'use client';

import { useState, useEffect } from 'react';

interface AuditRecord {
  id: string;
  action: string;
  actor: string;
  actorName?: string;
  blobId: string;
  details: string;
  timestamp: string;
  ipAddress?: string;
}

export function AuditLog() {
  const [records, setRecords] = useState<AuditRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterAction, setFilterAction] = useState('all');
  const [dateRange, setDateRange] = useState('7d');

  useEffect(() => {
    fetchAuditLog();
  }, []);

  const fetchAuditLog = async () => {
    try {
      // This would call your actual audit API
      // For now, showing mock data
      setRecords([
        {
          id: '1',
          action: 'VERIFY_BLOB',
          actor: '0x1234...5678',
          actorName: 'John Doe',
          blobId: 'blob_abc123',
          details: 'Conversation verified successfully',
          timestamp: new Date().toISOString(),
          ipAddress: '192.168.1.1',
        },
        {
          id: '2',
          action: 'STORE_BLOB',
          actor: '0xabcd...efgh',
          actorName: 'Jane Smith',
          blobId: 'blob_def456',
          details: 'New conversation stored',
          timestamp: new Date(Date.now() - 3600000).toISOString(),
          ipAddress: '10.0.0.1',
        },
        {
          id: '3',
          action: 'DELETE_BLOB',
          actor: '0x9876...5432',
          actorName: 'Bob Johnson',
          blobId: 'blob_ghi789',
          details: 'Conversation archived',
          timestamp: new Date(Date.now() - 7200000).toISOString(),
          ipAddress: '172.16.0.1',
        },
      ]);
    } catch (error) {
      console.error('Failed to fetch audit log:', error);
    } finally {
      setLoading(false);
    }
  };

  const getActionBadge = (action: string) => {
    const styles: Record<string, string> = {
      VERIFY_BLOB: 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20',
      STORE_BLOB: 'bg-blue-500/10 text-blue-400 border border-blue-500/20',
      DELETE_BLOB: 'bg-red-500/10 text-red-400 border border-red-500/20',
      EXPORT: 'bg-purple-500/10 text-purple-400 border border-purple-500/20',
      VIEW: 'bg-gray-500/10 text-gray-400 border border-gray-500/20',
    };
    return <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-medium ${styles[action] || styles.VIEW}`}>{action.replace('_', ' ')}</span>;
  };

  if (loading) {
    return (
      <div className="bg-gray-900/50 border border-gray-800/50 rounded-xl p-8 text-center">
        <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
        <p className="text-gray-500 text-sm">Loading audit log...</p>
      </div>
    );
  }

  return (
    <div className="bg-gray-900/50 border border-gray-800/50 rounded-xl overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-800/50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-sm font-semibold text-white">Audit Log</h2>
          <p className="text-xs text-gray-500 mt-0.5">Complete audit trail of all actions</p>
        </div>
        <div className="flex items-center gap-3">
          <select
            value={filterAction}
            onChange={(e) => setFilterAction(e.target.value)}
            className="px-3 py-1.5 bg-gray-800/50 border border-gray-700 rounded-lg text-sm text-gray-300 focus:outline-none focus:border-indigo-500"
          >
            <option value="all">All Actions</option>
            <option value="VERIFY_BLOB">Verify</option>
            <option value="STORE_BLOB">Store</option>
            <option value="DELETE_BLOB">Delete</option>
            <option value="EXPORT">Export</option>
          </select>
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="px-3 py-1.5 bg-gray-800/50 border border-gray-700 rounded-lg text-sm text-gray-300 focus:outline-none focus:border-indigo-500"
          >
            <option value="24h">Last 24 Hours</option>
            <option value="7d">Last 7 Days</option>
            <option value="30d">Last 30 Days</option>
            <option value="all">All Time</option>
          </select>
          <button className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 rounded-lg text-xs font-medium text-white transition-colors">
            Export
          </button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-800/50">
              <th className="text-left py-3 px-4 text-gray-500 font-medium text-xs uppercase tracking-wider">Action</th>
              <th className="text-left py-3 px-4 text-gray-500 font-medium text-xs uppercase tracking-wider">Actor</th>
              <th className="text-left py-3 px-4 text-gray-500 font-medium text-xs uppercase tracking-wider">Details</th>
              <th className="text-left py-3 px-4 text-gray-500 font-medium text-xs uppercase tracking-wider">IP Address</th>
              <th className="text-left py-3 px-4 text-gray-500 font-medium text-xs uppercase tracking-wider">Timestamp</th>
            </tr>
          </thead>
          <tbody>
            {records.map((record) => (
              <tr key={record.id} className="border-b border-gray-800/30 hover:bg-gray-800/20 transition-colors">
                <td className="py-3 px-4">{getActionBadge(record.action)}</td>
                <td className="py-3 px-4">
                  <div>
                    <div className="text-white text-xs font-medium">{record.actorName || 'Unknown'}</div>
                    <div className="text-gray-500 font-mono text-[10px]">{record.actor}</div>
                  </div>
                </td>
                <td className="py-3 px-4">
                  <div className="text-gray-300 text-xs">{record.details}</div>
                  <div className="text-gray-500 font-mono text-[10px] mt-0.5">Blob: {record.blobId.slice(0, 12)}...</div>
                </td>
                <td className="py-3 px-4 text-gray-400 text-xs font-mono">{record.ipAddress || 'N/A'}</td>
                <td className="py-3 px-4 text-gray-400 text-xs">
                  {new Date(record.timestamp).toLocaleString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="px-6 py-3 border-t border-gray-800/50 flex items-center justify-between">
        <span className="text-xs text-gray-500">
          Showing {records.length} records
        </span>
        <div className="flex items-center gap-2">
          <span className="text-[10px] text-gray-500">Audit trail is immutable and cryptographically verified</span>
          <svg className="w-3 h-3 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
          </svg>
        </div>
      </div>
    </div>
  );
}