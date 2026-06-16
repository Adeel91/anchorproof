'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import Button from '@/components/ui/Button';
import { sendMessageAction, saveConversationAction } from '@/app/actions/chat';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

const generateConversationId = () => {
  return `conv_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

export default function BankingChat() {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content:
        "Hello! I'm your banking AI assistant. How can I help you with your financial questions today? All conversations are cryptographically verified and immutable.",
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [conversationId] = useState(generateConversationId);
  const [savedBlobId, setSavedBlobId] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [hasSaved, setHasSaved] = useState(false);

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

  const saveToBlockchain = useCallback(async () => {
    if (isSaving || messages.length <= 1 || hasSaved) return;

    setIsSaving(true);
    try {
      const result = await saveConversationAction(
        conversationId,
        'banking-demo',
        'anchorproof-banking'
      );

      setSavedBlobId(result.blobId);
      setHasSaved(true);
      setShowModal(true);
    } catch (error) {
      console.error('Save error:', error);
      alert('Failed to save conversation');
    } finally {
      setIsSaving(false);
    }
  }, [isSaving, messages.length, hasSaved, conversationId]);

  useEffect(() => {
    const handleBeforeUnload = () => {
      if (messages.length > 0 && !hasSaved) {
        saveConversationAction(
          conversationId,
          'banking-demo',
          'anchorproof-banking'
        );
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [messages, conversationId, hasSaved]);

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

  return (
    <div className="relative">
      <div className="bg-gradient-to-r from-cyan-500/10 via-indigo-500/10 to-purple-500/10 rounded-2xl border border-cyan-400/20 overflow-hidden">
        {/* Chat Header */}
        <div className="bg-slate-900/80 px-6 py-4 border-b border-cyan-400/20">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-r from-cyan-500 to-indigo-500 flex items-center justify-center">
                <svg
                  className="w-5 h-5 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M3 10h18M6 10v8h12v-8M4 4h16v2H4V4zM8 14h8M12 10v4"
                  />
                </svg>
              </div>
              <div>
                <h3 className="text-white font-semibold">
                  Banking AI Assistant
                </h3>
                <p className="text-xs text-slate-400">
                  Secured by AnchorProof | Immutable & Verifiable
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              <span className="text-xs text-slate-400">Live</span>
            </div>
          </div>
        </div>

        {/* Messages Container */}
        <div
          ref={chatContainerRef}
          className="h-[400px] overflow-y-auto p-6 space-y-4"
          style={{ scrollBehavior: 'smooth' }}
        >
          {messages.map((message, idx) => (
            <div
              key={idx}
              className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[80%] rounded-2xl px-4 py-2 ${
                  message.role === 'user'
                    ? 'bg-indigo-600 text-white'
                    : 'bg-slate-800/80 text-slate-200 border border-slate-700'
                }`}
              >
                <p className="text-sm whitespace-pre-wrap">{message.content}</p>
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-slate-800/80 rounded-2xl px-4 py-2">
                <div className="flex gap-1">
                  <span
                    className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce"
                    style={{ animationDelay: '0ms' }}
                  />
                  <span
                    className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce"
                    style={{ animationDelay: '150ms' }}
                  />
                  <span
                    className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce"
                    style={{ animationDelay: '300ms' }}
                  />
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="bg-slate-900/80 px-4 py-3 border-t border-cyan-400/20">
          <div className="flex gap-2">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Ask about loans, mortgages, accounts, or banking services..."
              rows={1}
              className="flex-1 bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white text-sm resize-none focus:outline-none focus:border-cyan-400 transition-colors"
              style={{ minHeight: '44px', maxHeight: '100px' }}
              disabled={isLoading}
            />
            <Button
              variant="primary"
              onClick={sendMessage}
              disabled={!input.trim() || isLoading}
              className="px-6"
            >
              Send
            </Button>
          </div>
          <div className="flex items-center justify-center gap-2 mt-2">
            <svg
              className="w-3 h-3 text-slate-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
              />
            </svg>
            <p className="text-xs text-slate-500">
              Cryptographically verified on Sui blockchain
            </p>
          </div>
        </div>
      </div>

      {/* Save Button - Clean, professional, integrated */}
      {!hasSaved && messages.length > 1 && (
        <div className="mt-4 p-4 bg-gradient-to-r from-indigo-500/10 via-cyan-500/10 to-indigo-500/10 rounded-xl border border-indigo-500/20 animate-slide-up">
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <svg
                  className="w-4 h-4 text-indigo-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                  />
                </svg>
                <span className="text-xs font-semibold text-indigo-400 uppercase tracking-wider">
                  Legal Protection
                </span>
              </div>
              <p className="text-sm text-slate-300">
                Save this conversation as an immutable record.{' '}
                <span className="text-indigo-400">Court-admissible proof</span>{' '}
                for compliance and dispute resolution.
              </p>
            </div>
            <Button
              variant="primary"
              onClick={saveToBlockchain}
              disabled={isSaving}
              className="px-6 py-2.5 whitespace-nowrap"
            >
              {isSaving ? (
                <>
                  <svg
                    className="animate-spin w-4 h-4 mr-2"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Saving...
                </>
              ) : (
                <>
                  <svg
                    className="w-4 h-4 mr-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                    />
                  </svg>
                  Get Verified Record
                </>
              )}
            </Button>
          </div>
        </div>
      )}

      {/* Success Modal */}
      {showModal && savedBlobId && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
          <div className="bg-slate-900 border border-slate-700 rounded-xl p-6 max-w-md w-full mx-4 animate-slide-up">
            <div className="text-center mb-4">
              <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg
                  className="w-8 h-8 text-green-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-white mb-2">
                Conversation Saved
              </h3>
              <p className="text-slate-300 text-sm">
                Your conversation has been securely stored and verified.
              </p>
            </div>

            <div className="bg-slate-800 p-3 rounded-lg mb-4">
              <p className="text-xs text-slate-400 mb-1">Verification ID:</p>
              <code className="text-cyan-400 text-xs break-all">
                {savedBlobId}
              </code>
            </div>

            <div className="flex gap-3">
              <a
                href={`https://explorer.walrus.site/blob/${savedBlobId}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 text-center bg-indigo-600 hover:bg-indigo-500 text-white py-2 rounded-lg text-sm transition-colors"
              >
                View Record
              </a>
              <Button
                onClick={() => setShowModal(false)}
                variant="outline"
                className="flex-1"
              >
                Close
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
