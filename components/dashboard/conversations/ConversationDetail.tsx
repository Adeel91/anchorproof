'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import {
  X,
  Loader2,
  AlertCircle,
  Database,
  ExternalLink,
  Clock,
  FileCheck,
  Link as LinkIcon,
  Copy,
  Calendar,
  Lock,
  Fingerprint,
  CheckCircle,
  User,
  Bot,
  Shield,
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
  anchorProofTxHash?: string;
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

  const isVerified =
    conversation?.verifiedAt !== null && conversation?.verifiedAt !== undefined;
  const isAnchorProofVerified =
    conversation?.anchorProofTxHash !== null &&
    conversation?.anchorProofTxHash !== undefined;

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
  const anchorProofTxHash = conversation.anchorProofTxHash || null;
  const messages = conversation.messages || [];
  const messageCount = messages.length;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-50 p-4">
      <div className="bg-gradient-to-b from-slate-900 to-slate-950 border border-slate-700/50 rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden shadow-2xl shadow-indigo-500/10 animate-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800/50 bg-slate-800/20">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/20">
              <Shield className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-white">
                Conversation Details
              </h3>
              <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                <span className="text-[10px] text-slate-500 font-mono">
                  {conversation.conversationId || 'N/A'}
                </span>
                <span className="w-px h-3 bg-slate-700" />
                <span
                  className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium ${
                    isVerified || isAnchorProofVerified
                      ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/20'
                      : 'bg-amber-500/15 text-amber-400 border border-amber-500/20'
                  }`}
                >
                  {isVerified || isAnchorProofVerified ? (
                    <>
                      <CheckCircle className="w-3 h-3" />
                      Verified
                    </>
                  ) : (
                    <>
                      <Clock className="w-3 h-3" />
                      Pending
                    </>
                  )}
                </span>
                {conversation.verifiedAt && (
                  <span className="text-[10px] text-slate-500 flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    {formatDate(conversation.verifiedAt)}
                  </span>
                )}
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-500 hover:text-white transition-colors p-1.5 rounded-lg hover:bg-slate-800/50"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto max-h-[calc(90vh-180px)] space-y-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="p-3 rounded-xl bg-slate-800/30 border border-slate-700/30">
              <p className="text-[10px] text-slate-500 uppercase tracking-wider mb-0.5">
                Conversation ID
              </p>
              <p className="text-sm text-white font-mono truncate">
                {conversation.conversationId?.slice(0, 20) || 'N/A'}
              </p>
            </div>
            <div className="p-3 rounded-xl bg-slate-800/30 border border-slate-700/30">
              <p className="text-[10px] text-slate-500 uppercase tracking-wider mb-0.5">
                Customer
              </p>
              <p className="text-sm text-white">
                {conversation.metadata?.customerId || 'N/A'}
              </p>
            </div>
            <div className="p-3 rounded-xl bg-slate-800/30 border border-slate-700/30">
              <p className="text-[10px] text-slate-500 uppercase tracking-wider mb-0.5">
                Agent
              </p>
              <p className="text-sm text-white">
                {conversation.metadata?.agentId || 'N/A'}
              </p>
            </div>
            <div className="p-3 rounded-xl bg-slate-800/30 border border-slate-700/30">
              <p className="text-[10px] text-slate-500 uppercase tracking-wider mb-0.5">
                Messages
              </p>
              <p className="text-sm text-white font-semibold">{messageCount}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="group p-3 rounded-xl bg-slate-800/30 border border-slate-700/30 hover:border-cyan-500/30 transition-all duration-300">
              <div className="flex items-center justify-between mb-1.5">
                <div className="flex items-center gap-2">
                  <div className="p-1 rounded-lg bg-cyan-500/10">
                    <Database className="w-3.5 h-3.5 text-cyan-400" />
                  </div>
                  <span className="text-[10px] text-slate-500 font-mono font-semibold uppercase tracking-wider">
                    Walrus Storage
                  </span>
                </div>
                <button
                  onClick={() => copyToClipboard(conversation.blobId, 'blob')}
                  className="text-slate-500 hover:text-white transition-colors p-1 rounded hover:bg-slate-700/30"
                >
                  <Copy className="w-3.5 h-3.5" />
                </button>
              </div>
              <code className="text-cyan-400 text-xs break-all font-mono bg-slate-900/50 px-2 py-1.5 rounded-lg block mb-1.5">
                {conversation.blobId}
              </code>
              <div className="flex items-center justify-between">
                {copied === 'blob' && (
                  <span className="text-[10px] text-emerald-400 flex items-center gap-1">
                    <CheckCircle className="w-3 h-3" />
                    Copied!
                  </span>
                )}
                <a
                  href={`https://walruscan.com/${activeNetwork}/blob/${conversation.blobId}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[10px] text-indigo-400 hover:text-indigo-300 inline-flex items-center gap-1 transition-colors ml-auto"
                >
                  <ExternalLink className="w-3 h-3" />
                  View
                </a>
              </div>
            </div>

            <div className="group p-3 rounded-xl bg-slate-800/30 border border-slate-700/30 hover:border-blue-500/30 transition-all duration-300">
              <div className="flex items-center justify-between mb-1.5">
                <div className="flex items-center gap-2">
                  <div className="p-1 rounded-lg bg-blue-500/10">
                    <LinkIcon className="w-3.5 h-3.5 text-blue-400" />
                  </div>
                  <span className="text-[10px] text-slate-500 font-mono font-semibold uppercase tracking-wider">
                    Walrus Tx
                  </span>
                </div>
                <button
                  onClick={() => copyToClipboard(suiTxHash, 'sui')}
                  className="text-slate-500 hover:text-white transition-colors p-1 rounded hover:bg-slate-700/30"
                >
                  <Copy className="w-3.5 h-3.5" />
                </button>
              </div>
              <code className="text-blue-400 text-xs break-all font-mono bg-slate-900/50 px-2 py-1.5 rounded-lg block mb-1.5">
                {suiTxHash}
              </code>
              <div className="flex items-center justify-between">
                {copied === 'sui' && (
                  <span className="text-[10px] text-emerald-400 flex items-center gap-1">
                    <CheckCircle className="w-3 h-3" />
                    Copied!
                  </span>
                )}
                <a
                  href={`https://suiscan.xyz/${activeNetwork}/object/${suiTxHash}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[10px] text-indigo-400 hover:text-indigo-300 inline-flex items-center gap-1 transition-colors ml-auto"
                >
                  <ExternalLink className="w-3 h-3" />
                  View
                </a>
              </div>
            </div>

            <div className="group p-3 rounded-xl bg-slate-800/30 border border-slate-700/30 hover:border-amber-500/30 transition-all duration-300">
              <div className="flex items-center justify-between mb-1.5">
                <div className="flex items-center gap-2">
                  <div className="p-1 rounded-lg bg-amber-500/10">
                    <Fingerprint className="w-3.5 h-3.5 text-amber-400" />
                  </div>
                  <span className="text-[10px] text-slate-500 font-mono font-semibold uppercase tracking-wider">
                    AnchorProof
                  </span>
                </div>
                {anchorProofTxHash ? (
                  <button
                    onClick={() => copyToClipboard(anchorProofTxHash, 'anchor')}
                    className="text-slate-500 hover:text-white transition-colors p-1 rounded hover:bg-slate-700/30"
                  >
                    <Copy className="w-3.5 h-3.5" />
                  </button>
                ) : (
                  <span className="text-[10px] text-slate-600">N/A</span>
                )}
              </div>
              {anchorProofTxHash ? (
                <>
                  <code className="text-amber-400 text-xs break-all font-mono bg-slate-900/50 px-2 py-1.5 rounded-lg block mb-1.5">
                    {anchorProofTxHash}
                  </code>
                  <div className="flex items-center justify-between">
                    {copied === 'anchor' && (
                      <span className="text-[10px] text-emerald-400 flex items-center gap-1">
                        <CheckCircle className="w-3 h-3" />
                        Copied!
                      </span>
                    )}
                    <div className="flex items-center gap-2 ml-auto">
                      <span className="text-[10px] text-emerald-400 flex items-center gap-1">
                        <CheckCircle className="w-3 h-3" />
                        Verified
                      </span>
                      <a
                        href={`https://suiscan.xyz/${activeNetwork}/tx/${anchorProofTxHash}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[10px] text-indigo-400 hover:text-indigo-300 inline-flex items-center gap-1 transition-colors"
                      >
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  </div>
                </>
              ) : (
                <div className="text-xs text-slate-500 flex items-center gap-1.5 mt-1">
                  <Clock className="w-3 h-3 text-amber-400/70" />
                  <span>Pending verification</span>
                </div>
              )}
            </div>
          </div>

          <div>
            <div className="flex items-center gap-2 mb-3">
              <FileCheck className="w-4 h-4 text-indigo-400" />
              <h4 className="text-sm font-medium text-white">Transcript</h4>
              <span className="text-xs text-slate-500">
                ({messageCount} messages)
              </span>
              {isEncrypted && messageCount === 0 && (
                <span className="text-xs text-purple-400 font-normal ml-2">
                  (Encrypted)
                </span>
              )}
              {isPlaintext && (
                <span className="text-xs text-blue-400 font-normal ml-2">
                  (Unencrypted)
                </span>
              )}
            </div>

            {isEncrypted && messageCount === 0 && (
              <div className="text-center py-10 bg-purple-500/5 rounded-xl border border-purple-500/20">
                <Lock className="w-12 h-12 text-purple-400 mx-auto mb-3" />
                <p className="text-sm text-slate-400 font-medium">
                  This conversation is encrypted
                </p>
                <p className="text-xs text-slate-500 mt-1">
                  Protected with SEAL encryption
                </p>
                <a
                  href={`https://suiscan.xyz/${activeNetwork}/object/${suiTxHash}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-3 inline-flex items-center gap-1 text-indigo-400 hover:text-indigo-300 text-sm transition-colors"
                >
                  Verify on SuiScan
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            )}

            {messageCount > 0 && !isEncrypted && (
              <div className="space-y-2.5">
                {messages.map((msg, idx: number) => (
                  <div
                    key={idx}
                    className={`p-4 rounded-xl ${
                      msg.role === 'user'
                        ? 'bg-indigo-500/10 border border-indigo-500/20'
                        : 'bg-slate-800/30 border border-slate-700/30'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 mb-1.5">
                      <div
                        className={`p-1 rounded-lg ${
                          msg.role === 'user'
                            ? 'bg-indigo-500/20 text-indigo-400'
                            : 'bg-cyan-500/20 text-cyan-400'
                        }`}
                      >
                        {msg.role === 'user' ? (
                          <User className="w-3.5 h-3.5" />
                        ) : (
                          <Bot className="w-3.5 h-3.5" />
                        )}
                      </div>
                      <span
                        className={`text-xs font-semibold ${
                          msg.role === 'user'
                            ? 'text-indigo-400'
                            : 'text-cyan-400'
                        }`}
                      >
                        {msg.role === 'user' ? 'Customer' : 'AI Assistant'}
                      </span>
                      {msg.timestamp && (
                        <span className="text-[10px] text-slate-500">
                          {new Date(msg.timestamp).toLocaleTimeString()}
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-slate-300 whitespace-pre-wrap leading-relaxed pl-0.5">
                      {msg.content}
                    </p>
                  </div>
                ))}
              </div>
            )}

            {isFallback && messageCount === 0 && !isEncrypted && (
              <div className="text-center py-10 bg-amber-500/5 rounded-xl border border-amber-500/20">
                <Database className="w-12 h-12 text-amber-400 mx-auto mb-3" />
                <p className="text-sm text-slate-400 font-medium">
                  Conversation data temporarily unavailable
                </p>
                <p className="text-xs text-slate-500 mt-1">
                  The blob exists on Walrus but could not be retrieved
                </p>
              </div>
            )}

            {!isFallback &&
              messageCount === 0 &&
              !isEncrypted &&
              !isPlaintext && (
                <div className="text-center py-10 text-slate-500 text-sm">
                  No messages in this conversation
                </div>
              )}
          </div>
        </div>

        <div className="px-6 py-4 border-t border-slate-800/50 bg-slate-800/10">
          <div className="flex flex-wrap gap-2">
            <a
              href={`https://walruscan.com/${activeNetwork}/blob/${conversation.blobId}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 min-w-[120px] text-center bg-cyan-600/80 hover:bg-cyan-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2"
            >
              <Database className="w-4 h-4" />
              Storage
            </a>

            <a
              href={`https://suiscan.xyz/${activeNetwork}/object/${suiTxHash}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 min-w-[120px] text-center bg-blue-600/80 hover:bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2"
            >
              <LinkIcon className="w-4 h-4" />
              Walrus Tx
            </a>

            {anchorProofTxHash && (
              <a
                href={`https://suiscan.xyz/${activeNetwork}/tx/${anchorProofTxHash}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 min-w-[120px] text-center bg-amber-600/80 hover:bg-amber-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2"
              >
                <Fingerprint className="w-4 h-4" />
                AnchorProof
              </a>
            )}

            <button
              onClick={onClose}
              className="flex-1 min-w-[80px] text-center bg-slate-700/50 hover:bg-slate-700 text-slate-300 hover:text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
            >
              Close
            </button>
          </div>
        </div>

        <div className="px-6 py-2 border-t border-slate-800/30 bg-slate-900/30">
          <p className="text-[10px] text-slate-500 text-center font-mono flex items-center justify-center gap-3 flex-wrap">
            <span className="flex items-center gap-1">
              <CheckCircle className="w-3 h-3 text-emerald-400/70" />
              Court-admissible
            </span>
            <span className="text-slate-700">•</span>
            <span className="flex items-center gap-1">
              <Database className="w-3 h-3 text-cyan-400/70" />
              Walrus
            </span>
            <span className="text-slate-700">•</span>
            <span className="flex items-center gap-1">
              <LinkIcon className="w-3 h-3 text-blue-400/70" />
              Sui
            </span>
            {anchorProofTxHash && (
              <>
                <span className="text-slate-700">•</span>
                <span className="flex items-center gap-1 text-amber-400/70">
                  <Fingerprint className="w-3 h-3" />
                  AnchorProof
                </span>
              </>
            )}
          </p>
        </div>
      </div>
    </div>
  );
}
