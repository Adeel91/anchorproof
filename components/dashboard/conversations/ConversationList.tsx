// components/dashboard/conversations/ConversationList.tsx
'use client';

import { useState } from 'react';
import { useDashboardData } from '@/providers/DashboardDataProvider';
import { ConversationDetail } from './ConversationDetail';
import { Search, MessageSquare, AlertTriangle, CheckCircle, Clock, ExternalLink } from 'lucide-react';

export function ConversationList() {
  const { conversations, loading, refetch } = useDashboardData();
  const [selectedBlobId, setSelectedBlobId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  const handleVerify = async (blobId: string) => {
    if (!blobId) {
      alert('No blob ID available');
      return;
    }

    try {
      const res = await fetch('/api/walrus/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ blobId }),
      });
      const data = await res.json();
      
      if (res.ok) {
        alert(data.message || 'Verification successful');
        refetch();
      } else {
        alert(data.error || 'Verification failed');
      }
    } catch (error) {
      console.error('Verification error:', error);
      alert('Verification failed');
    }
  };

  const getStatusBadge = (conv: any) => {
    // Check integrity tampered flag
    if (conv.integrity?.tampered) {
      return (
        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-medium flex items-center gap-1.5 bg-red-500/10 text-red-400 border border-red-500/20">
          <AlertTriangle className="w-3 h-3" />
          Tampered
        </span>
      );
    }
    
    // Check if blob exists on Walrus
    if (conv.integrity && !conv.integrity.exists) {
      return (
        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-medium flex items-center gap-1.5 bg-red-500/10 text-red-400 border border-red-500/20">
          <AlertTriangle className="w-3 h-3" />
          Not Found
        </span>
      );
    }

    // Check if verified
    if (conv.verifiedAt) {
      return (
        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-medium flex items-center gap-1.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
          <CheckCircle className="w-3 h-3" />
          Verified
        </span>
      );
    }

    // Default: pending
    return (
      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-medium flex items-center gap-1.5 bg-amber-500/10 text-amber-400 border border-amber-500/20">
        <Clock className="w-3 h-3" />
        Pending
      </span>
    );
  };

  // Filter conversations with proper type checking
  const filteredConversations = conversations.filter((conv: any) => {
    const matchesSearch = conv.conversationId.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         conv.customerId.toLowerCase().includes(searchTerm.toLowerCase());
    
    // Determine status for filtering
    let convStatus = 'pending';
    if (conv.integrity?.tampered || conv.status === 'tampered') {
      convStatus = 'tampered';
    } else if (conv.verifiedAt) {
      convStatus = 'verified';
    }
    
    const matchesFilter = filterStatus === 'all' || convStatus === filterStatus;
    return matchesSearch && matchesFilter;
  });

  if (loading) {
    return (
      <div className="bg-slate-900/50 border border-slate-800/50 rounded-xl p-12 text-center">
        <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-slate-500 text-sm">Loading conversations...</p>
      </div>
    );
  }

  return (
    <>
      <div className="bg-slate-900/50 border border-slate-800/50 rounded-xl overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800/50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-sm font-semibold text-white">All Conversations</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              {filteredConversations.length} conversation{filteredConversations.length !== 1 ? 's' : ''}
            </p>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="relative">
              <input
                type="text"
                placeholder="Search..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-48 px-9 py-1.5 bg-slate-800/50 border border-slate-700 rounded-lg text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
              />
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            </div>
            
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-3 py-1.5 bg-slate-800/50 border border-slate-700 rounded-lg text-sm text-slate-300 focus:outline-none focus:border-indigo-500 transition-colors"
            >
              <option value="all">All</option>
              <option value="verified">Verified</option>
              <option value="pending">Pending</option>
              <option value="tampered">Tampered</option>
            </select>
          </div>
        </div>

        {/* Empty State */}
        {filteredConversations.length === 0 ? (
          <div className="p-12 text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-slate-800/50 flex items-center justify-center">
              <MessageSquare className="w-8 h-8 text-slate-600" />
            </div>
            <p className="text-slate-400 text-sm">No conversations found</p>
            <p className="text-slate-500 text-xs mt-1">
              {conversations.length === 0 
                ? 'Start a conversation to see it here' 
                : 'Try adjusting your search or filters'}
            </p>
          </div>
        ) : (
          /* Table */
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-800/50">
                  <th className="text-left py-3 px-4 text-slate-500 font-medium text-xs uppercase tracking-wider">
                    Conversation
                  </th>
                  <th className="text-left py-3 px-4 text-slate-500 font-medium text-xs uppercase tracking-wider">
                    Customer
                  </th>
                  <th className="text-left py-3 px-4 text-slate-500 font-medium text-xs uppercase tracking-wider">
                    Messages
                  </th>
                  <th className="text-left py-3 px-4 text-slate-500 font-medium text-xs uppercase tracking-wider">
                    Status
                  </th>
                  <th className="text-left py-3 px-4 text-slate-500 font-medium text-xs uppercase tracking-wider">
                    Integrity
                  </th>
                  <th className="text-left py-3 px-4 text-slate-500 font-medium text-xs uppercase tracking-wider">
                    Date
                  </th>
                  <th className="text-right py-3 px-4 text-slate-500 font-medium text-xs uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredConversations.map((conv: any) => {
                  const hasValidBlobId = !!conv.blobId;
                  const blobId = conv.blobId;
                  
                  return (
                    <tr
                      key={conv.id}
                      className={`border-b border-slate-800/30 transition-colors ${
                        hasValidBlobId 
                          ? 'hover:bg-slate-800/20 cursor-pointer' 
                          : 'opacity-60 cursor-not-allowed'
                      }`}
                      onClick={() => hasValidBlobId && setSelectedBlobId(blobId)}
                    >
                      <td className="py-3 px-4">
                        <span className="text-white font-mono text-xs">
                          {conv.conversationId.slice(0, 20)}...
                        </span>
                      </td>
                      <td className="py-3 px-4 text-slate-400 text-xs">
                        {conv.customerId}
                      </td>
                      <td className="py-3 px-4 text-slate-400 text-xs">
                        {conv.messageCount}
                      </td>
                      <td className="py-3 px-4">
                        {getStatusBadge(conv)}
                      </td>
                      <td className="py-3 px-4">
                        {conv.integrity?.exists ? (
                          <span className="text-emerald-400 text-xs flex items-center gap-1">
                            <CheckCircle className="w-3 h-3" />
                            On Walrus
                          </span>
                        ) : conv.integrity ? (
                          <span className="text-red-400 text-xs flex items-center gap-1">
                            <AlertTriangle className="w-3 h-3" />
                            Missing
                          </span>
                        ) : (
                          <span className="text-slate-500 text-xs">Unknown</span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-slate-400 text-xs">
                        {new Date(conv.createdAt).toLocaleDateString()}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            if (hasValidBlobId) setSelectedBlobId(blobId);
                          }}
                          disabled={!hasValidBlobId}
                          className={`text-xs font-medium mr-3 transition-colors ${
                            hasValidBlobId
                              ? 'text-indigo-400 hover:text-indigo-300'
                              : 'text-slate-600 cursor-not-allowed'
                          }`}
                        >
                          Details
                        </button>
                        
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleVerify(blobId);
                          }}
                          disabled={!hasValidBlobId}
                          className={`text-xs font-medium mr-3 transition-colors ${
                            hasValidBlobId
                              ? 'text-cyan-400 hover:text-cyan-300'
                              : 'text-slate-600 cursor-not-allowed'
                          }`}
                        >
                          Verify
                        </button>
                        
                        <a
                          href={hasValidBlobId 
                            ? `https://walruscan.com/testnet/blob/${blobId}`
                            : '#'
                          }
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          className={`text-xs transition-colors ${
                            hasValidBlobId
                              ? 'text-slate-500 hover:text-slate-400'
                              : 'text-slate-700 cursor-not-allowed'
                          }`}
                        >
                          <ExternalLink className="w-3 h-3 inline" />
                        </a>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Footer */}
        {filteredConversations.length > 0 && (
          <div className="px-6 py-3 border-t border-slate-800/50 bg-slate-900/30">
            <div className="flex items-center justify-between">
              <span className="text-[10px] text-slate-500">
                Showing {filteredConversations.length} of {conversations.length} conversations
              </span>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                  <span className="text-[10px] text-slate-400">
                    {conversations.filter((c: any) => c.verifiedAt).length} verified
                  </span>
                </div>
                {conversations.filter((c: any) => c.integrity?.tampered || c.status === 'tampered').length > 0 && (
                  <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-red-400" />
                    <span className="text-[10px] text-red-400">
                      {conversations.filter((c: any) => c.integrity?.tampered || c.status === 'tampered').length} tampered
                    </span>
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                  <span className="text-[10px] text-slate-400">
                    {conversations.filter((c: any) => !c.verifiedAt && !c.integrity?.tampered).length} pending
                  </span>
                </div>
              </div>
            </div>
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