'use server';

import { anchorProofClient } from '@/lib/anchorproof/client';

export async function sendMessageAction(
  content: string,
  role: string,
  conversationId: string,
  customerId?: string,
  agentId?: string
) {
  return await anchorProofClient.sendMessage({
    content,
    role,
    conversationId,
    customerId,
    agentId,
  });
}

export async function saveConversationAction(
  conversationId: string,
  customerId?: string,
  agentId?: string
) {
  const result = await anchorProofClient.saveConversation({
    conversationId,
    customerId,
    agentId,
  });

  return {
    blobId: result.blobId,
    suiTxHash: result.suiTxHash,
    conversationId: result.conversationId,
    messageCount: result.messageCount,
    contentHash: result.contentHash,
    walrusExplorerUrl: result.walrusExplorerUrl,
    onChainRecorded: result.onChainRecorded,
    verificationId: result.verificationId,
    suiStatus: 'pending' as const,
    walrusStatus: result.walrusStatus || 'uploading',
  };
}
