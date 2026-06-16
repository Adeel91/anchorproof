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
  
  return result;
}
