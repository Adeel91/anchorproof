import React, { useState } from 'react';
import { useAnchorProof } from './hooks';
import type { SendMessageResponse, SaveConversationResponse } from '../types';

interface AnchorProofChatProps {
  apiBaseUrl: string;
  apiKey: string;
  tenantId: string;
  sessionId: string;
  customerId?: string;
  agentId?: string;
  cryptoInstance: {
    signMessage: (message: string) => Promise<string>;
    getPublicKey: () => string;
  };
  onMessageSent?: (result: SendMessageResponse) => void;
  onConversationSaved?: (result: SaveConversationResponse) => void;
  className?: string;
}

export const AnchorProofChat: React.FC<AnchorProofChatProps> = ({
  apiBaseUrl,
  apiKey,
  tenantId,
  sessionId,
  customerId,
  agentId,
  cryptoInstance,
  onMessageSent,
  onConversationSaved,
  className = '',
}) => {
  const [conversationId] = useState<string>(
    () => `conv_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  );
  const [messages, setMessages] = useState<
    Array<{ role: string; content: string; id?: string }>
  >([]);
  const [input, setInput] = useState('');
  const [saving, setSaving] = useState(false);

  const { loading, error, sendMessage, saveConversation } = useAnchorProof({
    apiBaseUrl,
    apiKey,
    tenantId,
    sessionId,
  });

  const handleSendMessage = async (role: string, content: string) => {
    try {
      const result = await sendMessage({
        content,
        role,
        conversationId,
        customerId,
        agentId,
        crypto: cryptoInstance,
      });

      setMessages((prev) => [...prev, { role, content, id: result.messageId }]);
      onMessageSent?.(result);

      return result;
    } catch (err) {
      console.error('Failed to send message:', err);
      throw err;
    }
  };

  const handleSaveConversation = async () => {
    if (messages.length === 0) return;

    setSaving(true);
    try {
      const result = await saveConversation(
        conversationId,
        customerId,
        agentId
      );
      onConversationSaved?.(result);
      alert(`Conversation saved! Blob ID: ${result.blobId}`);
    } catch (err) {
      console.error('Failed to save conversation:', err);
      alert('Failed to save conversation');
    } finally {
      setSaving(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const messageContent = input;
    setInput('');
    await handleSendMessage('user', messageContent);
  };

  return (
    <div
      className={`anchorproof-chat ${className}`}
      style={{ maxWidth: '800px', margin: '0 auto' }}
    >
      <div
        className="chat-messages"
        style={{
          height: '400px',
          overflowY: 'auto',
          border: '1px solid #ccc',
          borderRadius: '8px',
          padding: '16px',
          marginBottom: '16px',
        }}
      >
        {messages.map((msg, idx) => (
          <div
            key={msg.id || idx}
            style={{
              marginBottom: '12px',
              textAlign: msg.role === 'user' ? 'right' : 'left',
            }}
          >
            <div
              style={{
                display: 'inline-block',
                padding: '8px 12px',
                borderRadius: '8px',
                backgroundColor: msg.role === 'user' ? '#007bff' : '#e9ecef',
                color: msg.role === 'user' ? 'white' : 'black',
              }}
            >
              <strong>{msg.role}:</strong> {msg.content}
            </div>
          </div>
        ))}
        {loading && <div>Sending...</div>}
        {error && <div style={{ color: 'red' }}>Error: {error}</div>}
      </div>

      <form onSubmit={handleSubmit} style={{ display: 'flex', gap: '8px' }}>
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type your message..."
          style={{
            flex: 1,
            padding: '8px',
            borderRadius: '4px',
            border: '1px solid #ccc',
          }}
          disabled={loading}
        />
        <button
          type="submit"
          disabled={loading || !input.trim()}
          style={{
            padding: '8px 16px',
            backgroundColor: '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
          }}
        >
          Send
        </button>
        <button
          type="button"
          onClick={handleSaveConversation}
          disabled={saving || messages.length === 0}
          style={{
            padding: '8px 16px',
            backgroundColor: '#28a745',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
          }}
        >
          {saving ? 'Saving...' : 'Save to Blockchain'}
        </button>
      </form>
    </div>
  );
};
