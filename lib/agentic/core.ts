import { prisma } from '@/lib/prisma';
import crypto from 'crypto';
import { storeBlobOnWalrus } from '@/lib/walrus/server';
import { sealClient, SEAL_SYSTEM_PACKAGE_ID } from '@/lib/seal/client';
import { Ed25519Keypair } from '@mysten/sui/keypairs/ed25519';
import { fromBase64 } from '@mysten/bcs';
import { recordOnChain } from '@/lib/sui/contract';
import { createAuditLogAsync } from '@/lib/audit';
import { Prisma } from '@prisma/client';

const MASTER_KEY_HEX =
  process.env.MASTER_KEY || crypto.randomBytes(32).toString('hex');
const MASTER_KEY = Buffer.from(MASTER_KEY_HEX, 'hex');

function decryptPrivateKey(encryptedJson: string): string {
  try {
    const { iv, encrypted, authTag } = JSON.parse(encryptedJson);
    const decipher = crypto.createDecipheriv(
      'aes-256-gcm',
      MASTER_KEY,
      Buffer.from(iv, 'hex')
    );
    decipher.setAuthTag(Buffer.from(authTag, 'hex'));
    const decrypted = Buffer.concat([
      decipher.update(Buffer.from(encrypted, 'hex')),
      decipher.final(),
    ]);
    return decrypted.toString('utf8');
  } catch (error) {
    console.error('Decryption error:', error);
    return encryptedJson;
  }
}

export interface AgenticDecision {
  shouldVerify: boolean;
  shouldDelete: boolean;
  reason: string;
  confidence: number;
  riskScore: number;
  complianceScore: number;
  categories: string[];
}

export async function analyzeConversation(
  messages: { role: string; content: string }[]
): Promise<AgenticDecision> {
  const response = await fetch(
    'https://api.groq.com/openai/v1/chat/completions',
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        messages: [
          {
            role: 'system',
            content: `You are an AI compliance agent analyzing conversations for verification.

Analyze this conversation and decide:
1. Should this conversation be verified on-chain? (shouldVerify)
2. Should this conversation be deleted (no compliance value)? (shouldDelete)
3. Provide reasoning and scores.

Consider:
- Sensitive information (PII, financial, health)
- Business decisions (loan offers, refunds, contracts)
- Compliance requirements (regulatory, legal)
- Customer intent (serious inquiry vs casual chat)
- Value for future audit

Return ONLY valid JSON:
{
  "shouldVerify": true/false,
  "shouldDelete": true/false,
  "reason": "Why you made this decision",
  "confidence": 0-100,
  "riskScore": 0-100,
  "complianceScore": 0-100,
  "categories": ["financial", "compliance", "sensitive", "business", "casual"]
}`,
          },
          {
            role: 'user',
            content: JSON.stringify(messages),
          },
        ],
        temperature: 0.3,
        response_format: { type: 'json_object' },
      }),
    }
  );

  const data = await response.json();
  const result = JSON.parse(data.choices[0].message.content);

  return {
    shouldVerify: result.shouldVerify || false,
    shouldDelete: result.shouldDelete || false,
    reason: result.reason || 'No specific reason provided',
    confidence: result.confidence || 50,
    riskScore: result.riskScore || 0,
    complianceScore: result.complianceScore || 0,
    categories: result.categories || ['general'],
  };
}

export async function verifyConversation(params: {
  tenantId: string;
  conversationId: string;
  customerId: string;
  agentId: string;
  signature: string;
  messages: {
    role: string;
    content: string;
    signature?: string;
    publicKey?: string;
  }[];
  autoVerified?: boolean;
  decision?: AgenticDecision;
}) {
  const {
    tenantId,
    conversationId,
    customerId,
    agentId,
    signature,
    messages,
    autoVerified = true,
    decision,
  } = params;

  if (messages.length === 0) {
    throw new Error('No messages found');
  }

  const conversationData = {
    conversationId,
    messages: messages.map((m) => ({
      role: m.role,
      content: m.content,
    })),
    metadata: {
      customerId: customerId || 'unknown',
      agentId: agentId || 'unknown',
      messageCount: messages.length,
      savedAt: new Date().toISOString(),
      autoVerified: autoVerified,
      verifiedBy: 'agentic-agent',
      agenticDecision: decision
        ? {
            shouldVerify: decision.shouldVerify,
            shouldDelete: decision.shouldDelete,
            reason: decision.reason,
            confidence: decision.confidence,
            riskScore: decision.riskScore,
            complianceScore: decision.complianceScore,
            categories: decision.categories,
          }
        : null,
    },
  };

  const contentFingerprint = crypto
    .createHash('sha256')
    .update(JSON.stringify(conversationData.messages))
    .digest('hex');

  const fingerprintData = {
    contentHash: contentFingerprint,
    conversationId: conversationId,
    messageCount: messages.length,
    customerId: customerId || 'unknown',
    agentId: agentId || 'unknown',
    timestamp: new Date().toISOString(),
  };

  const contentHash = crypto
    .createHash('sha256')
    .update(JSON.stringify(fingerprintData))
    .digest('hex');

  const tenantApiKey = await prisma.apiKey.findFirst({
    where: { tenantId: tenantId },
  });

  if (!tenantApiKey || !tenantApiKey.encryptedPrivateKey) {
    throw new Error('No API key available for encryption');
  }

  const decryptedPrivateKeyBase64 = decryptPrivateKey(
    tenantApiKey.encryptedPrivateKey
  );
  const privateKeyBytes = fromBase64(decryptedPrivateKeyBase64);
  const tenantKeypair = Ed25519Keypair.fromSecretKey(privateKeyBytes);
  const tenantAddress = tenantKeypair.getPublicKey().toSuiAddress();

  const sealId = crypto
    .createHash('sha256')
    .update(conversationId + tenantAddress)
    .digest('hex');

  const plaintext = JSON.stringify(conversationData);

  let encryptedObjectHex: string;
  let sessionKeyHex: string;
  let encryptedBlob: string;

  try {
    const { encryptedObject, key } = await sealClient.encrypt({
      data: Buffer.from(plaintext, 'utf8'),
      threshold: 2,
      packageId: SEAL_SYSTEM_PACKAGE_ID,
      id: sealId,
      demType: 0,
      kemType: 0,
    });

    encryptedObjectHex = Buffer.from(encryptedObject).toString('hex');
    sessionKeyHex = Buffer.from(key).toString('hex');

    encryptedBlob = JSON.stringify({
      encryptedObjectHex: encryptedObjectHex,
      sessionKeyHex: sessionKeyHex,
      tenantAddress: tenantAddress,
      sealId: sealId,
      conversationId: conversationId,
      contentHash: contentHash,
    });
  } catch (sealError) {
    console.error('SEAL encryption failed:', sealError);
    throw new Error(`SEAL encryption failed: ${sealError}`);
  }

  let blobId: string;
  let walrusExplorerUrl: string;
  let suiTxHash: string;

  try {
    const result = await storeBlobOnWalrus(encryptedBlob);
    blobId = result.blobId;
    walrusExplorerUrl = result.walrusExplorerUrl;
    suiTxHash = result.suiTxHash;
  } catch (walrusError) {
    console.error('Walrus storage failed:', walrusError);
    throw new Error(`Walrus storage failed: ${walrusError}`);
  }

  let anchorProofTxHash: string | undefined;
  try {
    const result = await recordOnChain({
      blobId,
      conversationId,
      contentHash,
      suiTxHash: suiTxHash,
      signature: signature || '',
      tenantAddress: tenantAddress,
    });

    if (result && result.digest) {
      anchorProofTxHash = result.digest;
      console.log('AnchorProof transaction hash:', anchorProofTxHash);
    }
  } catch (err) {
    console.error('On-chain recording failed:', err);
    throw new Error(`On-chain recording failed: ${err}`);
  }

  const metadata: Prisma.InputJsonValue = {
    savedAt: new Date().toISOString(),
    sealId: sealId,
    tenantAddress: tenantAddress,
    contentFingerprint: contentFingerprint,
    autoVerified: autoVerified,
    verifiedBy: 'agentic-agent',
  };

  if (decision) {
    (metadata as Record<string, unknown>).agenticDecision = {
      shouldVerify: decision.shouldVerify,
      shouldDelete: decision.shouldDelete,
      reason: decision.reason,
      confidence: decision.confidence,
      riskScore: decision.riskScore,
      complianceScore: decision.complianceScore,
      categories: decision.categories,
    };
  }

  const verification = await prisma.verification.create({
    data: {
      tenantId: tenantId,
      conversationId,
      blobId: blobId,
      suiTxHash: suiTxHash,
      anchorProofTxHash: anchorProofTxHash,
      customerId: customerId || 'unknown',
      agentId: agentId || 'unknown',
      modelUsed: 'seal-encrypted',
      messageCount: messages.length,
      contentHash: contentHash,
      metadata: metadata,
    },
  });

  await prisma.tempMessage.deleteMany({
    where: { tenantId: tenantId, conversationId },
  });

  await createAuditLogAsync({
    action: 'CONVERSATION_VERIFIED',
    blobId: blobId,
    conversationId: conversationId,
    tenantId: tenantId,
    details: {
      messageCount: messages.length,
      customerId: customerId || 'unknown',
      agentId: agentId || 'unknown',
      suiTxHash: suiTxHash,
      tenantAddress: tenantAddress,
      verificationId: verification.id,
      sealId: sealId,
      contentHash: contentHash,
      anchorProofTxHash: anchorProofTxHash,
      autoVerified: true,
      verifiedBy: 'agentic-agent',
    },
  });

  return {
    success: true,
    blobId,
    conversationId,
    messageCount: messages.length,
    contentHash,
    contentFingerprint,
    anchorProofTxHash,
    suiTxHash,
    walrusExplorerUrl,
    verificationId: verification.id,
    sealId,
    tenantAddress,
    onChainRecorded: !!anchorProofTxHash,
  };
}

export async function deleteConversation(params: {
  tenantId: string;
  conversationId: string;
  customerId: string;
  agentId: string;
  messages: { role: string; content: string }[];
  decision?: AgenticDecision;
}) {
  const { tenantId, conversationId, customerId, agentId, messages, decision } =
    params;

  await createAuditLogAsync({
    action: 'CONVERSATION_VERIFIED',
    conversationId: conversationId,
    tenantId: tenantId,
    details: {
      messageCount: messages.length,
      customerId: customerId || 'unknown',
      agentId: agentId || 'unknown',
      deleted: true,
      deletedAt: new Date().toISOString(),
      decision: decision
        ? {
            shouldVerify: decision.shouldVerify,
            shouldDelete: decision.shouldDelete,
            reason: decision.reason,
            confidence: decision.confidence,
            riskScore: decision.riskScore,
            complianceScore: decision.complianceScore,
            categories: decision.categories,
          }
        : null,
    },
  });

  await prisma.tempMessage.deleteMany({
    where: { tenantId: tenantId, conversationId },
  });

  return {
    success: true,
    conversationId,
    deleted: true,
    messageCount: messages.length,
  };
}
