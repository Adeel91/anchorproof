import { useCallback, useState } from 'react';
import { AnchorProofClient } from '../client';
import type {
  SendMessageResponse,
  SaveConversationResponse,
  SaveConversationParams,
} from '../types';

interface AnchorProofCredentials {
  apiKey: string;
  publicKey: string;
  privateKey: string;
}

interface UseAnchorProofOptions {
  credentials: AnchorProofCredentials;
  sessionId?: string;
}

export function useAnchorProof(options: UseAnchorProofOptions) {
  const [client] = useState(() => new AnchorProofClient(options.credentials));

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (options.sessionId) {
    client.setSessionId(options.sessionId);
  }

  const sendMessage = useCallback(
    async (params: {
      content: string;
      role: string;
      conversationId?: string;
      customerId?: string;
      agentId?: string;
    }): Promise<SendMessageResponse> => {
      setLoading(true);
      setError(null);

      try {
        const result = await client.sendMessage(params);
        return result;
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [client]
  );

  const saveConversation = useCallback(
    async (
      params: SaveConversationParams
    ): Promise<SaveConversationResponse> => {
      setLoading(true);
      setError(null);
      try {
        return await client.saveConversation(params);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [client]
  );

  return {
    client,
    loading,
    error,
    sendMessage,
    saveConversation,
  };
}
