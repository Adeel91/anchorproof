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
  Bot,
  Building2,
  ShieldCheck,
  Fingerprint,
  Award,
  Loader2,
} from 'lucide-react';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

interface SaveResult {
  blobId: string;
  suiTxHash: string;
  contractTxHash?: string | null;
  isVerified?: boolean;
  suiStatus?: 'pending' | 'verified' | 'failed';
  walrusStatus?: 'uploading' | 'completed' | 'failed';
  walrusExplorerUrl?: string;
}

const generateConversationId = () => {
  return `conv_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

export default function BankingChat() {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content:
        "Hello! I'm your banking AI assistant. How can I help you with your financial questions today? All conversations are cryptographically verified and tamper-proof.",
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [conversationId] = useState(generateConversationId);
  const [saveResult, setSaveResult] = useState<SaveResult | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [hasSaved, setHasSaved] = useState(false);
  const [suiStatus, setSuiStatus] = useState<'idle' | 'pending' | 'verified' | 'failed'>('idle');
  const [walrusStatus, setWalrusStatus] = useState<'uploading' | 'completed' | 'failed'>('uploading');
  const [contractTxHash, setContractTxHash] = useState<string | null>(null);
  const pollingRef = useRef<NodeJS.Timeout | null>(null);

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

  useEffect(() => {
    return () => {
      if (pollingRef.current) {
        clearTimeout(pollingRef.current);
      }
    };
  }, []);

  const pollSuiStatus = useCallback(async (blobId: string) => {
    let attempts = 0;
    const maxAttempts = 30;
    
    const checkStatus = async () => {
      try {
        const response = await fetch(`/api/chat/save/status?blobId=${blobId}`);
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`);
        }
        const data = await response.json();

        // Update walrus status
        if (data.walrusStatus) {
          setWalrusStatus(data.walrusStatus);
        }

        // Update saveResult with the real data when available
        setSaveResult((prev) => {
          if (!prev) return prev;
          return {
            ...prev,
            // Update blobId if it's no longer pending
            blobId: data.blobId && !data.blobId.startsWith('pending_') ? data.blobId : prev.blobId,
            // Update suiTxHash with walrusTxHash if available
            suiTxHash: data.walrusTxHash && data.walrusTxHash !== 'pending' ? data.walrusTxHash : prev.suiTxHash,
            // Update contractTxHash when verified
            contractTxHash: data.contractTxHash || prev.contractTxHash,
            isVerified: data.isVerified || prev.isVerified,
            suiStatus: data.isVerified ? 'verified' : prev.suiStatus,
            walrusStatus: data.walrusStatus || prev.walrusStatus,
            walrusExplorerUrl: data.walrusExplorerUrl || prev.walrusExplorerUrl,
          };
        });

        if (data.isVerified) {
          setSuiStatus('verified');
          setContractTxHash(data.contractTxHash);
          return;
        }

        attempts++;
        if (attempts < maxAttempts) {
          pollingRef.current = setTimeout(checkStatus, 2000);
        } else {
          setSuiStatus('failed');
        }
      } catch (error) {
        console.error('Status check failed:', error);
        attempts++;
        if (attempts < maxAttempts) {
          pollingRef.current = setTimeout(checkStatus, 3000);
        } else {
          setSuiStatus('failed');
        }
      }
    };

    pollingRef.current = setTimeout(checkStatus, 1000);
  }, []);

  const saveToBlockchain = useCallback(async () => {
    if (isSaving || messages.length <= 1 || hasSaved) return;

    setIsSaving(true);
    setSuiStatus('pending');
    setWalrusStatus('uploading');
    
    try {
      const result = await saveConversationAction(
        conversationId,
        'banking-demo',
        'anchorproof-banking'
      );

      setSaveResult({
        blobId: result.blobId,
        suiTxHash: result.suiTxHash || result.blobId,
        suiStatus: 'pending',
        walrusStatus: result.walrusStatus || 'uploading',
      });
      
      setHasSaved(true);
      setShowModal(true);
      
      if (result.blobId) {
        pollSuiStatus(result.blobId);
      }
    } catch (error) {
      console.error('Save error:', error);
      setSuiStatus('failed');
      alert(error instanceof Error ? error.message : 'Failed to save conversation');
    } finally {
      setIsSaving(false);
    }
  }, [isSaving, messages.length, hasSaved, conversationId, pollSuiStatus]);

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
        'banking-demo',
        'anchorproof-banking'
      );

      const response = await fetch('/api/llm/banking', {
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
          'banking-demo',
          'anchorproof-banking'
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

  const truncateHash = (hash: string) => {
    if (!hash) return '';
    return `${hash.slice(0, 16)}...${hash.slice(-8)}`;
  };

  return (
    <div className="relative w-full mx-auto px-2 sm:px-0">
      {/* Main Chat Container */}
      <div className="bg-slate-900/60 border border-slate-700/50 rounded-xl sm:rounded-2xl overflow-hidden shadow-2xl shadow-cyan-500/5">
        {/* Chat Header */}
        <div className="bg-gradient-to-r from-slate-900 via-slate-900/95 to-slate-900 px-3 sm:px-6 py-3 sm:py-4 border-b border-slate-700/50">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="w-8 h-8 sm:w-11 sm:h-11 rounded-lg sm:rounded-xl bg-gradient-to-br from-cyan-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-cyan-500/20 flex-shrink-0">
                <Building2 className="w-3.5 h-3.5 sm:w-5 sm:h-5 text-white" />
              </div>
              <div>
                <div className="flex items-center gap-1.5 sm:gap-2">
                  <h3 className="text-xs sm:text-base font-bold text-white">
                    AnchorProof Banking
                  </h3>
                  <span className="px-1.5 sm:px-2 py-0.5 bg-emerald-500/20 text-emerald-400 text-[6px] sm:text-[10px] font-mono font-semibold rounded-full border border-emerald-500/30 whitespace-nowrap">
                    LIVE DEMO
                  </span>
                </div>
                <div className="flex flex-wrap items-center gap-1.5 sm:gap-3 text-[8px] sm:text-[10px] text-slate-400 mt-0.5 sm:mt-0">
                  <span className="flex items-center gap-0.5 sm:gap-1">
                    <Shield className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-cyan-400" />
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
              {hasSaved && suiStatus === 'pending' && (
                <span className="flex items-center gap-0.5 sm:gap-1 text-[8px] sm:text-[10px] text-amber-400">
                  <Loader2 className="w-2.5 h-2.5 sm:w-3 sm:h-3 animate-spin" />
                  <span className="hidden sm:inline">Verifying...</span>
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Trust Badges */}
        <div className="hidden xs:flex bg-slate-800/30 px-3 sm:px-6 py-1.5 sm:py-2 border-b border-slate-700/30 flex-wrap items-center gap-2 sm:gap-4 text-[8px] sm:text-[10px] text-slate-500">
          <span className="flex items-center gap-1 sm:gap-1.5">
            <Award className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-amber-400" />
            <span className="hidden sm:inline">SEC & FINRA Compliant</span>
            <span className="sm:hidden">SEC/FINRA</span>
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

        {/* Messages Container */}
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
                      ? 'bg-gradient-to-br from-indigo-600 to-indigo-700 text-white shadow-lg shadow-indigo-500/20'
                      : 'bg-slate-800/80 text-slate-200 border border-slate-700/50'
                  }`}
                >
                  <div className="flex items-center gap-1.5 sm:gap-2 mb-0.5 sm:mb-1">
                    {message.role === 'assistant' ? (
                      <Bot className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-cyan-400" />
                    ) : (
                      <User className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-indigo-300" />
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
                    className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-cyan-400 rounded-full animate-bounce"
                    style={{ animationDelay: '0ms' }}
                  />
                  <span
                    className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-cyan-400 rounded-full animate-bounce"
                    style={{ animationDelay: '150ms' }}
                  />
                  <span
                    className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-cyan-400 rounded-full animate-bounce"
                    style={{ animationDelay: '300ms' }}
                  />
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="bg-slate-900/80 px-2 sm:px-4 py-2 sm:py-3 border-t border-slate-700/50">
          <div className="flex gap-1.5 sm:gap-2">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Ask about loans, mortgages, accounts..."
              rows={1}
              className="flex-1 bg-slate-800 border border-slate-700 rounded-lg sm:rounded-xl px-2.5 sm:px-4 py-2 sm:py-3 text-white text-xs sm:text-sm resize-none focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400/30 transition-all placeholder:text-slate-500 min-h-[36px] sm:min-h-[42px] max-h-[60px] sm:max-h-[80px]"
              style={{ minHeight: '36px', maxHeight: '60px' }}
              disabled={isLoading}
            />
            <Button
              variant="primary"
              onClick={sendMessage}
              disabled={!input.trim() || isLoading}
              className="px-3 sm:px-6 h-[36px] sm:h-[46px] flex-shrink-0 shadow-lg shadow-indigo-500/20 text-xs sm:text-sm"
            >
              <Send className="w-3 h-3 sm:w-4 sm:h-4" />
              <span className="hidden xs:inline ml-1.5 sm:ml-2">Send</span>
            </Button>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-1.5 sm:gap-3 mt-1.5 sm:mt-2 text-[7px] sm:text-[10px] text-slate-500">
            <span className="flex items-center gap-0.5 sm:gap-1">
              <Lock className="w-2 h-2 sm:w-3 sm:h-3 text-cyan-400" />
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

      {/* Save Button */}
      {!hasSaved && messages.length > 1 && (
        <div className="mt-3 sm:mt-4 p-2.5 sm:p-4 bg-gradient-to-r from-indigo-500/10 via-cyan-500/10 to-indigo-500/10 rounded-lg sm:rounded-xl border border-indigo-500/20 backdrop-blur-sm">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-4">
            <div className="flex-1 w-full sm:w-auto">
              <div className="flex items-center gap-1.5 sm:gap-2 mb-0.5 sm:mb-1">
                <Shield className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-cyan-400" />
                <span className="text-[8px] sm:text-[10px] font-semibold text-cyan-400 uppercase tracking-wider">
                  Cryptographic Verification
                </span>
              </div>
              <p className="text-[10px] sm:text-sm text-slate-300 leading-relaxed">
                Save as immutable record on Walrus and Sui blockchain.
                <span className="text-cyan-400 font-medium ml-1 hidden xs:inline">
                  Tamper-proof evidence for compliance.
                </span>
              </p>
            </div>
            <Button
              variant="primary"
              onClick={saveToBlockchain}
              disabled={isSaving}
              className="px-4 sm:px-7 py-1.5 sm:py-3 text-[10px] sm:text-sm font-semibold w-full sm:w-auto shadow-lg shadow-indigo-500/20"
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

      {/* Success Modal */}
      {showModal && saveResult && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-50 p-3 sm:p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-xl sm:rounded-2xl p-4 sm:p-7 max-w-md w-full shadow-2xl shadow-cyan-500/10 max-h-[95vh] sm:max-h-[90vh] overflow-y-auto animate-in zoom-in-95 duration-300 mx-2 sm:mx-0">
            <div className="text-center mb-4 sm:mb-5">
              <div className={`w-12 h-12 sm:w-20 sm:h-20 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4 border ${
                suiStatus === 'verified' 
                  ? 'bg-emerald-500/20 border-emerald-500/30' 
                  : suiStatus === 'pending'
                  ? 'bg-amber-500/20 border-amber-500/30'
                  : 'bg-red-500/20 border-red-500/30'
              }`}>
                {suiStatus === 'verified' && (
                  <CheckCircle className="w-6 h-6 sm:w-10 sm:h-10 text-emerald-500" />
                )}
                {suiStatus === 'pending' && (
                  <Loader2 className="w-6 h-6 sm:w-10 sm:h-10 text-amber-400 animate-spin" />
                )}
                {suiStatus === 'failed' && (
                  <span className="text-3xl sm:text-5xl text-red-500">❌</span>
                )}
              </div>
              <h3 className="text-base sm:text-2xl font-bold text-white mb-0.5 sm:mb-1">
                {suiStatus === 'verified' && 'Conversation Secured ✅'}
                {suiStatus === 'pending' && 'Verifying on SUI...'}
                {suiStatus === 'failed' && 'Verification Failed'}
              </h3>
              <p className="text-[10px] sm:text-sm text-slate-400">
                {suiStatus === 'verified' && 'Immutable and cryptographically verified on-chain.'}
                {suiStatus === 'pending' && 'Your conversation is being verified on the Sui blockchain. This may take up to 30 seconds.'}
                {suiStatus === 'failed' && 'There was an issue verifying on SUI. Please try again.'}
              </p>
            </div>

            <div className="space-y-2.5 sm:space-y-3">
              {/* ===== BOX 1: Walrus Blob ID ===== */}
              <div className="bg-slate-800/50 rounded-lg sm:rounded-xl p-2.5 sm:p-3 border border-slate-700/50 hover:border-cyan-400/20 transition-all">
                <div className="flex items-center gap-1.5 sm:gap-2 mb-1 sm:mb-1.5">
                  <Database className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-cyan-400" />
                  <span className="text-[8px] sm:text-xs text-slate-500 font-mono font-semibold uppercase tracking-wider">
                    Walrus Blob ID
                  </span>
                  <span className="ml-auto text-[8px]">
                    {walrusStatus === 'completed' ? (
                      <span className="text-emerald-400">✅ Stored</span>
                    ) : walrusStatus === 'uploading' ? (
                      <span className="text-amber-400 flex items-center gap-1">
                        <Loader2 className="w-3 h-3 animate-spin" />
                        Uploading...
                      </span>
                    ) : (
                      <span className="text-red-400">❌ Failed</span>
                    )}
                  </span>
                </div>
                <code className="text-cyan-400 text-[8px] sm:text-xs break-all font-mono bg-slate-900/50 px-1.5 sm:px-2 py-0.5 sm:py-1 rounded block">
                  {walrusStatus === 'completed' && saveResult.blobId && !saveResult.blobId.startsWith('pending_')
                    ? truncateHash(saveResult.blobId)
                    : walrusStatus === 'uploading'
                    ? 'Waiting for upload...'
                    : 'Upload failed'}
                </code>
                {walrusStatus === 'completed' && saveResult.blobId && !saveResult.blobId.startsWith('pending_') && (
                  <a
                    href={`https://walruscan.com/${activeNetwork}/blob/${saveResult.blobId}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[7px] sm:text-[10px] text-indigo-400 hover:text-indigo-300 mt-1 inline-block transition-colors"
                  >
                    View on Walrus →
                  </a>
                )}
              </div>

              {/* ===== BOX 2: Walrus Tx Hash ===== */}
              <div className="bg-slate-800/50 rounded-lg sm:rounded-xl p-2.5 sm:p-3 border border-slate-700/50 hover:border-blue-400/20 transition-all">
                <div className="flex items-center gap-1.5 sm:gap-2 mb-1 sm:mb-1.5">
                  <LinkIcon className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-blue-400" />
                  <span className="text-[8px] sm:text-xs text-slate-500 font-mono font-semibold uppercase tracking-wider">
                    Walrus Tx Hash
                  </span>
                  <span className="ml-auto text-[8px]">
                    {walrusStatus === 'completed' && saveResult.suiTxHash && saveResult.suiTxHash !== 'pending' ? (
                      <span className="text-emerald-400">✅ Confirmed</span>
                    ) : walrusStatus === 'uploading' ? (
                      <span className="text-amber-400">⏳ Pending</span>
                    ) : (
                      <span className="text-red-400">❌ Failed</span>
                    )}
                  </span>
                </div>
                <code className="text-blue-400 text-[8px] sm:text-xs break-all font-mono bg-slate-900/50 px-1.5 sm:px-2 py-0.5 sm:py-1 rounded block">
                  {walrusStatus === 'completed' && saveResult.suiTxHash && saveResult.suiTxHash !== 'pending'
                    ? truncateHash(saveResult.suiTxHash)
                    : walrusStatus === 'uploading'
                    ? 'Waiting for confirmation...'
                    : 'Upload failed'}
                </code>
              </div>

              {/* ===== BOX 3: Contract SUI Tx Hash ===== */}
              <div className={`bg-slate-800/50 rounded-lg sm:rounded-xl p-2.5 sm:p-3 border ${
                suiStatus === 'verified' 
                  ? 'border-emerald-500/30 hover:border-emerald-500/50' 
                  : suiStatus === 'pending'
                  ? 'border-amber-500/30'
                  : 'border-red-500/30'
              } transition-all`}>
                <div className="flex items-center gap-1.5 sm:gap-2 mb-1 sm:mb-1.5">
                  <Shield className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-purple-400" />
                  <span className="text-[8px] sm:text-xs text-slate-500 font-mono font-semibold uppercase tracking-wider">
                    Contract SUI Tx Hash
                  </span>
                  <span className="ml-auto text-[8px]">
                    {suiStatus === 'verified' && (
                      <span className="text-emerald-400">✅ Verified</span>
                    )}
                    {suiStatus === 'pending' && (
                      <span className="text-amber-400 flex items-center gap-1">
                        <Loader2 className="w-3 h-3 animate-spin" />
                        Processing...
                      </span>
                    )}
                    {suiStatus === 'failed' && (
                      <span className="text-red-400">❌ Failed</span>
                    )}
                  </span>
                </div>
                <code className={`text-[8px] sm:text-xs break-all font-mono bg-slate-900/50 px-1.5 sm:px-2 py-0.5 sm:py-1 rounded block ${
                  suiStatus === 'verified' ? 'text-emerald-400' : 
                  suiStatus === 'pending' ? 'text-amber-400' : 'text-red-400'
                }`}>
                  {contractTxHash ? truncateHash(contractTxHash) : 'Waiting for confirmation...'}
                </code>
                {contractTxHash && (
                  <a
                    href={`https://suiscan.xyz/${activeNetwork}/object/${contractTxHash}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[7px] sm:text-[10px] text-indigo-400 hover:text-indigo-300 mt-1 inline-block transition-colors"
                  >
                    View on Sui →
                  </a>
                )}
              </div>

              {/* Progress Bar */}
              {suiStatus === 'pending' && (
                <div className="mt-2">
                  <div className="flex justify-between text-[8px] sm:text-[10px] text-slate-500 mb-1">
                    <span>Verifying on SUI blockchain...</span>
                    <span>~30s</span>
                  </div>
                  <div className="h-1.5 bg-slate-700 rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-amber-400 to-emerald-400 rounded-full animate-progress" />
                  </div>
                </div>
              )}

              {/* All Verified */}
              {suiStatus === 'verified' && (
                <div className="mt-2 p-3 bg-emerald-500/10 rounded-xl border border-emerald-500/20 text-center">
                  <CheckCircle className="w-5 h-5 sm:w-6 sm:h-6 text-emerald-400 mx-auto mb-1" />
                  <p className="text-xs sm:text-sm text-emerald-400 font-semibold">
                    Conversation Fully Verified ✅
                  </p>
                  <p className="text-[8px] sm:text-xs text-slate-500">
                    Walrus stored • Contract verified on SUI
                  </p>
                </div>
              )}

              {/* Failed State */}
              {suiStatus === 'failed' && (
                <div className="mt-2 p-3 bg-red-500/10 rounded-xl border border-red-500/20 text-center">
                  <p className="text-xs sm:text-sm text-red-400 font-semibold">
                    Verification Failed ❌
                  </p>
                  <p className="text-[8px] sm:text-xs text-slate-500">
                    Please try saving again or contact support.
                  </p>
                </div>
              )}
            </div>

            <div className="flex flex-col sm:flex-row gap-1.5 sm:gap-3 mt-4 sm:mt-5">
              {suiStatus === 'verified' && (
                <a
                  href={`https://suiscan.xyz/${activeNetwork}/object/${contractTxHash || saveResult.suiTxHash}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-center bg-indigo-600 hover:bg-indigo-500 text-white py-2 rounded-lg sm:rounded-xl text-[10px] sm:text-sm font-semibold transition-all shadow-lg shadow-indigo-500/20 px-3 sm:px-4"
                >
                  Verify on Sui
                </a>
              )}
              <button
                onClick={() => setShowModal(false)}
                className="text-center bg-slate-700/50 hover:bg-slate-700 text-slate-300 hover:text-white py-2 rounded-lg sm:rounded-xl text-[10px] sm:text-sm font-semibold transition-all px-3 sm:px-4 flex-1"
              >
                Close
              </button>
            </div>

            <div className="mt-3 sm:mt-4 pt-2.5 sm:pt-3 border-t border-slate-700/50">
              <p className="text-[6px] sm:text-[10px] text-slate-500 text-center font-mono flex items-center justify-center gap-1 sm:gap-2">
                <Shield className="w-2 h-2 sm:w-3 sm:h-3" />
                <span className="hidden xs:inline">
                  Cryptographically verified • Tamper-proof • On-chain
                </span>
                <span className="xs:hidden">
                  Verified • Tamper-proof • On-chain
                </span>
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}