// components/dashboard/conversations/ConversationList.tsx
'use client';

import { useState } from 'react';
import { useDashboardData } from '@/providers/DashboardDataProvider';
import { ConversationDetail } from './ConversationDetail';
import { 
  Search, 
  MessageSquare, 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  ExternalLink,
  Shield,
  Database,
  FileCheck,
  Copy,
  Calendar
} from 'lucide-react';
import { activeNetwork } from '@/lib/walrus/client';

export function ConversationList() {
  const { conversations, loading } = useDashboardData();
  const [selectedBlobId, setSelectedBlobId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  // Calculate verification stats
  const totalCount = conversations.length;
  const verifiedCount = conversations.filter((c: any) => c.verifiedAt).length;
  const tamperedCount = conversations.filter((c: any) => 
    c.integrity?.tampered === true && !c.verifiedAt
  ).length;
  const integrityRate = totalCount > 0 ? Math.round(((totalCount - tamperedCount) / totalCount) * 100) : 100;
  const isCompliant = integrityRate === 100;

  const getStatusBadge = (conv: any) => {
    if (conv.verifiedAt) {
      return (
        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-medium flex items-center gap-1.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
          <CheckCircle className="w-3 h-3" />
          Verified
        </span>
      );
    }
    
    if (conv.integrity?.tampered === true) {
      return (
        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-medium flex items-center gap-1.5 bg-red-500/10 text-red-400 border border-red-500/20">
          <AlertTriangle className="w-3 h-3" />
          Tampered
        </span>
      );
    }
    
    if (conv.integrity && !conv.integrity.exists) {
      return (
        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-medium flex items-center gap-1.5 bg-red-500/10 text-red-400 border border-red-500/20">
          <AlertTriangle className="w-3 h-3" />
          Not Found
        </span>
      );
    }

    return (
      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-medium flex items-center gap-1.5 bg-amber-500/10 text-amber-400 border border-amber-500/20">
        <Clock className="w-3 h-3" />
        Pending
      </span>
    );
  };

  const getStatusForFilter = (conv: any) => {
    if (conv.verifiedAt) return 'verified';
    if (conv.integrity?.tampered === true && !conv.verifiedAt) return 'tampered';
    return 'pending';
  };

  const filteredConversations = conversations.filter((conv: any) => {
    const matchesSearch = conv.conversationId.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         conv.blobId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         conv.suiTxHash?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const convStatus = getStatusForFilter(conv);
    const matchesFilter = filterStatus === 'all' || convStatus === filterStatus;
    return matchesSearch && matchesFilter;
  });

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

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
      {/* Verification Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-slate-900/50 border border-slate-800/50 rounded-xl p-4">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-500 uppercase tracking-wider">Total Verified</span>
            <Database className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="text-2xl font-bold text-white mt-1">{totalCount}</div>
          <div className="text-[10px] text-slate-500">Records on Walrus</div>
        </div>
        
        <div className="bg-slate-900/50 border border-slate-800/50 rounded-xl p-4">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-500 uppercase tracking-wider">Integrity</span>
            <Shield className="w-4 h-4 text-emerald-400" />
          </div>
          <div className={`text-2xl font-bold mt-1 ${integrityRate === 100 ? 'text-emerald-400' : 'text-amber-400'}`}>
            {integrityRate}%
          </div>
          <div className="text-[10px] text-slate-500">Records intact</div>
        </div>
        
        <div className="bg-slate-900/50 border border-slate-800/50 rounded-xl p-4">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-500 uppercase tracking-wider">Tampered</span>
            <AlertTriangle className="w-4 h-4 text-red-400" />
          </div>
          <div className="text-2xl font-bold text-red-400 mt-1">{tamperedCount}</div>
          <div className="text-[10px] text-slate-500">Records compromised</div>
        </div>
        
        <div className="bg-slate-900/50 border border-slate-800/50 rounded-xl p-4">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-500 uppercase tracking-wider">Compliance</span>
            <FileCheck className="w-4 h-4 text-indigo-400" />
          </div>
          <div className={`text-2xl font-bold mt-1 ${isCompliant ? 'text-emerald-400' : 'text-red-400'}`}>
            {isCompliant ? 'PASS' : 'FAIL'}
          </div>
          <div className="text-[10px] text-slate-500">Audit ready</div>
        </div>
      </div>

      {/* Conversations Table */}
      <div className="bg-slate-900/50 border border-slate-800/50 rounded-xl overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800/50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-sm font-semibold text-white flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-indigo-400" />
              All Conversations
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              {filteredConversations.length} conversation{filteredConversations.length !== 1 ? 's' : ''} • 
              <span className="text-emerald-400 ml-1">
                {verifiedCount} verified
              </span>
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

        {/* Table */}
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
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-800/50">
                  <th className="text-left py-3 px-4 text-slate-500 font-medium text-xs uppercase tracking-wider">
                    Conversation ID
                  </th>
                  <th className="text-left py-3 px-4 text-slate-500 font-medium text-xs uppercase tracking-wider">
                    Blob ID
                  </th>
                  <th className="text-left py-3 px-4 text-slate-500 font-medium text-xs uppercase tracking-wider">
                    Sui Hash
                  </th>
                  <th className="text-left py-3 px-4 text-slate-500 font-medium text-xs uppercase tracking-wider">
                    Messages
                  </th>
                  <th className="text-left py-3 px-4 text-slate-500 font-medium text-xs uppercase tracking-wider">
                    Status
                  </th>
                  <th className="text-left py-3 px-4 text-slate-500 font-medium text-xs uppercase tracking-wider">
                    Verified On
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
                  const suiTxHash = conv.suiTxHash || conv.blobId;
                  
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
                          {conv.conversationId}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        {hasValidBlobId ? (
                          <div className="flex items-center gap-1">
                            <code className="text-cyan-400 text-xs font-mono truncate max-w-[120px]">
                              {blobId.slice(0, 16)}...
                            </code>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                copyToClipboard(blobId);
                              }}
                              className="text-slate-500 hover:text-white transition-colors"
                            >
                              <Copy className="w-3 h-3" />
                            </button>
                            <a
                              href={`https://walruscan.com/testnet/blob/${blobId}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              onClick={(e) => e.stopPropagation()}
                              className="text-slate-500 hover:text-cyan-400 transition-colors"
                            >
                              <ExternalLink className="w-3 h-3" />
                            </a>
                          </div>
                        ) : (
                          <span className="text-slate-600 text-xs">N/A</span>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        {hasValidBlobId ? (
                          <div className="flex items-center gap-1">
                            <code className="text-purple-400 text-xs font-mono truncate max-w-[120px]">
                              {suiTxHash.slice(0, 16)}...
                            </code>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                copyToClipboard(suiTxHash);
                              }}
                              className="text-slate-500 hover:text-white transition-colors"
                            >
                              <Copy className="w-3 h-3" />
                            </button>
                            <a
                              href={`https://suiscan.xyz/testnet/object/${suiTxHash}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              onClick={(e) => e.stopPropagation()}
                              className="text-slate-500 hover:text-purple-400 transition-colors"
                            >
                              <ExternalLink className="w-3 h-3" />
                            </a>
                          </div>
                        ) : (
                          <span className="text-slate-600 text-xs">N/A</span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-slate-400 text-xs">
                        {conv.messageCount}
                      </td>
                      <td className="py-3 px-4">
                        {getStatusBadge(conv)}
                      </td>
                      <td className="py-3 px-4 text-slate-400 text-xs">
                        {conv.verifiedAt ? (
                          <div className="flex items-center gap-1.5">
                            <Calendar className="w-3 h-3" />
                            {formatDate(conv.verifiedAt)}
                          </div>
                        ) : (
                          <span className="text-slate-500">—</span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            if (hasValidBlobId) setSelectedBlobId(blobId);
                          }}
                          disabled={!hasValidBlobId}
                          className={`text-xs font-medium transition-colors ${
                            hasValidBlobId
                              ? 'text-indigo-400 hover:text-indigo-300'
                              : 'text-slate-600 cursor-not-allowed'
                          }`}
                        >
                          Details
                        </button>
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
                    {verifiedCount} verified
                  </span>
                </div>
                {tamperedCount > 0 && (
                  <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-red-400" />
                    <span className="text-[10px] text-red-400">
                      {tamperedCount} tampered
                    </span>
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                  <span className="text-[10px] text-slate-400">
                    {conversations.filter((c: any) => !c.verifiedAt && !c.integrity?.tampered).length} pending
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Shield className="w-3 h-3 text-indigo-400" />
                  <span className="text-[10px] text-slate-400 font-mono">
                    {integrityRate}% integrity
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