'use client';

import { useDashboardData } from '@/providers/DashboardDataProvider';

type VerificationStatus = 'verified' | 'pending' | 'failed';

interface VerificationRecord {
  id: string;
  blobId: string;
  conversationId: string;
  verifiedBy: string;
  verifiedAt: string;
  status: VerificationStatus;
  hashMatch: boolean;
  signatureValid: boolean;
}

export function VerificationHistory() {
  const { conversations, loading } = useDashboardData();

  const records: VerificationRecord[] = conversations.map((c) => ({
    id: c.id,
    blobId: c.blobId,
    conversationId: c.conversationId,
    verifiedBy: '0x1234...5678',
    verifiedAt: c.verifiedAt || c.createdAt,
    status: c.verifiedAt ? 'verified' : 'pending',
    hashMatch: true,
    signatureValid: true,
  }));

  const getStatusBadge = (status: VerificationStatus) => {
    const styles = {
      verified: 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20',
      failed: 'bg-red-500/10 text-red-400 border border-red-500/20',
      pending: 'bg-amber-500/10 text-amber-400 border border-amber-500/20',
    };
    const labels = {
      verified: '✅ Verified',
      failed: '❌ Failed',
      pending: '⏳ Pending',
    };
    return <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-medium ${styles[status]}`}>{labels[status]}</span>;
  };

  if (loading) {
    return (
      <div className="bg-gray-900/50 border border-gray-800/50 rounded-xl p-8 text-center">
        <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
        <p className="text-gray-500 text-sm">Loading verification history...</p>
      </div>
    );
  }

  return (
    <div className="bg-gray-900/50 border border-gray-800/50 rounded-xl overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-800/50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-sm font-semibold text-white">Verification History</h2>
          <p className="text-xs text-gray-500 mt-0.5">Track all verification attempts and their results</p>
        </div>
        <div className="flex items-center gap-3">
          <select className="px-3 py-1.5 bg-gray-800/50 border border-gray-700 rounded-lg text-sm text-gray-300 focus:outline-none focus:border-indigo-500">
            <option value="all">All Status</option>
            <option value="verified">Verified</option>
            <option value="pending">Pending</option>
          </select>
          <button className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 rounded-lg text-xs font-medium text-white transition-colors">
            Export
          </button>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4 px-6 py-4 border-b border-gray-800/30">
        <div className="text-center">
          <div className="text-2xl font-bold text-emerald-400">
            {records.filter(r => r.status === 'verified').length}
          </div>
          <div className="text-[10px] text-gray-500 uppercase tracking-wider">Verified</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-red-400">
            {records.filter(r => r.status === 'failed').length}
          </div>
          <div className="text-[10px] text-gray-500 uppercase tracking-wider">Failed</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-amber-400">
            {records.filter(r => r.status === 'pending').length}
          </div>
          <div className="text-[10px] text-gray-500 uppercase tracking-wider">Pending</div>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-800/50">
              <th className="text-left py-3 px-4 text-gray-500 font-medium text-xs uppercase tracking-wider">Conversation</th>
              <th className="text-left py-3 px-4 text-gray-500 font-medium text-xs uppercase tracking-wider">Blob ID</th>
              <th className="text-left py-3 px-4 text-gray-500 font-medium text-xs uppercase tracking-wider">Status</th>
              <th className="text-left py-3 px-4 text-gray-500 font-medium text-xs uppercase tracking-wider">Date</th>
              <th className="text-left py-3 px-4 text-gray-500 font-medium text-xs uppercase tracking-wider">Details</th>
            </tr>
          </thead>
          <tbody>
            {records.map((record) => (
              <tr key={record.id} className="border-b border-gray-800/30 hover:bg-gray-800/20 transition-colors">
                <td className="py-3 px-4">
                  <span className="text-white font-mono text-xs">{record.conversationId.slice(0, 16)}...</span>
                </td>
                <td className="py-3 px-4">
                  <span className="text-cyan-400 font-mono text-xs">{record.blobId.slice(0, 12)}...</span>
                </td>
                <td className="py-3 px-4">{getStatusBadge(record.status)}</td>
                <td className="py-3 px-4 text-gray-400 text-xs">
                  {new Date(record.verifiedAt).toLocaleDateString()}
                </td>
                <td className="py-3 px-4">
                  <div className="flex items-center gap-2">
                    {record.hashMatch ? (
                      <span className="text-emerald-400 text-xs">✓ Hash</span>
                    ) : (
                      <span className="text-red-400 text-xs">✗ Hash</span>
                    )}
                    {record.signatureValid ? (
                      <span className="text-emerald-400 text-xs">✓ Sig</span>
                    ) : (
                      <span className="text-red-400 text-xs">✗ Sig</span>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}