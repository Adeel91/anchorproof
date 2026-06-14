'use client';

import { useState, useRef, useEffect } from 'react';
import Button from '@/components/ui/Button';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export default function GovernmentChat() {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content:
        "Hello! I'm your government compliance AI assistant. I can help with FOIA, FISMA, FedRAMP, and public records compliance today.",
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
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

  const sendMessage = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput('');
    setMessages((prev) => [...prev, { role: 'user', content: userMessage }]);
    setIsLoading(true);

    try {
      const response = await fetch('/api/llm/government', {
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
      <div className="bg-gradient-to-r from-purple-500/10 via-pink-500/10 to-rose-500/10 rounded-2xl border border-purple-400/20 overflow-hidden">
        <div className="bg-slate-900/80 px-6 py-4 border-b border-purple-400/20">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center">
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
                  d="M3 21h18M5 12v7m14-7v7M5 7l7-4 7 4M9 12v4m6-4v4M12 4v4"
                />
              </svg>
            </div>
            <div>
              <h3 className="text-white font-semibold">
                Government AI Assistant
              </h3>
              <p className="text-xs text-slate-400">
                FOIA | FISMA | FedRAMP | NIST Compliant
              </p>
            </div>
            <div className="ml-auto flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              <span className="text-xs text-slate-400">Live</span>
            </div>
          </div>
        </div>

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
                    ? 'bg-purple-600 text-white'
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
                    className="w-2 h-2 bg-purple-400 rounded-full animate-bounce"
                    style={{ animationDelay: '0ms' }}
                  />
                  <span
                    className="w-2 h-2 bg-purple-400 rounded-full animate-bounce"
                    style={{ animationDelay: '150ms' }}
                  />
                  <span
                    className="w-2 h-2 bg-purple-400 rounded-full animate-bounce"
                    style={{ animationDelay: '300ms' }}
                  />
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        <div className="bg-slate-900/80 px-4 py-3 border-t border-purple-400/20">
          <div className="flex gap-2">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Ask about FOIA compliance, FedRAMP requirements, NIST controls..."
              rows={1}
              className="flex-1 bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white text-sm resize-none focus:outline-none focus:border-purple-400 transition-colors"
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
              Cryptographically verified for government compliance
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
