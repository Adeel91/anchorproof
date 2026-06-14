export interface AnchorProofConfig {
  apiBaseUrl: string;
  apiKey: string;
  tenantId: string;
}

export enum MessageRole {
  USER = 'user',
  ASSISTANT = 'assistant',
  SYSTEM = 'system',
}

export interface SendMessageParams {
  content: string;
  signature: string;
  publicKey: string;
  role: MessageRole | string;
  conversationId?: string;
  customerId?: string;
  agentId?: string;
}

export interface Message {
  id: string;
  role: string;
  content: string;
  signature: string;
  publicKey: string;
  timestamp: string;
}

export interface SendMessageResponse {
  success: boolean;
  messageId: string;
  conversationId: string;
  messageCount: number;
  isFull: boolean;
  verified: boolean;
  customerId: string;
  agentId: string;
}

export interface GetMessagesResponse {
  success: boolean;
  conversationId: string;
  messages: Message[];
  count: number;
}

export interface SaveConversationResponse {
  success: boolean;
  blobId: string;
  conversationId: string;
  messageCount: number;
  walrusExplorerUrl: string;
}

export interface VerifyMessageResponse {
  valid: boolean;
  message: string;
  messageId: string;
  role: string;
  content: string;
  timestamp: string;
}

export interface StoredKeyPair {
  publicKey: string;
  privateKey: string;
  suiAddress: string;
}
