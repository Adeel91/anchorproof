// components/dashboard/conversations/ConversationDetail.tsx
'use client';

import { useState, useEffect } from 'react';
import { X, Loader2, CheckCircle, AlertCircle, Database, ExternalLink } from 'lucide-react';

interface ConversationDetailProps {
  blobId: string;
  onClose: () => void;
}

export function ConversationDetail({ blobId, onClose }: ConversationDetailProps) {
  const [conversation, setConversation] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [verifying, setVerifying] = useState(false);
  const [isFallback, setIsFallback] = useState(false);

  useEffect(() => {
    if (blobId) {
      fetchConversation();
    } else {
      setError('No blob ID provided');
      setLoading(false);
    }
  }, [blobId]);

  const fetchConversation = async () => {
    setLoading(true);
    setError(null);
    setIsFallback(false);
    
    try {
      console.log('Fetching conversation for blobId:', blobId);
      const res = await fetch(`/api/walrus/blob/${blobId}`);
      const data = await res.json();
      
      console.log('API Response:', data);
      
      if (!res.ok) {
        // If we have fallback data, use it
        if (data.fallbackData) {
          console.log('Using fallback data for conversation');
          setConversation({
            ...data.fallbackData,
            blobId: data.blobId || blobId,
          });
          setIsFallback(true);
          setError('Blob data temporarily unavailable. Showing stored metadata.');
          setLoading(false);
          return;
        }
        throw new Error(data.error || 'Failed to fetch conversation');
      }
      
      if (data.success) {
        setConversation(data);
        setIsFallback(false);
        setError(null);
      } else {
        throw new Error(data.error || 'Failed to fetch conversation');
      }
    } catch (error) {
      console.error('Failed to fetch conversation:', error);
      setError(error instanceof Error ? error.message : 'Failed to load conversation');
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
      
      if (res.ok) {
        alert(data.message || 'Verification successful');
        // Refresh conversation data
        await fetchConversation();
      } else {
        alert(data.error || 'Verification failed');
      }
    } catch (error) {
      console.error('Verification failed:', error);
      alert('Verification failed');
    } finally {
      setVerifying(false);
    }
  };

  // Loading state
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

  // Error state
  if (error && !conversation) {
    return (
      <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
        <div className="bg-slate-900 border border-red-500/20 rounded-xl p-8 max-w-md w-full">
          <div className="text-center">
            <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-white mb-2">Error Loading Conversation</h3>
            <p className="text-slate-400 text-sm mb-4">{error}</p>
            <div className="flex gap-3 justify-center">
              <button 
                onClick={fetchConversation}
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

  // No data state
  if (!conversation) {
    return (
      <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
        <div className="bg-slate-900 border border-slate-700 rounded-xl p-8 max-w-md w-full">
          <div className="text-center">
            <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-red-500/10 flex items-center justify-center">
              <X className="w-6 h-6 text-red-400" />
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">Conversation Not Found</h3>
            <p className="text-slate-400 text-sm mb-4">The conversation you're looking for doesn't exist or has been removed.</p>
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

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800">
          <div>
            <h3 className="text-lg font-semibold text-white">Conversation Details</h3>
            <div className="flex items-center gap-3 mt-1">
              <span className="text-xs text-slate-500 font-mono">
                {conversation.blobId?.slice(0, 16)}...
              </span>
              <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-medium ${
                conversation.verifiedAt
                  ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                  : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
              }`}>
                {conversation.verifiedAt ? 'Verified' : 'Pending'}
              </span>
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

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-180px)]">
          {/* Metadata Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="p-3 rounded-lg bg-slate-800/30">
              <p className="text-[10px] text-slate-500 uppercase tracking-wider">Conversation ID</p>
              <p className="text-sm text-white font-mono truncate">
                {conversation.conversationId || 'N/A'}
              </p>
            </div>
            <div className="p-3 rounded-lg bg-slate-800/30">
              <p className="text-[10px] text-slate-500 uppercase tracking-wider">Customer</p>
              <p className="text-sm text-white">
                {conversation.metadata?.customerId || 'N/A'}
              </p>
            </div>
            <div className="p-3 rounded-lg bg-slate-800/30">
              <p className="text-[10px] text-slate-500 uppercase tracking-wider">Agent</p>
              <p className="text-sm text-white">
                {conversation.metadata?.agentId || 'N/A'}
              </p>
            </div>
            <div className="p-3 rounded-lg bg-slate-800/30">
              <p className="text-[10px] text-slate-500 uppercase tracking-wider">Messages</p>
              <p className="text-sm text-white">
                {conversation.messages?.length || 0}
              </p>
            </div>
          </div>

          {/* Transcript */}
          <div className="space-y-3">
            <h4 className="text-sm font-medium text-white mb-3">Transcript</h4>
            {conversation.messages && conversation.messages.length > 0 ? (
              conversation.messages.map((msg: any, idx: number) => (
                <div
                  key={idx}
                  className={`p-4 rounded-xl ${
                    msg.role === 'user'
                      ? 'bg-indigo-500/10 border border-indigo-500/20'
                      : 'bg-slate-800/30 border border-slate-700/30'
                  }`}
                >
                  <div className="flex items-center gap-3 mb-1.5">
                    <span className={`text-xs font-semibold ${
                      msg.role === 'user' ? 'text-indigo-400' : 'text-cyan-400'
                    }`}>
                      {msg.role === 'user' ? 'Customer' : 'AI Assistant'}
                    </span>
                    <span className="text-[10px] text-slate-500">
                      {msg.timestamp ? new Date(msg.timestamp).toLocaleTimeString() : ''}
                    </span>
                  </div>
                  <p className="text-sm text-slate-300 whitespace-pre-wrap leading-relaxed">
                    {msg.content}
                  </p>
                </div>
              ))
            ) : (
              <div className="text-center py-8">
                {isFallback ? (
                  <>
                    <Database className="w-12 h-12 text-amber-400 mx-auto mb-4" />
                    <p className="text-sm text-slate-400">Conversation data is temporarily unavailable</p>
                    <p className="text-xs text-slate-500 mt-1">
                      The blob exists on Walrus but couldn't be retrieved. Showing stored metadata instead.
                    </p>
                  </>
                ) : (
                  <p className="text-slate-500 text-sm">No messages in this conversation</p>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 border-t border-slate-800 flex flex-col sm:flex-row gap-3">
          <button
            onClick={handleVerify}
            disabled={verifying || isFallback}
            className="flex-1 bg-gradient-to-r from-indigo-600 to-cyan-600 hover:from-indigo-500 hover:to-cyan-500 text-white px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {verifying ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Verifying...
              </>
            ) : (
              <>
                <CheckCircle className="w-4 h-4" />
                Verify Conversation
              </>
            )}
          </button>
          
          <a
            href={`https://walruscan.com/testnet/blob/${conversation.blobId}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 text-center bg-slate-800 hover:bg-slate-700 text-white px-4 py-2.5 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2"
          >
            <ExternalLink className="w-4 h-4" />
            View on Walrus
          </a>
          
          <button
            onClick={onClose}
            className="flex-1 text-center bg-slate-700/50 hover:bg-slate-700 text-slate-300 hover:text-white px-4 py-2.5 rounded-lg text-sm font-medium transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}