'use client';

import { useState, useEffect } from 'react';

interface ConversationDetailProps {
  blobId: string;
  onClose: () => void;
}

export function ConversationDetail({ blobId, onClose }: ConversationDetailProps) {
  const [conversation, setConversation] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [verifying, setVerifying] = useState(false);

  useEffect(() => {
    fetchConversation();
  }, [blobId]);

  const fetchConversation = async () => {
    try {
      const res = await fetch(`/api/walrus/blob/${blobId}`);
      const data = await res.json();
      if (data.success) {
        setConversation(data);
      }
    } catch (error) {
      console.error('Failed to fetch conversation:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async () => {
    setVerifying(true);
    try {
      const res = await fetch('/api/walrus/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ blobId }),
      });
      const data = await res.json();
      alert(data.message);
      fetchConversation();
    } catch (error) {
      alert('Verification failed');
    } finally {
      setVerifying(false);
    }
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50">
        <div className="bg-gray-900 border border-gray-700 rounded-xl p-8">
          <div className="flex items-center gap-3">
            <div className="w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
            <span className="text-gray-400">Loading conversation...</span>
          </div>
        </div>
      </div>
    );
  }

  if (!conversation) {
    return (
      <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50">
        <div className="bg-gray-900 border border-gray-700 rounded-xl p-8 max-w-md w-full">
          <div className="text-center">
            <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-red-500/10 flex items-center justify-center">
              <svg className="w-6 h-6 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">Conversation Not Found</h3>
            <p className="text-gray-400 text-sm mb-4">The conversation you're looking for doesn't exist or has been removed.</p>
            <button onClick={onClose} className="text-indigo-400 hover:text-indigo-300 text-sm font-medium">
              Close
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900 border border-gray-700 rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-800">
          <div>
            <h3 className="text-lg font-semibold text-white">Conversation Details</h3>
            <div className="flex items-center gap-3 mt-1">
              <span className="text-xs text-gray-500 font-mono">{conversation.blobId}</span>
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${
                conversation.verified
                  ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                  : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
              }`}>
                {conversation.verified ? 'Verified' : 'Pending'}
              </span>
            </div>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-6 overflow-y-auto max-h-[calc(90vh-180px)]">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="p-3 rounded-lg bg-gray-800/30">
              <p className="text-[10px] text-gray-500 uppercase tracking-wider">Conversation ID</p>
              <p className="text-sm text-white font-mono truncate">{conversation.conversationId}</p>
            </div>
            <div className="p-3 rounded-lg bg-gray-800/30">
              <p className="text-[10px] text-gray-500 uppercase tracking-wider">Customer</p>
              <p className="text-sm text-white">{conversation.metadata?.customerId || 'N/A'}</p>
            </div>
            <div className="p-3 rounded-lg bg-gray-800/30">
              <p className="text-[10px] text-gray-500 uppercase tracking-wider">Agent</p>
              <p className="text-sm text-white">{conversation.metadata?.agentId || 'N/A'}</p>
            </div>
            <div className="p-3 rounded-lg bg-gray-800/30">
              <p className="text-[10px] text-gray-500 uppercase tracking-wider">Messages</p>
              <p className="text-sm text-white">{conversation.messages?.length || 0}</p>
            </div>
          </div>

          <div className="space-y-3">
            <h4 className="text-sm font-medium text-white mb-3">Transcript</h4>
            {conversation.messages?.map((msg: any, idx: number) => (
              <div
                key={idx}
                className={`p-4 rounded-xl ${
                  msg.role === 'user'
                    ? 'bg-indigo-500/10 border border-indigo-500/20'
                    : 'bg-gray-800/30 border border-gray-700/30'
                }`}
              >
                <div className="flex items-center gap-3 mb-1.5">
                  <span className={`text-xs font-semibold ${
                    msg.role === 'user' ? 'text-indigo-400' : 'text-cyan-400'
                  }`}>
                    {msg.role === 'user' ? '👤 Customer' : '🤖 AI Assistant'}
                  </span>
                  <span className="text-[10px] text-gray-500">
                    {new Date(msg.timestamp).toLocaleTimeString()}
                  </span>
                </div>
                <p className="text-sm text-gray-300 whitespace-pre-wrap leading-relaxed">
                  {msg.content}
                </p>
              </div>
            ))}
          </div>
        </div>

        <div className="px-6 py-4 border-t border-gray-800 flex flex-col sm:flex-row gap-3">
          <button
            onClick={handleVerify}
            disabled={verifying}
            className="flex-1 bg-gradient-to-r from-indigo-600 to-cyan-600 hover:from-indigo-500 hover:to-cyan-500 text-white px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {verifying ? 'Verifying...' : '🔍 Verify Conversation'}
          </button>
          <a
            href={`https://walruscan.com/testnet/blob/${conversation.blobId}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 text-center bg-gray-800 hover:bg-gray-700 text-white px-4 py-2.5 rounded-lg text-sm font-medium transition-colors"
          >
            📦 View on Walrus
          </a>
          <button
            onClick={onClose}
            className="flex-1 text-center bg-gray-700/50 hover:bg-gray-700 text-gray-300 hover:text-white px-4 py-2.5 rounded-lg text-sm font-medium transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}