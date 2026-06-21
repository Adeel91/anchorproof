'use client';

import { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'next/navigation';
import {
  Shield,
  Fingerprint,
  Search,
  Loader2,
  CheckCircle,
  Database,
  ExternalLink,
  Link as LinkIcon,
  Clock,
  AlertCircle,
  X,
  Award,
  FileCheck,
  Copy,
  Check,
  Building2,
  Calendar,
  Hash,
  Circle,
  MessageSquare,
  Eye,
  Lock,
} from 'lucide-react';
import Button from '@/components/ui/Button';
import { activeNetwork } from '@/lib/walrus/client';

interface Message {
  role: string;
  content: string;
  timestamp?: string;
}

interface VerificationData {
  success: boolean;
  verified: boolean;
  data: {
    blobId: string;
    conversationId: string;
    verifiedAt: string | null;
    contentHash: string;
    anchorProofTxHash: string;
    suiTxHash: string;
    messageCount: number;
    customerId?: string;
    agentId?: string;
    createdAt: string;
    messages?: Message[];
  };
}

export function VerifyForm() {
  const searchParams = useSearchParams();
  const initialHash = searchParams.get('hash') || '';
  const hasAutoVerified = useRef(false);

  const [hash, setHash] = useState(initialHash);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<VerificationData | null>(null);
  const [copied, setCopied] = useState<string | null>(null);

  const handleVerify = async (value: string) => {
    const trimmed = value.trim();
    if (!trimmed) {
      setError('Please enter a transaction hash');
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const res = await fetch(`/api/verify/${trimmed}`);
      const data = await res.json();

      if (!res.ok) throw new Error(data.error || 'Verification failed');
      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to verify');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (initialHash && !hasAutoVerified.current) {
      hasAutoVerified.current = true;
      handleVerify(initialHash);
    }
  }, [initialHash]);

  const handleReset = () => {
    setResult(null);
    setError(null);
    setHash('');
    hasAutoVerified.current = false;
  };

  const copyToClipboard = (text: string, type: string) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopied(type);
    setTimeout(() => setCopied(null), 2000);
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      timeZoneName: 'short',
    });
  };

  const isValidHash = (hash: string) => {
    return hash && hash.length > 10 && hash !== 'N/A';
  };

  return (
    <div className="space-y-8">
      <div className="text-center">
        <div className="relative inline-block">
          <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500/20 to-purple-500/20 rounded-full blur-xl" />
          <div className="relative w-20 h-20 rounded-2xl bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center shadow-2xl shadow-indigo-500/30 mx-auto">
            <Shield className="w-10 h-10 text-white" />
          </div>
        </div>
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mt-4">
          Verify Conversation
        </h1>
        <p className="text-slate-400 mt-2 max-w-2xl mx-auto text-sm md:text-base">
          Enter an AnchorProof transaction hash to verify the authenticity and
          integrity of any conversation
        </p>

        <div className="flex flex-wrap items-center justify-center gap-3 mt-4">
          <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs">
            <CheckCircle className="w-3.5 h-3.5" />
            Blockchain Verified
          </span>
          <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-xs">
            <Database className="w-3.5 h-3.5" />
            Walrus Stored
          </span>
          <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs">
            <Fingerprint className="w-3.5 h-3.5" />
            Tamper-Proof
          </span>
          <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-400 text-xs">
            <Award className="w-3.5 h-3.5" />
            Court-Admissible
          </span>
        </div>
      </div>

      <div className="bg-slate-900/60 border border-slate-700/50 rounded-2xl p-6 shadow-xl shadow-indigo-500/5 backdrop-blur-sm">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleVerify(hash);
          }}
          className="flex flex-col sm:flex-row gap-3"
        >
          <div className="flex-1 relative">
            <div className="absolute left-3 top-1/2 -translate-y-1/2">
              <Search className="w-5 h-5 text-slate-500" />
            </div>
            <input
              type="text"
              value={hash}
              onChange={(e) => setHash(e.target.value)}
              placeholder="Paste AnchorProof transaction hash (0x...)"
              className="w-full pl-11 pr-4 py-3.5 bg-slate-800/50 border border-slate-700 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all"
              disabled={loading}
            />
            {hash && !loading && (
              <button
                type="button"
                onClick={() => setHash('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
          <Button
            type="submit"
            variant="primary"
            size="md"
            disabled={loading || !hash.trim()}
            className="min-w-[140px]"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin mr-2" />
                Verifying...
              </>
            ) : (
              <>
                <Fingerprint className="w-5 h-5 mr-2" />
                Verify
              </>
            )}
          </Button>
        </form>

        {error && (
          <div className="mt-4 p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-red-400 font-medium">Verification Failed</p>
              <p className="text-red-300/70 text-sm">{error}</p>
            </div>
          </div>
        )}

        {!result && !loading && (
          <div className="mt-3 text-xs text-slate-500 text-center">
            <span>Try pasting a hash like </span>
            <span className="text-indigo-400/70 font-mono">
              0x7c4a8d09ca3762af61e59520943dc26494f8941b
            </span>
          </div>
        )}
      </div>

      {result && (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-6">
          <div
            className={`p-6 rounded-2xl border ${
              result.verified
                ? 'bg-emerald-500/10 border-emerald-500/30 shadow-lg shadow-emerald-500/10'
                : 'bg-amber-500/10 border-amber-500/30 shadow-lg shadow-amber-500/10'
            }`}
          >
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
              <div
                className={`p-3 rounded-xl flex-shrink-0 ${
                  result.verified ? 'bg-emerald-500/20' : 'bg-amber-500/20'
                }`}
              >
                {result.verified ? (
                  <CheckCircle className="w-8 h-8 text-emerald-400" />
                ) : (
                  <Clock className="w-8 h-8 text-amber-400" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <h3
                  className={`text-xl font-bold ${
                    result.verified ? 'text-emerald-400' : 'text-amber-400'
                  }`}
                >
                  {result.verified ? (
                    <span className="flex items-center gap-2">
                      <CheckCircle className="w-5 h-5" />
                      Verified
                    </span>
                  ) : (
                    <span className="flex items-center gap-2">
                      <Clock className="w-5 h-5" />
                      Pending Verification
                    </span>
                  )}
                </h3>
                <p className="text-slate-400 text-sm">
                  {result.verified
                    ? `This conversation was cryptographically verified on ${formatDate(result.data.verifiedAt!)}`
                    : 'This conversation has not been verified on-chain yet'}
                </p>
                {result.verified && result.data.verifiedAt && (
                  <div className="flex items-center gap-3 mt-1 text-xs text-slate-500">
                    <span className="flex items-center gap-1">
                      <Check className="w-3 h-3 text-emerald-400" />
                      Integrity Verified
                    </span>
                    <span className="text-slate-700">•</span>
                    <span className="flex items-center gap-1">
                      <Fingerprint className="w-3 h-3 text-indigo-400" />
                      AnchorProof Valid
                    </span>
                  </div>
                )}
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={handleReset}
                className="flex-shrink-0"
              >
                <X className="w-4 h-4 mr-1.5" />
                Clear
              </Button>
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-4">
            <div className="bg-slate-800/30 border border-slate-700/50 rounded-xl p-5 hover:border-cyan-500/40 transition-all duration-300">
              <div className="flex items-center gap-2 mb-3">
                <div className="p-2 rounded-lg bg-cyan-500/10">
                  <Database className="w-4 h-4 text-cyan-400" />
                </div>
                <span className="text-xs text-slate-500 font-mono font-semibold uppercase tracking-wider">
                  Walrus Blob
                </span>
                {isValidHash(result.data.blobId) ? (
                  <span className="ml-auto text-[10px] px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-400 flex items-center gap-1">
                    <CheckCircle className="w-3 h-3" />
                    Stored
                  </span>
                ) : (
                  <span className="ml-auto text-[10px] px-2 py-0.5 rounded-full bg-slate-700/50 text-slate-500">
                    N/A
                  </span>
                )}
              </div>
              <div className="space-y-2">
                <code className="text-cyan-300 text-xs break-all font-mono bg-slate-900/50 px-3 py-2 rounded-lg block">
                  {isValidHash(result.data.blobId) ? result.data.blobId : 'N/A'}
                </code>
                {isValidHash(result.data.blobId) && (
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] text-slate-500 flex items-center gap-1">
                      <Database className="w-3 h-3 text-cyan-400/70" />
                      Encrypted storage
                    </span>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() =>
                          copyToClipboard(result.data.blobId, 'blob')
                        }
                        className="text-slate-500 hover:text-white transition-colors p-1.5 rounded hover:bg-slate-700/30"
                        title="Copy"
                      >
                        {copied === 'blob' ? (
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                      </button>
                      <a
                        href={`https://walruscan.com/${activeNetwork}/blob/${result.data.blobId}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-slate-500 hover:text-cyan-400 transition-colors p-1.5 rounded hover:bg-slate-700/30"
                        title="View on Walrus"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="bg-slate-800/30 border border-slate-700/50 rounded-xl p-5 hover:border-blue-500/40 transition-all duration-300">
              <div className="flex items-center gap-2 mb-3">
                <div className="p-2 rounded-lg bg-blue-500/10">
                  <LinkIcon className="w-4 h-4 text-blue-400" />
                </div>
                <span className="text-xs text-slate-500 font-mono font-semibold uppercase tracking-wider">
                  Sui Transaction
                </span>
                {isValidHash(result.data.suiTxHash) ? (
                  <span className="ml-auto text-[10px] px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-400 flex items-center gap-1">
                    <CheckCircle className="w-3 h-3" />
                    Confirmed
                  </span>
                ) : (
                  <span className="ml-auto text-[10px] px-2 py-0.5 rounded-full bg-slate-700/50 text-slate-500">
                    N/A
                  </span>
                )}
              </div>
              <div className="space-y-2">
                <code className="text-blue-300 text-xs break-all font-mono bg-slate-900/50 px-3 py-2 rounded-lg block">
                  {isValidHash(result.data.suiTxHash)
                    ? result.data.suiTxHash
                    : 'N/A'}
                </code>
                {isValidHash(result.data.suiTxHash) && (
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] text-slate-500 flex items-center gap-1">
                      <LinkIcon className="w-3 h-3 text-blue-400/70" />
                      Walrus storage tx
                    </span>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() =>
                          copyToClipboard(result.data.suiTxHash, 'sui')
                        }
                        className="text-slate-500 hover:text-white transition-colors p-1.5 rounded hover:bg-slate-700/30"
                        title="Copy"
                      >
                        {copied === 'sui' ? (
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                      </button>
                      <a
                        href={`https://suiscan.xyz/${activeNetwork}/object/${result.data.suiTxHash}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-slate-500 hover:text-blue-400 transition-colors p-1.5 rounded hover:bg-slate-700/30"
                        title="View on Sui"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="bg-slate-800/30 border border-slate-700/50 rounded-xl p-5 hover:border-indigo-500/40 transition-all duration-300">
              <div className="flex items-center gap-2 mb-3">
                <div className="p-2 rounded-lg bg-indigo-500/10">
                  <Fingerprint className="w-4 h-4 text-indigo-400" />
                </div>
                <span className="text-xs text-slate-500 font-mono font-semibold uppercase tracking-wider">
                  AnchorProof
                </span>
                {isValidHash(result.data.anchorProofTxHash) ? (
                  result.verified ? (
                    <span className="ml-auto text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center gap-1">
                      <CheckCircle className="w-3 h-3" />
                      Verified
                    </span>
                  ) : (
                    <span className="ml-auto text-[10px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-400 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      Pending
                    </span>
                  )
                ) : (
                  <span className="ml-auto text-[10px] px-2 py-0.5 rounded-full bg-slate-700/50 text-slate-500">
                    N/A
                  </span>
                )}
              </div>
              <div className="space-y-2">
                <code className="text-indigo-300 text-xs break-all font-mono bg-slate-900/50 px-3 py-2 rounded-lg block">
                  {isValidHash(result.data.anchorProofTxHash)
                    ? result.data.anchorProofTxHash
                    : 'N/A'}
                </code>
                {isValidHash(result.data.anchorProofTxHash) && (
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] text-slate-500 flex items-center gap-1">
                      <Fingerprint className="w-3 h-3 text-indigo-400/70" />
                      On-chain verification
                    </span>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() =>
                          copyToClipboard(
                            result.data.anchorProofTxHash,
                            'anchor'
                          )
                        }
                        className="text-slate-500 hover:text-white transition-colors p-1.5 rounded hover:bg-slate-700/30"
                        title="Copy"
                      >
                        {copied === 'anchor' ? (
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                      </button>
                      <a
                        href={`https://suiscan.xyz/${activeNetwork}/tx/${result.data.anchorProofTxHash}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-slate-500 hover:text-indigo-400 transition-colors p-1.5 rounded hover:bg-slate-700/30"
                        title="View on Sui"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <div className="bg-slate-800/30 border border-slate-700/50 rounded-xl p-4">
              <p className="text-[10px] text-slate-500 font-mono font-semibold uppercase tracking-wider flex items-center gap-1.5">
                <Hash className="w-3.5 h-3.5 text-purple-400" />
                Conversation ID
              </p>
              <code className="text-white text-xs font-mono break-all mt-1.5 block">
                {result.data.conversationId}
              </code>
            </div>

            <div className="bg-slate-800/30 border border-slate-700/50 rounded-xl p-4">
              <p className="text-[10px] text-slate-500 font-mono font-semibold uppercase tracking-wider flex items-center gap-1.5">
                <FileCheck className="w-3.5 h-3.5 text-emerald-400" />
                Messages
              </p>
              <p className="text-white text-lg font-bold mt-1">
                {result.data.messageCount}
              </p>
              <p className="text-[10px] text-slate-500">Total messages</p>
            </div>

            <div className="bg-slate-800/30 border border-slate-700/50 rounded-xl p-4">
              <p className="text-[10px] text-slate-500 font-mono font-semibold uppercase tracking-wider flex items-center gap-1.5">
                <Building2 className="w-3.5 h-3.5 text-indigo-400" />
                Customer
              </p>
              <p className="text-white text-sm font-medium mt-1">
                {result.data.customerId || 'N/A'}
              </p>
              <p className="text-[10px] text-slate-500">Identifier</p>
            </div>

            <div className="bg-slate-800/30 border border-slate-700/50 rounded-xl p-4">
              <p className="text-[10px] text-slate-500 font-mono font-semibold uppercase tracking-wider flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-purple-400" />
                Created
              </p>
              <p className="text-white text-xs mt-1">
                {formatDate(result.data.createdAt)}
              </p>
              <p className="text-[10px] text-slate-500">Timestamp</p>
            </div>
          </div>

          <div className="bg-slate-800/30 border border-slate-700/50 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <div className="p-1.5 rounded-lg bg-amber-500/10">
                <Hash className="w-4 h-4 text-amber-400" />
              </div>
              <span className="text-xs text-slate-500 font-mono font-semibold uppercase tracking-wider">
                Content Fingerprint
              </span>
              <span className="ml-auto text-[10px] text-slate-500">
                SHA-256
              </span>
            </div>
            <code className="text-amber-300 text-xs break-all font-mono bg-slate-900/50 px-3 py-2 rounded-lg block">
              {result.data.contentHash}
            </code>
            <p className="text-[10px] text-slate-500 mt-2 flex items-center gap-1">
              <Fingerprint className="w-3 h-3 text-amber-400/70" />
              Cryptographic hash of the conversation content - used to detect
              tampering
            </p>
          </div>

          <div className="bg-slate-800/30 border border-slate-700/50 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-3">
              <div className="p-1.5 rounded-lg bg-indigo-500/10">
                <MessageSquare className="w-4 h-4 text-indigo-400" />
              </div>
              <span className="text-xs text-slate-500 font-mono font-semibold uppercase tracking-wider">
                Message Preview
              </span>
              <span className="ml-auto text-[10px] text-slate-500 flex items-center gap-1">
                <Eye className="w-3 h-3" />
                Limited Preview
              </span>
            </div>

            {result.data.messages && result.data.messages.length > 0 ? (
              <div className="space-y-2">
                {result.data.messages.slice(0, 3).map((msg, idx) => (
                  <div
                    key={idx}
                    className={`p-2.5 rounded-lg ${
                      msg.role === 'user'
                        ? 'bg-indigo-500/5 border border-indigo-500/10'
                        : 'bg-slate-700/20 border border-slate-700/20'
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-0.5">
                      <span
                        className={`text-[10px] font-medium ${
                          msg.role === 'user'
                            ? 'text-indigo-400'
                            : 'text-cyan-400'
                        }`}
                      >
                        {msg.role === 'user' ? 'Customer' : 'Assistant'}
                      </span>
                      {msg.timestamp && (
                        <>
                          <span className="text-[9px] text-slate-600">•</span>
                          <span className="text-[9px] text-slate-500">
                            {new Date(msg.timestamp).toLocaleTimeString()}
                          </span>
                        </>
                      )}
                    </div>
                    <p className="text-xs text-slate-300 line-clamp-2">
                      {msg.content}
                    </p>
                  </div>
                ))}

                {result.data.messages.length > 3 && (
                  <div className="flex items-center justify-center gap-2 pt-1">
                    <p className="text-[10px] text-slate-500">
                      + {result.data.messages.length - 3} more messages
                    </p>
                    <span className="text-slate-600">•</span>
                    <span className="text-[10px] text-indigo-400/70 flex items-center gap-1">
                      <Lock className="w-3 h-3" />
                      Full transcript with authorization
                    </span>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-4">
                <Lock className="w-5 h-5 text-amber-400/70 mx-auto mb-1.5" />
                <p className="text-xs text-slate-500">
                  Encrypted conversation content
                </p>
                <p className="text-[10px] text-slate-600 mt-0.5">
                  Verify on-chain to view message preview
                </p>
              </div>
            )}
          </div>

          <div className="bg-slate-800/30 border border-slate-700/50 rounded-xl p-5">
            <h4 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
              <Shield className="w-4 h-4 text-indigo-400" />
              Verification Summary
            </h4>
            <div className="grid sm:grid-cols-3 gap-4 text-xs">
              <div className="flex items-start gap-2">
                <Circle className="w-2 h-2 fill-emerald-400 text-emerald-400 mt-1.5 flex-shrink-0" />
                <div>
                  <p className="text-slate-400 font-medium">Storage</p>
                  <p className="text-slate-500">
                    Data stored on Walrus network
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <Circle className="w-2 h-2 fill-blue-400 text-blue-400 mt-1.5 flex-shrink-0" />
                <div>
                  <p className="text-slate-400 font-medium">Blockchain</p>
                  <p className="text-slate-500">Verified on Sui blockchain</p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <Circle className="w-2 h-2 fill-indigo-400 text-indigo-400 mt-1.5 flex-shrink-0" />
                <div>
                  <p className="text-slate-400 font-medium">Integrity</p>
                  <p className="text-slate-500">
                    Tamper-proof & court-admissible
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-800/50">
            <div className="flex flex-wrap items-center justify-center gap-4 text-xs text-slate-500">
              <span className="flex items-center gap-1.5">
                <Award className="w-4 h-4 text-emerald-400/70" />
                Court-Admissible
              </span>
              <span className="text-slate-700">•</span>
              <span className="flex items-center gap-1.5">
                <Database className="w-4 h-4 text-cyan-400/70" />
                Walrus Stored
              </span>
              <span className="text-slate-700">•</span>
              <span className="flex items-center gap-1.5">
                <LinkIcon className="w-4 h-4 text-blue-400/70" />
                Sui Verified
              </span>
              <span className="text-slate-700">•</span>
              <span className="flex items-center gap-1.5">
                <Fingerprint className="w-4 h-4 text-indigo-400/70" />
                Tamper-Proof
              </span>
              <span className="text-slate-700">•</span>
              <span className="flex items-center gap-1.5">
                <Shield className="w-4 h-4 text-purple-400/70" />
                Enterprise Grade
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
