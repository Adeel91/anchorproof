'use client';

import { useState } from 'react';
import {
  Conversation,
  useDashboardData,
} from '@/providers/DashboardDataProvider';
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
  Calendar,
  Filter,
  X,
} from 'lucide-react';
import { activeNetwork } from '@/lib/walrus/client';

export function ConversationList() {
  const { conversations, loading } = useDashboardData();
  const [selectedBlobId, setSelectedBlobId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [toast, setToast] = useState<{
    message: string;
    type: 'success' | 'error';
  } | null>(null);

  const totalCount = conversations.length;
  const verifiedCount = conversations.filter(
    (c: Conversation) => c.verifiedAt !== null
  ).length;
  const tamperedCount = conversations.filter(
    (c: Conversation) => c.integrity?.tampered === true && c.verifiedAt === null
  ).length;
  const integrityRate =
    totalCount > 0
      ? Math.round(((totalCount - tamperedCount) / totalCount) * 100)
      : 100;
  const isCompliant = integrityRate === 100;

  const getStatusBadge = (conv: Conversation) => {
    if (conv.verifiedAt) {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] sm:text-[11px] font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
          <CheckCircle className="w-3 h-3" />
          Verified
        </span>
      );
    }

    if (conv.integrity?.tampered === true) {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] sm:text-[11px] font-medium bg-red-500/10 text-red-400 border border-red-500/20">
          <AlertTriangle className="w-3 h-3" />
          Tampered
        </span>
      );
    }

    if (conv.integrity && !conv.integrity.exists) {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] sm:text-[11px] font-medium bg-red-500/10 text-red-400 border border-red-500/20">
          <AlertTriangle className="w-3 h-3" />
          Not Found
        </span>
      );
    }

    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] sm:text-[11px] font-medium bg-amber-500/10 text-amber-400 border border-amber-500/20">
        <Clock className="w-3 h-3" />
        Pending
      </span>
    );
  };

  const getStatusForFilter = (conv: Conversation) => {
    if (conv.verifiedAt) return 'verified';
    if (conv.integrity?.tampered === true && !conv.verifiedAt)
      return 'tampered';
    return 'pending';
  };

  const filteredConversations = conversations.filter((conv: Conversation) => {
    const matchesSearch =
      conv.conversationId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (conv.blobId?.toLowerCase().includes(searchTerm.toLowerCase()) ??
        false) ||
      (conv.suiTxHash?.toLowerCase().includes(searchTerm.toLowerCase()) ??
        false) ||
      (conv.anchorProofTxHash
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase()) ??
        false);

    const convStatus = getStatusForFilter(conv);
    const matchesFilter = filterStatus === 'all' || convStatus === filterStatus;
    return matchesSearch && matchesFilter;
  });

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard
      .writeText(text)
      .then(() => {
        setToast({ message: `${label} copied to clipboard!`, type: 'success' });
        setTimeout(() => setToast(null), 3000);
      })
      .catch(() => {
        setToast({ message: 'Failed to copy', type: 'error' });
        setTimeout(() => setToast(null), 3000);
      });
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const clearSearch = () => {
    setSearchTerm('');
  };

  if (loading) {
    return (
      <div className="bg-slate-900/50 border border-slate-800/50 rounded-xl p-8 sm:p-12 text-center">
        <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-slate-500 text-sm">Loading conversations...</p>
      </div>
    );
  }

  return (
    <>
      {toast && (
        <div
          className={`fixed bottom-4 right-4 z-50 px-4 py-3 rounded-lg shadow-lg border transition-all duration-300 animate-in slide-in-from-bottom-2 ${
            toast.type === 'success'
              ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
              : 'bg-red-500/10 border-red-500/30 text-red-400'
          }`}
        >
          <div className="flex items-center gap-2">
            {toast.type === 'success' ? (
              <CheckCircle className="w-4 h-4" />
            ) : (
              <AlertTriangle className="w-4 h-4" />
            )}
            <span className="text-sm font-medium">{toast.message}</span>
          </div>
        </div>
      )}

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-4 sm:mb-6">
        <div className="bg-slate-900/50 border border-slate-800/50 rounded-xl p-3 sm:p-4 hover:border-slate-700/50 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-[8px] sm:text-xs text-slate-500 uppercase tracking-wider">
              Total
            </span>
            <Database className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-indigo-400" />
          </div>
          <div className="text-lg sm:text-2xl font-bold text-white mt-0.5 sm:mt-1">
            {totalCount}
          </div>
          <div className="text-[8px] sm:text-[10px] text-slate-500">
            Records on Walrus
          </div>
        </div>

        <div className="bg-slate-900/50 border border-slate-800/50 rounded-xl p-3 sm:p-4 hover:border-slate-700/50 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-[8px] sm:text-xs text-slate-500 uppercase tracking-wider">
              Integrity
            </span>
            <Shield className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-400" />
          </div>
          <div
            className={`text-lg sm:text-2xl font-bold mt-0.5 sm:mt-1 ${integrityRate === 100 ? 'text-emerald-400' : 'text-amber-400'}`}
          >
            {integrityRate}%
          </div>
          <div className="text-[8px] sm:text-[10px] text-slate-500">
            Records intact
          </div>
        </div>

        <div className="bg-slate-900/50 border border-slate-800/50 rounded-xl p-3 sm:p-4 hover:border-slate-700/50 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-[8px] sm:text-xs text-slate-500 uppercase tracking-wider">
              Tampered
            </span>
            <AlertTriangle className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-red-400" />
          </div>
          <div className="text-lg sm:text-2xl font-bold text-red-400 mt-0.5 sm:mt-1">
            {tamperedCount}
          </div>
          <div className="text-[8px] sm:text-[10px] text-slate-500">
            Compromised
          </div>
        </div>

        <div className="bg-slate-900/50 border border-slate-800/50 rounded-xl p-3 sm:p-4 hover:border-slate-700/50 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-[8px] sm:text-xs text-slate-500 uppercase tracking-wider">
              Compliance
            </span>
            <FileCheck className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-indigo-400" />
          </div>
          <div
            className={`text-lg sm:text-2xl font-bold mt-0.5 sm:mt-1 ${isCompliant ? 'text-emerald-400' : 'text-red-400'}`}
          >
            {isCompliant ? 'PASS' : 'FAIL'}
          </div>
          <div className="text-[8px] sm:text-[10px] text-slate-500">
            Audit ready
          </div>
        </div>
      </div>

      <div className="bg-slate-900/50 border border-slate-800/50 rounded-xl overflow-hidden">
        <div className="px-4 sm:px-6 py-3 sm:py-4 border-b border-slate-800/50 flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div>
            <h2 className="text-sm font-semibold text-white flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-indigo-400 flex-shrink-0" />
              All Conversations
            </h2>
            <p className="text-[10px] sm:text-xs text-slate-500 mt-0.5">
              {filteredConversations.length} conversation
              {filteredConversations.length !== 1 ? 's' : ''} •
              <span className="text-emerald-400 ml-1">
                {verifiedCount} verified
              </span>
              {tamperedCount > 0 && (
                <span className="text-red-400 ml-1">
                  • {tamperedCount} tampered
                </span>
              )}
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full md:w-auto">
            <div className="relative flex-1 sm:flex-none">
              <input
                type="text"
                placeholder="Search..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full sm:w-44 md:w-48 px-8 py-1.5 bg-slate-800/50 border border-slate-700 rounded-lg text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/20 transition-all"
              />
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-500" />
              {searchTerm && (
                <button
                  onClick={clearSearch}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white transition-colors"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            <div className="relative">
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-3 py-1.5 pl-8 bg-slate-800/50 border border-slate-700 rounded-lg text-sm text-slate-300 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/20 transition-all appearance-none w-full sm:w-auto"
              >
                <option value="all">All Status</option>
                <option value="verified">Verified</option>
                <option value="pending">Pending</option>
                <option value="tampered">Tampered</option>
              </select>
              <Filter className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-500 pointer-events-none" />
            </div>
          </div>
        </div>

        <div className="sm:hidden divide-y divide-slate-800/30">
          {filteredConversations.length === 0 ? (
            <div className="p-8 text-center">
              <MessageSquare className="w-10 h-10 text-slate-600 mx-auto mb-3" />
              <p className="text-slate-400 text-sm">No conversations found</p>
            </div>
          ) : (
            filteredConversations.map((conv: Conversation) => {
              const hasValidBlobId = conv.blobId !== null;
              const blobId = conv.blobId || '';

              return (
                <div
                  key={conv.id}
                  className={`px-4 py-3 ${hasValidBlobId ? 'hover:bg-slate-800/20 cursor-pointer' : 'opacity-60'}`}
                  onClick={() => hasValidBlobId && setSelectedBlobId(blobId)}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center flex-wrap gap-1.5">
                        <span className="text-xs font-mono text-white truncate max-w-[120px]">
                          {conv.conversationId}
                        </span>
                        {getStatusBadge(conv)}
                      </div>
                      <div className="flex items-center gap-2 mt-1 text-[10px] text-slate-400">
                        <span>{conv.messageCount} msgs</span>
                        <span className="w-0.5 h-2 bg-slate-700" />
                        <span>
                          {hasValidBlobId
                            ? `Blob: ${blobId.slice(0, 10)}...`
                            : 'N/A'}
                        </span>
                      </div>
                      {conv.verifiedAt && (
                        <div className="text-[9px] text-slate-500 mt-0.5">
                          {formatDate(conv.verifiedAt)}
                        </div>
                      )}
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        if (hasValidBlobId) setSelectedBlobId(blobId);
                      }}
                      disabled={!hasValidBlobId}
                      className={`text-xs font-medium whitespace-nowrap ${
                        hasValidBlobId
                          ? 'text-indigo-400 hover:text-indigo-300'
                          : 'text-slate-600 cursor-not-allowed'
                      }`}
                    >
                      Details →
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>

        <div className="hidden sm:block overflow-x-auto">
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
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-800/50 bg-slate-800/20">
                  <th className="text-left py-3 px-4 text-slate-500 font-medium text-[10px] uppercase tracking-wider">
                    Conversation
                  </th>
                  <th className="text-left py-3 px-4 text-slate-500 font-medium text-[10px] uppercase tracking-wider hidden md:table-cell">
                    Blob ID
                  </th>
                  <th className="text-left py-3 px-4 text-slate-500 font-medium text-[10px] uppercase tracking-wider hidden lg:table-cell">
                    Sui Hash
                  </th>
                  <th className="text-left py-3 px-4 text-slate-500 font-medium text-[10px] uppercase tracking-wider hidden xl:table-cell">
                    AnchorProof
                  </th>
                  <th className="text-left py-3 px-4 text-slate-500 font-medium text-[10px] uppercase tracking-wider text-center">
                    Msgs
                  </th>
                  <th className="text-left py-3 px-4 text-slate-500 font-medium text-[10px] uppercase tracking-wider">
                    Status
                  </th>
                  <th className="text-left py-3 px-4 text-slate-500 font-medium text-[10px] uppercase tracking-wider hidden 2xl:table-cell">
                    Verified On
                  </th>
                  <th className="text-right py-3 px-4 text-slate-500 font-medium text-[10px] uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredConversations.map((conv: Conversation) => {
                  const hasValidBlobId = conv.blobId !== null;
                  const blobId = conv.blobId || '';
                  const suiTxHash = conv.suiTxHash || '';
                  const anchorProofTxHash = conv.anchorProofTxHash || '';
                  const hasValidAnchorProofTxHash =
                    conv.anchorProofTxHash !== null;

                  return (
                    <tr
                      key={conv.id}
                      className={`border-b border-slate-800/30 transition-all duration-200 ${
                        hasValidBlobId
                          ? 'hover:bg-slate-800/20 cursor-pointer'
                          : 'opacity-50 cursor-not-allowed'
                      }`}
                      onClick={() =>
                        hasValidBlobId && setSelectedBlobId(blobId)
                      }
                    >
                      <td className="py-3 px-4">
                        <span className="text-white font-mono text-xs truncate max-w-[120px] lg:max-w-[180px] block">
                          {conv.conversationId}
                        </span>
                      </td>
                      <td className="hidden md:table-cell py-3 px-4">
                        {hasValidBlobId ? (
                          <div className="flex items-center gap-1">
                            <code className="text-cyan-400 text-xs font-mono truncate max-w-[100px]">
                              {blobId.slice(0, 12)}...
                            </code>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                copyToClipboard(blobId, 'Blob ID');
                              }}
                              className="text-slate-500 hover:text-white transition-colors p-0.5"
                              title="Copy Blob ID"
                            >
                              <Copy className="w-3 h-3" />
                            </button>
                            <a
                              href={`https://walruscan.com/${activeNetwork}/blob/${blobId}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              onClick={(e) => e.stopPropagation()}
                              className="text-slate-500 hover:text-cyan-400 transition-colors p-0.5"
                              title="View on Walrus"
                            >
                              <ExternalLink className="w-3 h-3" />
                            </a>
                          </div>
                        ) : (
                          <span className="text-slate-600 text-xs">N/A</span>
                        )}
                      </td>
                      <td className="hidden lg:table-cell py-3 px-4">
                        {hasValidBlobId && suiTxHash ? (
                          <div className="flex items-center gap-1">
                            <code className="text-blue-400 text-xs font-mono truncate max-w-[100px]">
                              {suiTxHash.slice(0, 12)}...
                            </code>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                copyToClipboard(suiTxHash, 'Sui Hash');
                              }}
                              className="text-slate-500 hover:text-white transition-colors p-0.5"
                              title="Copy Sui Hash"
                            >
                              <Copy className="w-3 h-3" />
                            </button>
                            <a
                              href={`https://suiscan.xyz/${activeNetwork}/object/${suiTxHash}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              onClick={(e) => e.stopPropagation()}
                              className="text-slate-500 hover:text-blue-400 transition-colors p-0.5"
                              title="View on Sui"
                            >
                              <ExternalLink className="w-3 h-3" />
                            </a>
                          </div>
                        ) : (
                          <span className="text-slate-600 text-xs">N/A</span>
                        )}
                      </td>
                      <td className="hidden xl:table-cell py-3 px-4">
                        {hasValidAnchorProofTxHash ? (
                          <div className="flex items-center gap-1">
                            <code className="text-amber-400 text-xs font-mono truncate max-w-[100px]">
                              {anchorProofTxHash.slice(0, 12)}...
                            </code>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                copyToClipboard(
                                  anchorProofTxHash,
                                  'AnchorProof Hash'
                                );
                              }}
                              className="text-slate-500 hover:text-white transition-colors p-0.5"
                              title="Copy AnchorProof Hash"
                            >
                              <Copy className="w-3 h-3" />
                            </button>
                            <a
                              href={`https://suiscan.xyz/${activeNetwork}/tx/${anchorProofTxHash}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              onClick={(e) => e.stopPropagation()}
                              className="text-slate-500 hover:text-amber-400 transition-colors p-0.5"
                              title="View AnchorProof on Sui"
                            >
                              <ExternalLink className="w-3 h-3" />
                            </a>
                          </div>
                        ) : (
                          <span className="text-slate-600 text-xs">N/A</span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span className="text-slate-400 text-xs font-medium bg-slate-800/50 px-2 py-0.5 rounded-full">
                          {conv.messageCount}
                        </span>
                      </td>
                      <td className="py-3 px-4">{getStatusBadge(conv)}</td>
                      <td className="hidden 2xl:table-cell py-3 px-4">
                        {conv.verifiedAt ? (
                          <div className="flex items-center gap-1.5 text-slate-400 text-xs">
                            <Calendar className="w-3 h-3 text-slate-500" />
                            {formatDate(conv.verifiedAt)}
                          </div>
                        ) : (
                          <span className="text-slate-600 text-xs">—</span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            if (hasValidBlobId) setSelectedBlobId(blobId);
                          }}
                          disabled={!hasValidBlobId}
                          className={`text-xs font-medium transition-all duration-200 px-3 py-1 rounded-lg ${
                            hasValidBlobId
                              ? 'text-indigo-400 hover:text-indigo-300 hover:bg-indigo-500/10'
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
          )}
        </div>

        {filteredConversations.length > 0 && (
          <div className="px-4 sm:px-6 py-2.5 sm:py-3 border-t border-slate-800/50 bg-slate-900/30 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <span className="text-[9px] sm:text-[10px] text-slate-500">
              Showing {filteredConversations.length} of {conversations.length}{' '}
              conversations
            </span>
            <div className="flex flex-wrap items-center gap-2 sm:gap-4">
              <div className="flex items-center gap-1.5">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                <span className="text-[8px] sm:text-[10px] text-slate-400">
                  {verifiedCount} verified
                </span>
              </div>
              {tamperedCount > 0 && (
                <div className="flex items-center gap-1.5">
                  <div className="w-1.5 h-1.5 rounded-full bg-red-400" />
                  <span className="text-[8px] sm:text-[10px] text-red-400">
                    {tamperedCount} tampered
                  </span>
                </div>
              )}
              <div className="flex items-center gap-1.5">
                <div className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                <span className="text-[8px] sm:text-[10px] text-slate-400">
                  {
                    conversations.filter(
                      (c: Conversation) =>
                        c.verifiedAt === null && !c.integrity?.tampered
                    ).length
                  }{' '}
                  pending
                </span>
              </div>
              <div className="flex items-center gap-1.5 border-l border-slate-700/50 pl-2 sm:pl-4">
                <Shield className="w-3 h-3 text-indigo-400" />
                <span className="text-[8px] sm:text-[10px] text-slate-400 font-mono">
                  {integrityRate}% integrity
                </span>
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
