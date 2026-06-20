import type {
  SendMessageParams,
  SendMessageResponse,
  SaveConversationResponse,
  SaveConversationParams,
} from './types';
import { AnchorProofCrypto } from './crypto';
import { fromBase64, toBase64 } from '@mysten/bcs';

interface SDKConfig {
  apiBaseUrl: string;
}

interface ClientCredentials {
  apiKey: string;
  publicKey: string;
  privateKey: string;
}

export class AnchorProofClient {
  private static globalConfig: SDKConfig | null = null;
  private credentials: ClientCredentials;
  private sessionId: string | null = null;

  static configure(config: SDKConfig): void {
    AnchorProofClient.globalConfig = config;
  }

  constructor(credentials: ClientCredentials) {
    if (!AnchorProofClient.globalConfig) {
      throw new Error(
        'AnchorProofClient must be configured. Call AnchorProofClient.configure() first.'
      );
    }
    this.credentials = credentials;
  }

  setSessionId(sessionId: string): void {
    this.sessionId = sessionId;
  }

  private getCrypto(): AnchorProofCrypto {
    return AnchorProofCrypto.fromPrivateKey(this.credentials.privateKey);
  }

  private getHeaders(): HeadersInit {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      'X-API-Key': this.credentials.apiKey,
      'X-Public-Key': this.credentials.publicKey,
    };

    if (this.sessionId) {
      headers['X-Session-Id'] = this.sessionId;
    }

    return headers;
  }

  private async handleResponse<T>(response: Response): Promise<T> {
    if (!response.ok) {
      const error = await response
        .json()
        .catch(() => ({ error: 'Unknown error' }));
      throw new Error(
        error.error || `HTTP ${response.status}: ${response.statusText}`
      );
    }
    return response.json();
  }

  async sendMessage(
    params: Omit<SendMessageParams, 'signature' | 'publicKey'>
  ): Promise<SendMessageResponse> {
    const crypto = this.getCrypto();
    const rawSignature = await crypto.signMessage(params.content);
    const publicKey = crypto.getPublicKey();

    const signatureBytes = fromBase64(rawSignature);

    const signatureBase64 = toBase64(signatureBytes);

    const response = await fetch(
      `${AnchorProofClient.globalConfig!.apiBaseUrl}/api/chat/send`,
      {
        method: 'POST',
        headers: this.getHeaders(),
        credentials: 'include',
        body: JSON.stringify({
          ...params,
          signature: signatureBase64,
          publicKey,
        }),
      }
    );
    return this.handleResponse<SendMessageResponse>(response);
  }

  // In the saveConversation method
async saveConversation(
  params: SaveConversationParams
): Promise<SaveConversationResponse> {
  const crypto = this.getCrypto();

  const messageToSign = JSON.stringify({
    conversationId: params.conversationId,
    customerId: params.customerId || 'unknown',
    agentId: params.agentId || 'unknown',
  });

  const rawSignature = await crypto.signMessage(messageToSign);
  const signatureBytes = fromBase64(rawSignature);
  const signatureBase64 = toBase64(signatureBytes);
  const publicKey = crypto.getPublicKey();

  const response = await fetch(
    `${AnchorProofClient.globalConfig!.apiBaseUrl}/api/chat/save`,
    {
      method: 'POST',
      headers: this.getHeaders(),
      credentials: 'include',
      body: JSON.stringify({
        ...params,
        signature: signatureBase64,
        publicKey,
      }),
    }
  );

  const result = await this.handleResponse<any>(response);
  
  return {
    success: result.success,
    blobId: result.blobId,
    suiTxHash: result.suiTxHash || result.blobId,
    conversationId: result.conversationId,
    messageCount: result.messageCount || 0,
    contentHash: result.contentHash,
    walrusExplorerUrl: result.walrusExplorerUrl || '',
    onChainRecorded: result.onChainRecorded || false,
    verificationId: result.verificationId,
    suiStatus: result.suiStatus || 'pending',
    walrusStatus: result.walrusStatus || 'uploading',
  };
}
}
