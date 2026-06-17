'use client';

import { useState } from 'react';
import { useDashboardData } from '@/providers/DashboardDataProvider';
import { ConversationDetail } from './ConversationDetail';

export function ConversationList() {
  const { conversations, loading, refetch } = useDashboardData();
  const [selectedBlobId, setSelectedBlobId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  const handleVerify = async (blobId: string) => {
    try {
      const res = await fetch('/api/walrus/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ blobId }),
      });
      const data = await res.json();
      alert(data.message);
      refetch();
    } catch (error) {
      alert('Verification failed');
    }
  };

  const filteredConversations = conversations.filter((conv) => {
    const matchesSearch = conv.conversationId.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         conv.customerId.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === 'all' ||
                         (filterStatus === 'verified' && conv.verifiedAt) ||
                         (filterStatus === 'pending' && !conv.verifiedAt);
    return matchesSearch && matchesFilter;
  });

  if (loading) {
    return (
      <div className="bg-gray-900/50 border border-gray-800/50 rounded-xl p-8 text-center">
        <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
        <p className="text-gray-500 text-sm">Loading conversations...</p>
      </div>
    );
  }

  return (
    <>
      <div className="bg-gray-900/50 border border-gray-800/50 rounded-xl overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-800/50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <h2 className="text-sm font-semibold text-white">All Conversations</h2>
          <div className="flex items-center gap-3">
            <div className="relative">
              <input
                type="text"
                placeholder="Search..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-48 px-3 py-1.5 bg-gray-800/50 border border-gray-700 rounded-lg text-sm text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500 transition-colors"
              />
              <svg className="absolute right-3 top-1.5 w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-3 py-1.5 bg-gray-800/50 border border-gray-700 rounded-lg text-sm text-gray-300 focus:outline-none focus:border-indigo-500 transition-colors"
            >
              <option value="all">All</option>
              <option value="verified">Verified</option>
              <option value="pending">Pending</option>
            </select>
          </div>
        </div>

        {filteredConversations.length === 0 ? (
          <div className="p-12 text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-800/50 flex items-center justify-center">
              <svg className="w-8 h-8 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            </div>
            <p className="text-gray-400 text-sm">No conversations found</p>
            <p className="text-gray-500 text-xs mt-1">Try adjusting your search or filters</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-800/50">
                  <th className="text-left py-3 px-4 text-gray-500 font-medium text-xs uppercase tracking-wider">Conversation</th>
                  <th className="text-left py-3 px-4 text-gray-500 font-medium text-xs uppercase tracking-wider">Customer</th>
                  <th className="text-left py-3 px-4 text-gray-500 font-medium text-xs uppercase tracking-wider">Messages</th>
                  <th className="text-left py-3 px-4 text-gray-500 font-medium text-xs uppercase tracking-wider">Status</th>
                  <th className="text-left py-3 px-4 text-gray-500 font-medium text-xs uppercase tracking-wider">Date</th>
                  <th className="text-right py-3 px-4 text-gray-500 font-medium text-xs uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredConversations.map((conv) => (
                  <tr
                    key={conv.id}
                    className="border-b border-gray-800/30 hover:bg-gray-800/20 cursor-pointer transition-colors"
                    onClick={() => setSelectedBlobId(conv.blobId)}
                  >
                    <td className="py-3 px-4">
                      <span className="text-white font-mono text-xs">{conv.conversationId.slice(0, 20)}...</span>
                    </td>
                    <td className="py-3 px-4 text-gray-400 text-xs">{conv.customerId}</td>
                    <td className="py-3 px-4 text-gray-400 text-xs">{conv.messageCount}</td>
                    <td className="py-3 px-4">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-medium ${
                        conv.verifiedAt
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                          : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                      }`}>
                        {conv.verifiedAt ? 'Verified' : 'Pending'}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-gray-400 text-xs">
                      {new Date(conv.createdAt).toLocaleDateString()}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedBlobId(conv.blobId);
                        }}
                        className="text-indigo-400 hover:text-indigo-300 text-xs font-medium mr-3 transition-colors"
                      >
                        Details
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleVerify(conv.blobId);
                        }}
                        className="text-cyan-400 hover:text-cyan-300 text-xs font-medium mr-3 transition-colors"
                      >
                        Verify
                      </button>
                      <a
                        href={`https://walruscan.com/testnet/blob/${conv.blobId}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="text-gray-500 hover:text-gray-400 text-xs transition-colors"
                      >
                        Walrus
                      </a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {selectedBlobId && (
        <ConversationDetail
          blobId={selectedBlobId}
          onClose={() => setSelectedBlobId(null)}
        />
      )}
    </>
  );
}