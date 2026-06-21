'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import Button from '@/components/ui/Button';
import { sendMessageAction, saveConversationAction } from '@/app/actions/chat';
import { activeNetwork } from '@/lib/walrus/client';
import {
  Shield,
  Database,
  Link as LinkIcon,
  CheckCircle,
  Send,
  Lock,
  FileCheck,
  Clock,
  User,
  ShieldCheck,
  Fingerprint,
  Award,
  HeartPulse,
  Stethoscope,
  Loader2,
  ExternalLink,
  Check,
  X,
  Copy,
} from 'lucide-react';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

interface SaveResult {
  blobId: string;
  suiTxHash: string;
  walrusExplorerUrl?: string;
  contentHash?: string;
  anchorProofTxHash?: string;
}

const generateConversationId = () => {
  return `conv_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

export default function HealthcareChat() {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content:
        "Hello! I'm your healthcare compliance AI assistant. I can help with HIPAA, HITECH, FDA guidelines, and patient data protection. Please note: I provide general compliance information only, not medical advice. All conversations are cryptographically verified and tamper-proof.",
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [conversationId] = useState(generateConversationId);
  const [saveResult, setSaveResult] = useState<SaveResult | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [hasSaved, setHasSaved] = useState(false);
  const [suiStatus, setSuiStatus] = useState<
    'idle' | 'pending' | 'verified' | 'failed'
  >('idle');
  const [copied, setCopied] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop =
        chatContainerRef.current.scrollHeight;
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  };

  const saveToBlockchain = useCallback(async () => {
    if (isSaving || messages.length <= 1 || hasSaved) return;

    setIsSaving(true);
    setSuiStatus('pending');
    setShowModal(true);

    try {
      const result = await saveConversationAction(
        conversationId,
        'healthcare-demo',
        'anchorproof-healthcare'
      );

      setSaveResult({
        blobId: result.blobId,
        suiTxHash: result.suiTxHash,
        walrusExplorerUrl: result.walrusExplorerUrl,
        contentHash: result.contentHash,
        anchorProofTxHash: result.anchorProofTxHash,
      });
      setSuiStatus('verified');
      setHasSaved(true);
    } catch (error) {
      console.error('Save error:', error);
      setSuiStatus('failed');
      alert(
        error instanceof Error ? error.message : 'Failed to save conversation'
      );
    } finally {
      setIsSaving(false);
    }
  }, [isSaving, messages.length, hasSaved, conversationId]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        if (messages.length > 0 && !hasSaved && !isSaving) {
          saveToBlockchain();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [messages, hasSaved, isSaving, saveToBlockchain]);

  const sendMessage = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput('');
    setMessages((prev) => [...prev, { role: 'user', content: userMessage }]);
    setIsLoading(true);

    try {
      await sendMessageAction(
        userMessage,
        'user',
        conversationId,
        'healthcare-demo',
        'anchorproof-healthcare'
      );

      const response = await fetch('/api/llm/healthcare', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [...messages, { role: 'user', content: userMessage }],
        }),
      });

      const data = await response.json();

      if (data.message) {
        setMessages((prev) => [
          ...prev,
          { role: 'assistant', content: data.message },
        ]);

        await sendMessageAction(
          data.message,
          'assistant',
          conversationId,
          'healthcare-demo',
          'anchorproof-healthcare'
        );
      }
    } catch (error) {
      console.error('Chat error:', error);
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: "I'm having trouble connecting. Please try again.",
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const fullHash = (hash: string) => {
    if (!hash) return '';
    return hash;
  };

  return (
    <div className="relative w-full mx-auto px-2 sm:px-0">
      <div className="bg-slate-900/60 border border-slate-700/50 rounded-xl sm:rounded-2xl overflow-hidden shadow-2xl shadow-emerald-500/5">
        <div className="bg-gradient-to-r from-slate-900 via-slate-900/95 to-slate-900 px-3 sm:px-6 py-3 sm:py-4 border-b border-slate-700/50">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="w-8 h-8 sm:w-11 sm:h-11 rounded-lg sm:rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-lg shadow-emerald-500/20 flex-shrink-0">
                <HeartPulse className="w-3.5 h-3.5 sm:w-5 sm:h-5 text-white" />
              </div>
              <div>
                <div className="flex items-center gap-1.5 sm:gap-2">
                  <h3 className="text-xs sm:text-base font-bold text-white">
                    AnchorProof Healthcare
                  </h3>
                  <span className="px-1.5 sm:px-2 py-0.5 bg-emerald-500/20 text-emerald-400 text-[6px] sm:text-[10px] font-mono font-semibold rounded-full border border-emerald-500/30 whitespace-nowrap">
                    LIVE DEMO
                  </span>
                </div>
                <div className="flex flex-wrap items-center gap-1.5 sm:gap-3 text-[8px] sm:text-[10px] text-slate-400 mt-0.5 sm:mt-0">
                  <span className="flex items-center gap-0.5 sm:gap-1">
                    <Shield className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-emerald-400" />
                    <span className="hidden xs:inline">SEAL Encrypted</span>
                    <span className="xs:hidden">SEAL</span>
                  </span>
                  <span className="w-px h-2 sm:h-3 bg-slate-700" />
                  <span className="flex items-center gap-0.5 sm:gap-1">
                    <Database className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-indigo-400" />
                    <span className="hidden xs:inline">Walrus Stored</span>
                    <span className="xs:hidden">Walrus</span>
                  </span>
                  <span className="w-px h-2 sm:h-3 bg-slate-700" />
                  <span className="flex items-center gap-0.5 sm:gap-1">
                    <LinkIcon className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-purple-400" />
                    <span className="hidden xs:inline">Sui Verified</span>
                    <span className="xs:hidden">Sui</span>
                  </span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="flex items-center gap-1 px-2 sm:px-3 py-0.5 sm:py-1 bg-emerald-500/10 rounded-full border border-emerald-500/20">
                <div className="w-1 h-1 sm:w-1.5 sm:h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-[8px] sm:text-[10px] text-emerald-400 font-mono">
                  Active
                </span>
              </div>
              {hasSaved && suiStatus === 'verified' && (
                <span className="flex items-center gap-0.5 sm:gap-1 text-[8px] sm:text-[10px] text-emerald-400">
                  <CheckCircle className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                  <span className="hidden sm:inline">Verified</span>
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="hidden xs:flex bg-slate-800/30 px-3 sm:px-6 py-1.5 sm:py-2 border-b border-slate-700/30 flex-wrap items-center gap-2 sm:gap-4 text-[8px] sm:text-[10px] text-slate-500">
          <span className="flex items-center gap-1 sm:gap-1.5">
            <Award className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-amber-400" />
            <span className="hidden sm:inline">HIPAA & HITECH Compliant</span>
            <span className="sm:hidden">HIPAA/HITECH</span>
          </span>
          <span className="w-px h-2 sm:h-3 bg-slate-700" />
          <span className="flex items-center gap-1 sm:gap-1.5">
            <Fingerprint className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-cyan-400" />
            <span className="hidden sm:inline">Cryptographically Verified</span>
            <span className="sm:hidden">Crypto Verified</span>
          </span>
          <span className="w-px h-2 sm:h-3 bg-slate-700" />
          <span className="flex items-center gap-1 sm:gap-1.5">
            <ShieldCheck className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-emerald-400" />
            <span className="hidden sm:inline">Tamper-Proof</span>
            <span className="sm:hidden">Tamper-Proof</span>
          </span>
        </div>

        <div
          ref={chatContainerRef}
          className="h-[280px] xs:h-[320px] sm:h-[380px] md:h-[420px] overflow-y-auto p-3 sm:p-6 space-y-2 sm:space-y-4"
          style={{ scrollBehavior: 'smooth' }}
        >
          {messages.map((message, idx) => {
            const isLast = idx === messages.length - 1;
            return (
              <div
                key={idx}
                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'} ${isLast && !isLoading ? 'animate-in fade-in slide-in-from-bottom-2 duration-300' : ''}`}
              >
                <div
                  className={`max-w-[90%] xs:max-w-[85%] sm:max-w-[80%] rounded-xl sm:rounded-2xl px-3 sm:px-4 py-2 sm:py-3 ${
                    message.role === 'user'
                      ? 'bg-gradient-to-br from-emerald-600 to-teal-700 text-white shadow-lg shadow-emerald-500/20'
                      : 'bg-slate-800/80 text-slate-200 border border-slate-700/50'
                  }`}
                >
                  <div className="flex items-center gap-1.5 sm:gap-2 mb-0.5 sm:mb-1">
                    {message.role === 'assistant' ? (
                      <Stethoscope className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-emerald-400" />
                    ) : (
                      <User className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-emerald-300" />
                    )}
                    <span className="text-[8px] sm:text-[10px] font-mono font-semibold uppercase tracking-wider opacity-70">
                      {message.role === 'assistant' ? 'AI Assistant' : 'You'}
                    </span>
                    <Clock className="w-2 h-2 sm:w-2.5 sm:h-2.5 opacity-30 ml-auto" />
                  </div>
                  <p className="text-xs sm:text-sm whitespace-pre-wrap break-words leading-relaxed">
                    {message.content}
                  </p>
                </div>
              </div>
            );
          })}
          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-slate-800/80 rounded-xl sm:rounded-2xl px-3 sm:px-4 py-2 sm:py-3 border border-slate-700/50">
                <div className="flex gap-1 sm:gap-1.5">
                  <span
                    className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-emerald-400 rounded-full animate-bounce"
                    style={{ animationDelay: '0ms' }}
                  />
                  <span
                    className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-emerald-400 rounded-full animate-bounce"
                    style={{ animationDelay: '150ms' }}
                  />
                  <span
                    className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-emerald-400 rounded-full animate-bounce"
                    style={{ animationDelay: '300ms' }}
                  />
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        <div className="bg-slate-900/80 px-2 sm:px-4 py-2 sm:py-3 border-t border-slate-700/50">
          <div className="flex gap-1.5 sm:gap-2">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Ask about HIPAA compliance, patient data protection, FDA guidelines..."
              rows={1}
              className="flex-1 bg-slate-800 border border-slate-700 rounded-lg sm:rounded-xl px-2.5 sm:px-4 py-2 sm:py-3 text-white text-xs sm:text-sm resize-none focus:outline-none focus:border-emerald-400 focus:ring-1 focus:ring-emerald-400/30 transition-all placeholder:text-slate-500 min-h-[36px] sm:min-h-[42px] max-h-[60px] sm:max-h-[80px]"
              style={{ minHeight: '36px', maxHeight: '60px' }}
              disabled={isLoading}
            />
            <Button
              variant="primary"
              onClick={sendMessage}
              disabled={!input.trim() || isLoading}
              className="px-3 sm:px-6 h-[36px] sm:h-[46px] flex-shrink-0 shadow-lg shadow-emerald-500/20 text-xs sm:text-sm"
            >
              <Send className="w-3 h-3 sm:w-4 sm:h-4" />
              <span className="hidden xs:inline ml-1.5 sm:ml-2">Send</span>
            </Button>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-1.5 sm:gap-3 mt-1.5 sm:mt-2 text-[7px] sm:text-[10px] text-slate-500">
            <span className="flex items-center gap-0.5 sm:gap-1">
              <Lock className="w-2 h-2 sm:w-3 sm:h-3 text-emerald-400" />
              <span className="hidden xs:inline">End-to-end encrypted</span>
              <span className="xs:hidden">E2E encrypted</span>
            </span>
            <span className="w-px h-2 sm:h-3 bg-slate-700" />
            <span className="flex items-center gap-0.5 sm:gap-1">
              <FileCheck className="w-2 h-2 sm:w-3 sm:h-3 text-indigo-400" />
              <span className="hidden xs:inline">Immutable storage</span>
              <span className="xs:hidden">Immutable</span>
            </span>
          </div>
        </div>
      </div>

      {!hasSaved && messages.length > 1 && (
        <div className="mt-3 sm:mt-4 p-2.5 sm:p-4 bg-gradient-to-r from-emerald-500/10 via-teal-500/10 to-emerald-500/10 rounded-lg sm:rounded-xl border border-emerald-500/20 backdrop-blur-sm">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-4">
            <div className="flex-1 w-full sm:w-auto">
              <div className="flex items-center gap-1.5 sm:gap-2 mb-0.5 sm:mb-1">
                <Shield className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-400" />
                <span className="text-[8px] sm:text-[10px] font-semibold text-emerald-400 uppercase tracking-wider">
                  HIPAA Verification
                </span>
              </div>
              <p className="text-[10px] sm:text-sm text-slate-300 leading-relaxed">
                Save as immutable record on Walrus and Sui blockchain.
                <span className="text-emerald-400 font-medium ml-1 hidden xs:inline">
                  Tamper-proof evidence for compliance.
                </span>
              </p>
            </div>
            <Button
              variant="primary"
              onClick={saveToBlockchain}
              disabled={isSaving}
              className="px-4 sm:px-7 py-1.5 sm:py-3 text-[10px] sm:text-sm font-semibold w-full sm:w-auto shadow-lg shadow-emerald-500/20"
            >
              {isSaving ? (
                <>
                  <Loader2 className="w-3 h-3 sm:w-4 sm:h-4 mr-1.5 sm:mr-2 animate-spin" />
                  Securing...
                </>
              ) : (
                <>
                  <ShieldCheck className="w-3 h-3 sm:w-4 sm:h-4 mr-1.5 sm:mr-2" />
                  <span className="hidden xs:inline">Secure to Blockchain</span>
                  <span className="xs:hidden">Secure</span>
                </>
              )}
            </Button>
          </div>
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-50 p-3 sm:p-4">
          <div className="bg-gradient-to-b from-slate-900 to-slate-950 border border-slate-700 rounded-2xl p-6 sm:p-8 max-w-2xl w-full shadow-2xl shadow-emerald-500/10 max-h-[95vh] sm:max-h-[90vh] overflow-y-auto animate-in zoom-in-95 duration-300 mx-2 sm:mx-0">
            <div className="text-center mb-6">
              <div
                className={`w-16 h-16 sm:w-20 sm:h-20 rounded-full flex items-center justify-center mx-auto mb-4 border-2 ${
                  suiStatus === 'verified'
                    ? 'bg-emerald-500/20 border-emerald-500/40 shadow-lg shadow-emerald-500/20'
                    : suiStatus === 'pending'
                      ? 'bg-amber-500/20 border-amber-500/40 shadow-lg shadow-amber-500/20'
                      : 'bg-red-500/20 border-red-500/40 shadow-lg shadow-red-500/20'
                }`}
              >
                {suiStatus === 'verified' && (
                  <CheckCircle className="w-8 h-8 sm:w-10 sm:h-10 text-emerald-400" />
                )}
                {suiStatus === 'pending' && (
                  <Loader2 className="w-8 h-8 sm:w-10 sm:h-10 text-amber-400 animate-spin" />
                )}
                {suiStatus === 'failed' && (
                  <X className="w-8 h-8 sm:w-10 sm:h-10 text-red-400" />
                )}
              </div>
              <h3 className="text-xl sm:text-2xl font-bold text-white mb-1">
                {suiStatus === 'verified' && 'Conversation Secured'}
                {suiStatus === 'pending' && 'Securing Conversation...'}
                {suiStatus === 'failed' && 'Verification Failed'}
              </h3>
              <p className="text-sm text-slate-400">
                {suiStatus === 'verified' &&
                  'Your conversation is now immutable and cryptographically verified on-chain.'}
                {suiStatus === 'pending' &&
                  'Your conversation is being securely stored and verified. This may take ~30 seconds...'}
                {suiStatus === 'failed' &&
                  'There was an issue saving the conversation. Please try again.'}
              </p>
            </div>

            <div className="space-y-4">
              <div className="bg-slate-800/60 rounded-xl p-4 border border-slate-700/50 hover:border-cyan-500/30 transition-all duration-300">
                <div className="flex items-center gap-2 mb-2">
                  <div className="p-1.5 bg-cyan-500/10 rounded-lg">
                    <Database className="w-4 h-4 text-cyan-400" />
                  </div>
                  <span className="text-xs font-mono font-semibold text-slate-300 uppercase tracking-wider">
                    Walrus Storage
                  </span>
                  <span className="ml-auto text-[10px]">
                    {saveResult?.blobId ? (
                      <span className="flex items-center gap-1 text-emerald-400">
                        <Check className="w-3 h-3" />
                        Stored
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 text-amber-400">
                        <Loader2 className="w-3 h-3 animate-spin" />
                        Uploading...
                      </span>
                    )}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <code className="flex-1 text-cyan-300 text-xs break-all font-mono bg-slate-900/70 px-3 py-2 rounded-lg">
                    {saveResult?.blobId
                      ? fullHash(saveResult.blobId)
                      : 'Waiting for upload...'}
                  </code>
                  {saveResult?.blobId && (
                    <button
                      onClick={() =>
                        copyToClipboard(saveResult.blobId!, 'walrus')
                      }
                      className="p-2 hover:bg-slate-700/50 rounded-lg transition-colors"
                      title="Copy to clipboard"
                    >
                      {copied === 'walrus' ? (
                        <Check className="w-4 h-4 text-emerald-400" />
                      ) : (
                        <Copy className="w-4 h-4 text-slate-400 hover:text-slate-300" />
                      )}
                    </button>
                  )}
                </div>
                <div className="flex items-center justify-between mt-2">
                  <span className="text-[10px] text-slate-500">
                    <Database className="w-3 h-3 inline mr-1 text-cyan-400/70" />
                    Encrypted data blob identifier
                  </span>
                  {saveResult?.blobId && (
                    <a
                      href={`https://walruscan.com/${activeNetwork}/blob/${saveResult.blobId}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 text-xs text-indigo-400 hover:text-indigo-300 transition-colors"
                    >
                      View on Walrus
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                </div>
              </div>

              <div className="bg-slate-800/60 rounded-xl p-4 border border-slate-700/50 hover:border-blue-500/30 transition-all duration-300">
                <div className="flex items-center gap-2 mb-2">
                  <div className="p-1.5 bg-blue-500/10 rounded-lg">
                    <LinkIcon className="w-4 h-4 text-blue-400" />
                  </div>
                  <span className="text-xs font-mono font-semibold text-slate-300 uppercase tracking-wider">
                    Walrus Transaction
                  </span>
                  <span className="ml-auto text-[10px]">
                    {saveResult?.suiTxHash ? (
                      <span className="flex items-center gap-1 text-emerald-400">
                        <Check className="w-3 h-3" />
                        Confirmed
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 text-amber-400">
                        <Loader2 className="w-3 h-3 animate-spin" />
                        Pending
                      </span>
                    )}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <code className="flex-1 text-blue-300 text-xs break-all font-mono bg-slate-900/70 px-3 py-2 rounded-lg">
                    {saveResult?.suiTxHash
                      ? fullHash(saveResult.suiTxHash)
                      : 'Waiting for confirmation...'}
                  </code>
                  {saveResult?.suiTxHash && (
                    <button
                      onClick={() =>
                        copyToClipboard(saveResult.suiTxHash!, 'sui')
                      }
                      className="p-2 hover:bg-slate-700/50 rounded-lg transition-colors"
                      title="Copy to clipboard"
                    >
                      {copied === 'sui' ? (
                        <Check className="w-4 h-4 text-emerald-400" />
                      ) : (
                        <Copy className="w-4 h-4 text-slate-400 hover:text-slate-300" />
                      )}
                    </button>
                  )}
                </div>
                <div className="flex items-center justify-between mt-2">
                  <span className="text-[10px] text-slate-500">
                    <LinkIcon className="w-3 h-3 inline mr-1 text-blue-400/70" />
                    Sui transaction for Walrus storage
                  </span>
                  {saveResult?.suiTxHash && (
                    <a
                      href={`https://suiscan.xyz/${activeNetwork}/object/${saveResult.suiTxHash}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 text-xs text-indigo-400 hover:text-indigo-300 transition-colors"
                    >
                      View on Sui
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                </div>
              </div>

              <div className="bg-slate-800/60 rounded-xl p-4 border border-slate-700/50 hover:border-amber-500/30 transition-all duration-300">
                <div className="flex items-center gap-2 mb-2">
                  <div className="p-1.5 bg-amber-500/10 rounded-lg">
                    <Fingerprint className="w-4 h-4 text-amber-400" />
                  </div>
                  <span className="text-xs font-mono font-semibold text-slate-300 uppercase tracking-wider">
                    AnchorProof Verification
                  </span>
                  <span className="ml-auto text-[10px]">
                    {saveResult?.anchorProofTxHash ? (
                      <span className="flex items-center gap-1 text-emerald-400">
                        <Check className="w-3 h-3" />
                        Verified
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 text-amber-400">
                        <Loader2 className="w-3 h-3 animate-spin" />
                        Recording...
                      </span>
                    )}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <code className="flex-1 text-amber-300 text-xs break-all font-mono bg-slate-900/70 px-3 py-2 rounded-lg">
                    {saveResult?.anchorProofTxHash
                      ? fullHash(saveResult.anchorProofTxHash)
                      : 'Recording on-chain verification...'}
                  </code>
                  {saveResult?.anchorProofTxHash && (
                    <button
                      onClick={() =>
                        copyToClipboard(saveResult.anchorProofTxHash!, 'anchor')
                      }
                      className="p-2 hover:bg-slate-700/50 rounded-lg transition-colors"
                      title="Copy to clipboard"
                    >
                      {copied === 'anchor' ? (
                        <Check className="w-4 h-4 text-emerald-400" />
                      ) : (
                        <Copy className="w-4 h-4 text-slate-400 hover:text-slate-300" />
                      )}
                    </button>
                  )}
                </div>
                <div className="flex items-center justify-between mt-2">
                  <span className="text-[10px] text-slate-500">
                    <Fingerprint className="w-3 h-3 inline mr-1 text-amber-400/70" />
                    On-chain verification via verify_conversation
                  </span>
                  {saveResult?.anchorProofTxHash && (
                    <a
                      href={`https://suiscan.xyz/${activeNetwork}/tx/${saveResult.anchorProofTxHash}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 text-xs text-indigo-400 hover:text-indigo-300 transition-colors"
                    >
                      View on Sui
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                </div>
              </div>

              {!saveResult?.blobId && (
                <div className="mt-2">
                  <div className="flex justify-between text-[10px] text-slate-500 mb-1">
                    <span>Uploading to Walrus...</span>
                    <span>~30s</span>
                  </div>
                  <div className="h-1.5 bg-slate-700 rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-amber-400 to-emerald-400 rounded-full animate-progress" />
                  </div>
                </div>
              )}

              {saveResult?.blobId &&
                saveResult?.suiTxHash &&
                saveResult?.anchorProofTxHash && (
                  <div className="p-4 bg-gradient-to-r from-emerald-500/10 to-emerald-600/10 rounded-xl border border-emerald-500/20 text-center">
                    <div className="flex items-center justify-center gap-2 mb-1">
                      <CheckCircle className="w-5 h-5 text-emerald-400" />
                      <p className="text-sm font-semibold text-emerald-400">
                        Conversation Fully Secured
                      </p>
                    </div>
                    <p className="text-xs text-slate-400">
                      <span className="text-cyan-400">Walrus stored</span>
                      <span className="mx-1 text-slate-600">•</span>
                      <span className="text-blue-400">
                        Sui transaction confirmed
                      </span>
                      <span className="mx-1 text-slate-600">•</span>
                      <span className="text-amber-400">
                        AnchorProof verified on-chain
                      </span>
                    </p>
                  </div>
                )}

              {suiStatus === 'failed' && (
                <div className="p-4 bg-gradient-to-r from-red-500/10 to-red-600/10 rounded-xl border border-red-500/20 text-center">
                  <p className="text-sm font-semibold text-red-400">
                    Verification Failed
                  </p>
                  <p className="text-xs text-slate-400">
                    Please try saving again or contact support.
                  </p>
                </div>
              )}
            </div>

            <div className="flex flex-col sm:flex-row gap-3 mt-6 pt-6 border-t border-slate-700/50">
              {saveResult?.anchorProofTxHash && (
                <a
                  href={`https://suiscan.xyz/${activeNetwork}/tx/${saveResult.anchorProofTxHash}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white py-2.5 px-4 rounded-lg text-sm font-semibold transition-all shadow-lg shadow-indigo-500/20 flex-1"
                >
                  <ShieldCheck className="w-4 h-4" />
                  Verify AnchorProof
                  <ExternalLink className="w-4 h-4" />
                </a>
              )}
              <button
                onClick={() => setShowModal(false)}
                className="bg-slate-700/50 hover:bg-slate-700 text-slate-300 hover:text-white py-2.5 px-4 rounded-lg text-sm font-semibold transition-all flex-1"
              >
                Close
              </button>
            </div>

            <div className="mt-4 pt-4 border-t border-slate-700/30">
              <div className="flex items-center justify-center gap-3 text-[10px] text-slate-500">
                <span className="flex items-center gap-1">
                  <Database className="w-3 h-3 text-cyan-400" />
                  Walrus
                </span>
                <span className="text-slate-700">•</span>
                <span className="flex items-center gap-1">
                  <LinkIcon className="w-3 h-3 text-blue-400" />
                  Sui
                </span>
                <span className="text-slate-700">•</span>
                <span className="flex items-center gap-1">
                  <Fingerprint className="w-3 h-3 text-amber-400" />
                  AnchorProof
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
