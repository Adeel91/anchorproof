'use server';

import { anchorProofClient } from '@/lib/anchorproof/client';

export async function sendMessageAction(
  content: string,
  role: string,
  conversationId: string,
  customerId?: string,
  agentId?: string
) {
  try {
    console.log('📤 [sendMessageAction] Starting...', {
      conversationId,
      role,
      contentLength: content?.length,
    });

    // ⚡ Check if client is configured
    if (!anchorProofClient) {
      console.error(
        '❌ [sendMessageAction] anchorProofClient is not configured'
      );
      throw new Error('Client not configured. Please login again.');
    }

    const result = await anchorProofClient.sendMessage({
      content,
      role,
      conversationId,
      customerId,
      agentId,
    });

    console.log('✅ [sendMessageAction] Message sent successfully', {
      conversationId,
    });
    return result;
  } catch (error) {
    console.error('❌ [sendMessageAction] Error:', error);

    // ⚡ Detailed error logging
    if (error instanceof Error) {
      console.error('Error name:', error.name);
      console.error('Error message:', error.message);
      console.error('Error stack:', error.stack);
    }

    // ⚡ Return a user-friendly error
    const errorMessage =
      error instanceof Error ? error.message : 'Unknown error';

    if (
      errorMessage.includes('API key') ||
      errorMessage.includes('Unauthorized')
    ) {
      throw new Error('Authentication failed. Please refresh and try again.');
    }

    if (errorMessage.includes('timeout') || errorMessage.includes('fetch')) {
      throw new Error('Request timed out. Please check your connection.');
    }

    throw new Error(errorMessage || 'Failed to send message');
  }
}

export async function saveConversationAction(
  conversationId: string,
  customerId?: string,
  agentId?: string
) {
  try {
    console.log('📤 [saveConversationAction] Starting...', { conversationId });

    // ⚡ Check if client is configured
    if (!anchorProofClient) {
      console.error(
        '❌ [saveConversationAction] anchorProofClient is not configured'
      );
      throw new Error('Client not configured. Please login again.');
    }

    const result = await anchorProofClient.saveConversation({
      conversationId,
      customerId: customerId || 'banking-demo',
      agentId: agentId || 'anchorproof-banking',
    });

    console.log('✅ [saveConversationAction] Save successful', {
      conversationId,
      blobId: result.blobId,
      verificationId: result.verificationId,
    });

    return {
      blobId: result.blobId,
      suiTxHash: result.suiTxHash || result.blobId,
      conversationId: result.conversationId,
      messageCount: result.messageCount || 0,
      contentHash: result.contentHash,
      walrusExplorerUrl: result.walrusExplorerUrl,
      onChainRecorded: result.onChainRecorded || false,
      verificationId: result.verificationId,
      suiStatus: 'pending' as const,
      walrusStatus: 'uploading' as const,
    };
  } catch (error) {
    console.error('❌ [saveConversationAction] Error:', error);

    // ⚡ Detailed error logging
    if (error instanceof Error) {
      console.error('Error name:', error.name);
      console.error('Error message:', error.message);
      console.error('Error stack:', error.stack);
    }

    // ⚡ User-friendly error messages
    const errorMessage =
      error instanceof Error ? error.message : 'Unknown error';

    if (
      errorMessage.includes('API key') ||
      errorMessage.includes('Unauthorized')
    ) {
      throw new Error('Authentication failed. Please refresh and try again.');
    }

    if (
      errorMessage.includes('Walrus storage failed') ||
      errorMessage.includes('Too many failures') ||
      errorMessage.includes('upload failed')
    ) {
      throw new Error(
        'Walrus storage is currently unavailable. Please try again in a few moments.'
      );
    }

    if (errorMessage.includes('timeout') || errorMessage.includes('fetch')) {
      throw new Error('Request timed out. Please check your connection.');
    }

    throw new Error(errorMessage || 'Failed to save conversation');
  }
}
