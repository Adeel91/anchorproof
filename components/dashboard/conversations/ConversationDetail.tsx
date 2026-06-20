'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import {
  X,
  Loader2,
  AlertCircle,
  Database,
  ExternalLink,
  Shield,
  FileCheck,
  Link as LinkIcon,
  Copy,
  Calendar,
  Lock,
} from 'lucide-react';
import { activeNetwork } from '@/lib/walrus/client';

interface Message {
  role: string;
  content: string;
  timestamp?: string;
}

interface ConversationData {
  conversationId: string;
  messages?: Message[];
  metadata?: {
    customerId?: string;
    agentId?: string;
    messageCount?: number;
  };
  blobId: string;
  suiTxHash?: string;
  verifiedAt?: string;
  createdAt?: string;
  isFallback?: boolean;
  isEncrypted?: boolean;
  isPlaintext?: boolean;
  [key: string]: unknown;
}

interface ConversationDetailProps {
  blobId: string;
  onClose: () => void;
}

export function ConversationDetail({
  blobId,
  onClose,
}: ConversationDetailProps) {
  const [conversation, setConversation] = useState<ConversationData | null>(
    null
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isFallback, setIsFallback] = useState(false);
  const [isEncrypted, setIsEncrypted] = useState(false);
  const [isPlaintext, setIsPlaintext] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);
  const isMounted = useRef(true);
  const hasFetched = useRef(false);

  const fetchConversation = useCallback(async () => {
    if (!isMounted.current || hasFetched.current) return;
    hasFetched.current = true;

    setLoading(true);
    setError(null);
    setIsFallback(false);
    setIsEncrypted(false);
    setIsPlaintext(false);

    try {
      const res = await fetch(`/api/walrus/blob/${blobId}`);
      const data = await res.json();

      if (!isMounted.current) return;

      if (!res.ok) {
        if (data.fallbackData) {
          setConversation({
            ...data.fallbackData,
            blobId: data.blobId || blobId,
          });
          setIsFallback(true);
          setLoading(false);
          return;
        }
        throw new Error(data.error || 'Failed to fetch conversation');
      }

      if (data.success) {
        setConversation(data);
        setIsFallback(data.isFallback || false);
        setIsEncrypted(data.isEncrypted || false);
        setIsPlaintext(data.isPlaintext || false);
        setError(null);
      } else {
        throw new Error(data.error || 'Failed to fetch conversation');
      }
    } catch (error) {
      if (!isMounted.current) return;
      console.error('Failed to fetch conversation:', error);
      setError(
        error instanceof Error ? error.message : 'Failed to load conversation'
      );
    } finally {
      if (isMounted.current) {
        setLoading(false);
      }
    }
  }, [blobId]);

  useEffect(() => {
    isMounted.current = true;
    hasFetched.current = false;

    const timer = setTimeout(() => {
      if (!blobId) {
        if (isMounted.current) {
          setError('No blob ID provided');
          setLoading(false);
        }
        return;
      }
      fetchConversation();
    }, 0);

    return () => {
      isMounted.current = false;
      clearTimeout(timer);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [blobId]);

  useEffect(() => {
    return () => {
      hasFetched.current = false;
    };
  }, []);

  const copyToClipboard = (text: string, type: string) => {
    navigator.clipboard.writeText(text);
    setCopied(type);
    setTimeout(() => setCopied(null), 2000);
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

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50">
        <div className="bg-slate-900 border border-slate-700 rounded-xl p-8">
          <div className="flex items-center gap-3">
            <Loader2 className="w-6 h-6 text-indigo-400 animate-spin" />
            <span className="text-slate-400">Loading conversation...</span>
          </div>
        </div>
      </div>
    );
  }

  if (error && !conversation) {
    return (
      <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
        <div className="bg-slate-900 border border-red-500/20 rounded-xl p-8 max-w-md w-full">
          <div className="text-center">
            <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-white mb-2">
              Error Loading Conversation
            </h3>
            <p className="text-slate-400 text-sm mb-4">{error}</p>
            <div className="flex gap-3 justify-center">
              <button
                onClick={() => {
                  hasFetched.current = false;
                  fetchConversation();
                }}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 rounded-lg text-sm font-medium text-white transition-colors"
              >
                Retry
              </button>
              <button
                onClick={onClose}
                className="px-4 py-2 bg-slate-700/50 hover:bg-slate-700 rounded-lg text-sm font-medium text-slate-300 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!conversation) {
    return (
      <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
        <div className="bg-slate-900 border border-slate-700 rounded-xl p-8 max-w-md w-full">
          <div className="text-center">
            <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-red-500/10 flex items-center justify-center">
              <X className="w-6 h-6 text-red-400" />
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">
              Conversation Not Found
            </h3>
            <p className="text-slate-400 text-sm mb-4">
              The conversation you are looking for does not exist or has been
              removed.
            </p>
            <button
              onClick={onClose}
              className="text-indigo-400 hover:text-indigo-300 text-sm font-medium transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    );
  }

  const suiTxHash = conversation.suiTxHash || conversation.blobId;
  const messages = conversation.messages || [];
  const messageCount = messages.length;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden shadow-2xl">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800">
          <div>
            <h3 className="text-lg font-semibold text-white">
              Conversation Details
            </h3>
            <div className="flex items-center gap-3 mt-1 flex-wrap">
              <span className="text-xs text-slate-500 font-mono">
                {conversation.conversationId || 'N/A'}
              </span>
              <span
                className={`px-2.5 py-0.5 rounded-full text-[10px] font-medium ${
                  conversation.verifiedAt
                    ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                    : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                }`}
              >
                {conversation.verifiedAt ? 'Verified' : 'Pending'}
              </span>
              {conversation.verifiedAt && (
                <span className="text-[10px] text-slate-500 flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  {formatDate(conversation.verifiedAt)}
                </span>
              )}
              {isEncrypted && (
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-medium bg-purple-500/10 text-purple-400 border border-purple-500/20 flex items-center gap-1">
                  <Lock className="w-3 h-3" />
                  Encrypted
                </span>
              )}
              {isPlaintext && (
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-medium bg-blue-500/10 text-blue-400 border border-blue-500/20 flex items-center gap-1">
                  <Database className="w-3 h-3" />
                  Plaintext
                </span>
              )}
              {isFallback && (
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-medium bg-amber-500/10 text-amber-400 border border-amber-500/20 flex items-center gap-1">
                  <Database className="w-3 h-3" />
                  Stored Metadata
                </span>
              )}
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white transition-colors p-1 rounded-lg hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto max-h-[calc(90vh-180px)]">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="p-3 rounded-lg bg-slate-800/30">
              <p className="text-[10px] text-slate-500 uppercase tracking-wider">
                Conversation ID
              </p>
              <p className="text-sm text-white font-mono truncate">
                {conversation.conversationId || 'N/A'}
              </p>
            </div>
            <div className="p-3 rounded-lg bg-slate-800/30">
              <p className="text-[10px] text-slate-500 uppercase tracking-wider">
                Customer
              </p>
              <p className="text-sm text-white">
                {conversation.metadata?.customerId || 'N/A'}
              </p>
            </div>
            <div className="p-3 rounded-lg bg-slate-800/30">
              <p className="text-[10px] text-slate-500 uppercase tracking-wider">
                Agent
              </p>
              <p className="text-sm text-white">
                {conversation.metadata?.agentId || 'N/A'}
              </p>
            </div>
            <div className="p-3 rounded-lg bg-slate-800/30">
              <p className="text-[10px] text-slate-500 uppercase tracking-wider">
                Messages
              </p>
              <p className="text-sm text-white">{messageCount}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div className="p-3 rounded-lg bg-slate-800/30 border border-slate-700/50">
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-2">
                  <Database className="w-4 h-4 text-cyan-400" />
                  <span className="text-xs text-slate-500 font-mono">
                    Storage Reference
                  </span>
                </div>
                <button
                  onClick={() => copyToClipboard(conversation.blobId, 'blob')}
                  className="text-slate-500 hover:text-white transition-colors"
                >
                  <Copy className="w-3.5 h-3.5" />
                </button>
              </div>
              <code className="text-cyan-400 text-xs break-all font-mono block mb-1">
                {conversation.blobId}
              </code>
              {copied === 'blob' && (
                <span className="text-[10px] text-emerald-400">Copied!</span>
              )}
              <a
                href={`https://walruscan.com/${activeNetwork}/blob/${conversation.blobId}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[10px] text-indigo-400 hover:text-indigo-300 mt-1 inline-block flex items-center gap-1"
              >
                <ExternalLink className="w-3 h-3" />
                View Storage Record
              </a>
            </div>

            <div className="p-3 rounded-lg bg-slate-800/30 border border-slate-700/50">
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-2">
                  <Shield className="w-4 h-4 text-purple-400" />
                  <span className="text-xs text-slate-500 font-mono">
                    Verification Proof
                  </span>
                </div>
                <button
                  onClick={() => copyToClipboard(suiTxHash, 'sui')}
                  className="text-slate-500 hover:text-white transition-colors"
                >
                  <Copy className="w-3.5 h-3.5" />
                </button>
              </div>
              <code className="text-purple-400 text-xs break-all font-mono block mb-1">
                {suiTxHash}
              </code>
              {copied === 'sui' && (
                <span className="text-[10px] text-emerald-400">Copied!</span>
              )}
              <a
                href={`https://suiscan.xyz/${activeNetwork}/object/${suiTxHash}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[10px] text-indigo-400 hover:text-indigo-300 mt-1 inline-block flex items-center gap-1"
              >
                <LinkIcon className="w-3 h-3" />
                View Verification Proof
              </a>
            </div>
          </div>

          <div className="space-y-3">
            <h4 className="text-sm font-medium text-white mb-3 flex items-center gap-2">
              <FileCheck className="w-4 h-4 text-indigo-400" />
              Transcript ({messageCount} messages)
              {isEncrypted && messageCount === 0 && (
                <span className="text-xs text-purple-400 font-normal ml-2">
                  (Encrypted - verify on-chain to decrypt)
                </span>
              )}
              {isPlaintext && (
                <span className="text-xs text-blue-400 font-normal ml-2">
                  (Unencrypted)
                </span>
              )}
            </h4>

            {isEncrypted && messageCount === 0 && (
              <div className="text-center py-8 bg-purple-500/5 rounded-xl border border-purple-500/20">
                <Lock className="w-12 h-12 text-purple-400 mx-auto mb-4" />
                <p className="text-sm text-slate-400">
                  This conversation is encrypted
                </p>
                <p className="text-xs text-slate-500 mt-1">
                  The content is protected with SEAL encryption.
                  <br />
                  Verify the blob on-chain to view the messages.
                </p>
                <a
                  href={`https://suiscan.xyz/${activeNetwork}/object/${suiTxHash}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-3 inline-block text-indigo-400 hover:text-indigo-300 text-sm"
                >
                  Verify on SuiScan →
                </a>
              </div>
            )}

            {messageCount > 0 && !isEncrypted
              ? messages.map((msg, idx: number) => (
                  <div
                    key={idx}
                    className={`p-4 rounded-xl ${
                      msg.role === 'user'
                        ? 'bg-indigo-500/10 border border-indigo-500/20'
                        : 'bg-slate-800/30 border border-slate-700/30'
                    }`}
                  >
                    <div className="flex items-center gap-3 mb-1.5">
                      <span
                        className={`text-xs font-semibold ${
                          msg.role === 'user'
                            ? 'text-indigo-400'
                            : 'text-cyan-400'
                        }`}
                      >
                        {msg.role === 'user' ? 'Customer' : 'AI Assistant'}
                      </span>
                      <span className="text-[10px] text-slate-500">
                        {msg.timestamp
                          ? new Date(msg.timestamp).toLocaleTimeString()
                          : ''}
                      </span>
                    </div>
                    <p className="text-sm text-slate-300 whitespace-pre-wrap leading-relaxed">
                      {msg.content}
                    </p>
                  </div>
                ))
              : !isEncrypted && (
                  <div className="text-center py-8">
                    {isFallback ? (
                      <>
                        <Database className="w-12 h-12 text-amber-400 mx-auto mb-4" />
                        <p className="text-sm text-slate-400">
                          Conversation data is temporarily unavailable
                        </p>
                        <p className="text-xs text-slate-500 mt-1">
                          The blob exists on Walrus but could not be retrieved.
                          Showing stored metadata instead.
                        </p>
                      </>
                    ) : messageCount === 0 && !isEncrypted ? (
                      <p className="text-slate-500 text-sm">
                        No messages in this conversation
                      </p>
                    ) : null}
                  </div>
                )}
          </div>
        </div>

        <div className="px-6 py-4 border-t border-slate-800 flex flex-col sm:flex-row gap-3">
          <a
            href={`https://walruscan.com/${activeNetwork}/blob/${conversation.blobId}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 text-center bg-cyan-600 hover:bg-cyan-500 text-white px-4 py-2.5 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2"
          >
            <Database className="w-4 h-4" />
            View Storage
          </a>

          <a
            href={`https://suiscan.xyz/${activeNetwork}/object/${suiTxHash}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 text-center bg-purple-600 hover:bg-purple-500 text-white px-4 py-2.5 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2"
          >
            <Shield className="w-4 h-4" />
            Verify On-Chain
          </a>

          <button
            onClick={onClose}
            className="flex-1 text-center bg-slate-700/50 hover:bg-slate-700 text-slate-300 hover:text-white px-4 py-2.5 rounded-lg text-sm font-medium transition-colors"
          >
            Close
          </button>
        </div>

        {/* Footer note */}
        <div className="px-6 py-2 border-t border-slate-800/50 bg-slate-900/30">
          <p className="text-[10px] text-slate-500 text-center font-mono">
            🔒 Court-admissible evidence • Immutable • Verifiable on-chain
          </p>
        </div>
      </div>
    </div>
  );
}
