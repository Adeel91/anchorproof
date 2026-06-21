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
  try {
    const result = await anchorProofClient.saveConversation({
      conversationId,
      customerId: customerId || 'banking-demo',
      agentId: agentId || 'anchorproof-banking',
    });

    return {
      blobId: result.blobId,
      suiTxHash: result.suiTxHash,
      conversationId: result.conversationId,
      messageCount: result.messageCount || 0,
      contentHash: result.contentHash,
      contentFingerprint: result.contentFingerprint,
      anchorProofTxHash: result.anchorProofTxHash,
      walrusExplorerUrl: result.walrusExplorerUrl,
      onChainRecorded: result.onChainRecorded || false,
      verificationId: result.verificationId,
      suiStatus: 'pending' as const,
      walrusStatus: 'uploading' as const,
    };
  } catch (error) {
    console.error('Save conversation error:', error);

    if (error instanceof Error) {
      if (
        error.message.includes('Walrus storage failed') ||
        error.message.includes('Too many failures') ||
        error.message.includes('upload failed')
      ) {
        throw new Error(
          'Walrus storage is currently unavailable. Please try again in a few moments.'
        );
      }
      throw error;
    }
    throw new Error('Failed to save conversation');
  }
}
