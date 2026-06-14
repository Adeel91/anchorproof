import type {
  AnchorProofConfig,
  SendMessageParams,
  SendMessageResponse,
  GetMessagesResponse,
  SaveConversationResponse,
  VerifyMessageResponse,
} from './types';

export class AnchorProofClient {
  private config: AnchorProofConfig;
  private sessionId: string | null = null;

  constructor(config: AnchorProofConfig) {
    this.config = config;
  }

  setSessionId(sessionId: string): void {
    this.sessionId = sessionId;
  }

  private getHeaders(): HeadersInit {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      'X-API-Key': this.config.apiKey,
      'X-Tenant-Id': this.config.tenantId,
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

  /**
   * Send a chat message
   * This will store the message temporarily and verify the signature
   */
  async sendMessage(params: SendMessageParams): Promise<SendMessageResponse> {
    const response = await fetch(`${this.config.apiBaseUrl}/api/chat/send`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(params),
    });
    return this.handleResponse<SendMessageResponse>(response);
  }

  /**
   * Get all messages for a conversation
   */
  async getMessages(conversationId: string): Promise<GetMessagesResponse> {
    const response = await fetch(
      `${this.config.apiBaseUrl}/api/chat/messages?conversationId=${encodeURIComponent(conversationId)}`,
      {
        method: 'GET',
        headers: this.getHeaders(),
      }
    );
    return this.handleResponse<GetMessagesResponse>(response);
  }

  /**
   * Save a conversation to Walrus (encrypted and permanent storage)
   * This internally handles SEAL encryption and Walrus storage
   */
  async saveConversation(
    conversationId: string,
    customerId?: string,
    agentId?: string
  ): Promise<SaveConversationResponse> {
    const response = await fetch(`${this.config.apiBaseUrl}/api/chat/save`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({
        conversationId,
        customerId: customerId || 'unknown',
        agentId: agentId || 'unknown',
      }),
    });
    return this.handleResponse<SaveConversationResponse>(response);
  }

  /**
   * Verify a single message's signature
   */
  async verifyMessage(messageId: string): Promise<VerifyMessageResponse> {
    const response = await fetch(`${this.config.apiBaseUrl}/api/chat/verify`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({ messageId }),
    });
    return this.handleResponse<VerifyMessageResponse>(response);
  }
}
