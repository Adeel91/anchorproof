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

export interface SaveConversationParams {
  conversationId: string;
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

export interface SaveConversationResponse {
  success: boolean;
  blobId: string;
  suiTxHash: string;
  conversationId: string;
  messageCount: number;
  contentHash: string;
  walrusExplorerUrl: string;
  onChainRecorded: boolean;
  verificationId: string;
}

export interface StoredKeyPair {
  publicKey: string;
  privateKey: string;
  suiAddress: string;
}
