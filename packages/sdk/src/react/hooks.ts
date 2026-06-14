import { useCallback, useState } from 'react';
import { AnchorProofClient } from '../client';
import type {
  SendMessageParams,
  SendMessageResponse,
  GetMessagesResponse,
  SaveConversationResponse,
  VerifyMessageResponse,
} from '../types';

interface CryptoInstance {
  signMessage: (message: string) => Promise<string>;
  getPublicKey: () => string;
}

interface SendMessageParamsWithCrypto extends Omit<
  SendMessageParams,
  'signature' | 'publicKey'
> {
  signature?: string;
  publicKey?: string;
  crypto?: CryptoInstance;
}

export function useAnchorProof(config: {
  apiBaseUrl: string;
  apiKey: string;
  tenantId: string;
  sessionId?: string;
}) {
  const [client] = useState(
    () =>
      new AnchorProofClient({
        apiBaseUrl: config.apiBaseUrl,
        apiKey: config.apiKey,
        tenantId: config.tenantId,
      })
  );

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (config.sessionId) {
    client.setSessionId(config.sessionId);
  }

  const sendMessage = useCallback(
    async (
      params: SendMessageParamsWithCrypto
    ): Promise<SendMessageResponse> => {
      setLoading(true);
      setError(null);

      try {
        let signature = params.signature;
        let publicKey = params.publicKey;

        if (params.crypto && !signature) {
          signature = await params.crypto.signMessage(params.content);
          publicKey = params.crypto.getPublicKey();
        }

        if (!signature || !publicKey) {
          throw new Error(
            'Either signature/publicKey or crypto instance is required'
          );
        }

        const { crypto, ...rest } = params;
        const result = await client.sendMessage({
          ...rest,
          signature,
          publicKey,
        });

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

  const getMessages = useCallback(
    async (conversationId: string): Promise<GetMessagesResponse> => {
      setLoading(true);
      setError(null);
      try {
        return await client.getMessages(conversationId);
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
      conversationId: string,
      customerId?: string,
      agentId?: string
    ): Promise<SaveConversationResponse> => {
      setLoading(true);
      setError(null);
      try {
        return await client.saveConversation(
          conversationId,
          customerId,
          agentId
        );
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [client]
  );

  const verifyMessage = useCallback(
    async (messageId: string): Promise<VerifyMessageResponse> => {
      setLoading(true);
      setError(null);
      try {
        return await client.verifyMessage(messageId);
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
    getMessages,
    saveConversation,
    verifyMessage,
  };
}
