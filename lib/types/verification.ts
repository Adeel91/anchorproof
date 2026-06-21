export interface PublicVerificationData {
  verified: boolean;
  data: {
    blobId: string;
    conversationId: string;
    verifiedAt: string | null;
    contentHash: string;
    anchorProofTxHash: string;
    suiTxHash: string;
    messageCount: number;
    customerId?: string;
    agentId?: string;
  } | null;
  timestamp: string;
  network: string;
}
