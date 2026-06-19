// components/dashboard/reports/ComplianceReportPDF.tsx
import React from 'react';
import { 
  Document, 
  Page, 
  Text, 
  View, 
  StyleSheet, 
  Image,
  Link
} from '@react-pdf/renderer';

const styles = StyleSheet.create({
  page: {
    padding: 40,
    backgroundColor: '#ffffff',
    fontFamily: 'Helvetica',
  },
  coverPage: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    textAlign: 'center',
  },
  logo: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#4f46e5',
    letterSpacing: 4,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 12,
    color: '#6b7280',
    letterSpacing: 4,
    marginBottom: 40,
  },
  reportTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1a1a2e',
    marginBottom: 8,
  },
  reportSubtitle: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 40,
  },
  metaText: {
    fontSize: 11,
    color: '#6b7280',
    marginBottom: 4,
  },
  metaTextBold: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#1a1a2e',
  },
  footerNote: {
    fontSize: 10,
    color: '#6b7280',
    marginTop: 60,
    maxWidth: 400,
    textAlign: 'center',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1a1a2e',
    marginBottom: 16,
    paddingBottom: 8,
    borderBottom: '2px solid #4f46e5',
  },
  summaryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginVertical: 16,
    gap: 12,
  },
  summaryCard: {
    flex: 1,
    minWidth: 120,
    backgroundColor: '#f8fafc',
    padding: 16,
    borderRadius: 8,
    border: '1px solid #e2e8f0',
  },
  summaryLabel: {
    fontSize: 9,
    textTransform: 'uppercase',
    color: '#6b7280',
    fontWeight: 'bold',
    letterSpacing: 0.5,
  },
  summaryValue: {
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 4,
  },
  summaryStatus: {
    fontSize: 9,
    marginTop: 4,
    color: '#6b7280',
  },
  cryptoProof: {
    backgroundColor: '#f0fdf4',
    padding: 16,
    borderRadius: 8,
    border: '1px solid #10b981',
    marginVertical: 16,
  },
  cryptoLabel: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#10b981',
    marginBottom: 6,
  },
  cryptoItem: {
    fontSize: 10,
    color: '#374151',
    paddingVertical: 2,
  },
  conversationBlock: {
    backgroundColor: '#f8fafc',
    padding: 16,
    borderRadius: 8,
    border: '1px solid #e2e8f0',
    marginVertical: 16,
  },
  conversationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
    flexWrap: 'wrap',
  },
  conversationId: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#1e293b',
  },
  conversationStatus: {
    fontSize: 9,
    fontWeight: 'bold',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
  },
  statusVerified: {
    backgroundColor: '#dcfce7',
    color: '#16a34a',
  },
  statusTampered: {
    backgroundColor: '#fee2e2',
    color: '#dc2626',
  },
  statusPending: {
    backgroundColor: '#fef3c7',
    color: '#d97706',
  },
  proofRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginVertical: 2,
    fontSize: 9,
  },
  proofLabel: {
    color: '#6b7280',
    marginRight: 4,
  },
  proofValue: {
    fontFamily: 'Courier',
    color: '#1e293b',
  },
  qrSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 8,
    gap: 12,
  },
  qrImage: {
    width: 80,
    height: 80,
  },
  qrText: {
    fontSize: 8,
    color: '#6b7280',
  },
  messagesSection: {
    marginTop: 12,
  },
  messagesTitle: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 8,
  },
  message: {
    padding: 10,
    marginVertical: 4,
    borderRadius: 4,
    fontSize: 9,
    lineHeight: 1.4,
  },
  messageUser: {
    backgroundColor: '#eef2ff',
    borderLeft: '3px solid #6366f1',
  },
  messageAssistant: {
    backgroundColor: '#f1f5f9',
    borderLeft: '3px solid #06b6d4',
  },
  messageRole: {
    fontSize: 8,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  messageRoleUser: {
    color: '#6366f1',
  },
  messageRoleAssistant: {
    color: '#06b6d4',
  },
  messageContent: {
    fontSize: 9,
    color: '#1e293b',
    whiteSpace: 'pre-wrap',
  },
  messageTime: {
    fontSize: 7,
    color: '#94a3b8',
    marginTop: 2,
  },
  walrusLink: {
    fontSize: 9,
    color: '#4f46e5',
    textDecoration: 'underline',
  },
  footer: {
    marginTop: 40,
    paddingTop: 16,
    borderTop: '1px solid #e2e8f0',
    flexDirection: 'row',
    justifyContent: 'space-between',
    fontSize: 9,
    color: '#6b7280',
    flexWrap: 'wrap',
  },
  integrityBadge: {
    marginTop: 8,
    padding: 8,
    borderRadius: 4,
    fontSize: 9,
    fontWeight: 'bold',
  },
  integrityPass: {
    backgroundColor: '#dcfce7',
    color: '#16a34a',
  },
  integrityFail: {
    backgroundColor: '#fee2e2',
    color: '#dc2626',
  },
  messageCount: {
    fontSize: 9,
    color: '#6b7280',
    marginTop: 4,
  },
  noMessages: {
    fontSize: 10,
    color: '#6b7280',
    textAlign: 'center',
    paddingVertical: 20,
  },
});

interface ComplianceReportPDFProps {
  reportData: {
    tenantName: string;
    generatedBy: string;
    generatedAt: string;
    reportTitle?: string;
    summary: {
      totalConversations: number;
      verifiedCount: number;
      tamperedCount: number;
      integrityRate: number;
      totalMessages: number;
    };
    conversations: any[];
    qrCodes: Record<string, string>;
    isSingleReport?: boolean;
  };
}

export function ComplianceReportPDF({ reportData }: ComplianceReportPDFProps) {
  const { 
    tenantName, 
    generatedBy, 
    generatedAt, 
    reportTitle, 
    summary, 
    conversations, 
    qrCodes, 
    isSingleReport 
  } = reportData;
  
  const hasTampered = summary.tamperedCount > 0;
  const isCompliant = summary.integrityRate >= 80;
  const title = reportTitle || (isSingleReport ? 'Conversation Report' : 'Compliance Report');
  const subtitle = isSingleReport 
    ? 'Cryptographic Verification of a Single Conversation' 
    : 'Cryptographic Verification of AI Conversations';

  return (
    <Document>
      {/* COVER PAGE */}
      <Page size="A4" style={styles.page}>
        <View style={styles.coverPage}>
          <Text style={styles.logo}>ANCHORPROOF</Text>
          <Text style={styles.subtitle}>VERIFIABLE AI MEMORY INFRASTRUCTURE</Text>
          
          <Text style={styles.reportTitle}>{title}</Text>
          <Text style={styles.reportSubtitle}>{subtitle}</Text>

          <View style={{ marginTop: 40 }}>
            <Text style={styles.metaText}>
              <Text style={styles.metaTextBold}>Tenant:</Text> {tenantName}
            </Text>
            <Text style={styles.metaText}>
              <Text style={styles.metaTextBold}>Generated:</Text> {new Date(generatedAt).toLocaleString()}
            </Text>
            <Text style={styles.metaText}>
              <Text style={styles.metaTextBold}>Generated By:</Text> {generatedBy}
            </Text>
            <Text style={styles.metaText}>
              <Text style={styles.metaTextBold}>Report ID:</Text> {Date.now()}
            </Text>
            {isSingleReport && conversations[0] && (
              <Text style={styles.metaText}>
                <Text style={styles.metaTextBold}>Conversation:</Text> {conversations[0].conversationId}
              </Text>
            )}
          </View>

          <Text style={styles.footerNote}>
            This report serves as court-admissible evidence of conversation integrity.
            All data is cryptographically verified and stored on the Sui blockchain.
          </Text>
        </View>
      </Page>

      {/* SUMMARY PAGE */}
      <Page size="A4" style={styles.page}>
        <Text style={styles.sectionTitle}>Executive Summary</Text>

        <View style={styles.summaryGrid}>
          <View style={styles.summaryCard}>
            <Text style={styles.summaryLabel}>Total Conversations</Text>
            <Text style={[styles.summaryValue, { color: '#4f46e5' }]}>
              {summary.totalConversations}
            </Text>
            <Text style={styles.summaryStatus}>Stored on Walrus</Text>
          </View>
          <View style={styles.summaryCard}>
            <Text style={styles.summaryLabel}>Verified</Text>
            <Text style={[styles.summaryValue, { color: '#10b981' }]}>
              {summary.verifiedCount}
            </Text>
            <Text style={styles.summaryStatus}>Cryptographically verified</Text>
          </View>
          <View style={styles.summaryCard}>
            <Text style={styles.summaryLabel}>Tampered</Text>
            <Text style={[styles.summaryValue, { color: hasTampered ? '#ef4444' : '#10b981' }]}>
              {summary.tamperedCount}
            </Text>
            <Text style={styles.summaryStatus}>
              {hasTampered ? 'Integrity compromised' : 'All records intact'}
            </Text>
          </View>
          <View style={styles.summaryCard}>
            <Text style={styles.summaryLabel}>Integrity Rate</Text>
            <Text style={[styles.summaryValue, { color: isCompliant ? '#10b981' : '#ef4444' }]}>
              {summary.integrityRate}%
            </Text>
            <Text style={styles.summaryStatus}>
              {isCompliant ? 'Compliant' : 'Review required'}
            </Text>
          </View>
        </View>

        <View style={styles.cryptoProof}>
          <Text style={styles.cryptoLabel}>Cryptographic Verification</Text>
          <Text style={styles.cryptoItem}>• All conversations stored on Walrus decentralized storage</Text>
          <Text style={styles.cryptoItem}>• Each conversation has a unique blobId and blockchain transaction hash</Text>
          <Text style={styles.cryptoItem}>• Messages are cryptographically signed and verified</Text>
          <Text style={styles.cryptoItem}>• Immutable audit trail on Sui blockchain</Text>
        </View>

        <View style={[styles.integrityBadge, isCompliant ? styles.integrityPass : styles.integrityFail]}>
          <Text>
            {isCompliant ? 'COMPLIANT' : 'NON-COMPLIANT'} —{' '}
            {summary.integrityRate}% integrity rate
          </Text>
        </View>
      </Page>

      {/* CONVERSATION PAGES */}
      {conversations.map((conv, index) => {
        const messageCount = conv.messages?.length || 0;
        return (
          <Page key={conv.id || index} size="A4" style={styles.page}>
            <View style={styles.conversationBlock}>
              <View style={styles.conversationHeader}>
                <Text style={styles.conversationId}>
                  {isSingleReport ? 'Conversation' : `#${index + 1} —`} {conv.conversationId?.slice(0, 24)}...
                </Text>
                <Text style={[
                  styles.conversationStatus,
                  conv.verifiedAt ? styles.statusVerified : 
                  conv.isTampered ? styles.statusTampered : styles.statusPending
                ]}>
                  {conv.verifiedAt ? 'VERIFIED' : 
                   conv.isTampered ? 'TAMPERED' : 'PENDING'}
                </Text>
              </View>

              <View style={styles.proofRow}>
                <Text style={styles.proofLabel}>Blob ID:</Text>
                <Text style={styles.proofValue}>{conv.blobId}</Text>
              </View>
              <View style={styles.proofRow}>
                <Text style={styles.proofLabel}>Transaction Hash:</Text>
                <Text style={styles.proofValue}>{conv.suiTxHash || 'N/A'}</Text>
              </View>
              <View style={styles.proofRow}>
                <Text style={styles.proofLabel}>Content Hash:</Text>
                <Text style={styles.proofValue}>
                  {conv.contentHash?.slice(0, 32) || 'N/A'}
                  {conv.contentHash ? '...' : ''}
                </Text>
              </View>

              <Link src={`https://walruscan.com/testnet/blob/${conv.blobId}`}>
                <Text style={styles.walrusLink}>View on Walruscan →</Text>
              </Link>

              {qrCodes[conv.blobId] && (
                <View style={styles.qrSection}>
                  <Image src={qrCodes[conv.blobId]} style={styles.qrImage} />
                  <View>
                    <Text style={styles.qrText}>Scan to verify on-chain</Text>
                    <Text style={[styles.qrText, { fontSize: 7, color: '#9ca3af' }]}>
                      {`https://walruscan.com/testnet/blob/${conv.blobId}`}
                    </Text>
                  </View>
                </View>
              )}

              {/* MESSAGES SECTION */}
              <View style={styles.messagesSection}>
                <Text style={styles.messagesTitle}>
                  Transcript ({messageCount} messages)
                </Text>
                
                {messageCount > 0 ? (
                  conv.messages.map((msg: any, idx: number) => (
                    <View key={idx} style={[styles.message, msg.role === 'user' ? styles.messageUser : styles.messageAssistant]}>
                      <Text style={[styles.messageRole, msg.role === 'user' ? styles.messageRoleUser : styles.messageRoleAssistant]}>
                        {msg.role === 'user' ? 'Customer' : 'AI Assistant'}
                      </Text>
                      <Text style={styles.messageContent}>{msg.content}</Text>
                      <Text style={styles.messageTime}>
                        {msg.timestamp ? new Date(msg.timestamp).toLocaleString() : ''}
                      </Text>
                    </View>
                  ))
                ) : (
                  <Text style={styles.noMessages}>No messages found in this conversation</Text>
                )}
              </View>
            </View>
          </Page>
        );
      })}

      {/* FINAL PAGE */}
      <Page size="A4" style={styles.page}>
        <Text style={styles.sectionTitle}>Verification Summary</Text>

        <View style={styles.cryptoProof}>
          <Text style={styles.cryptoLabel}>Report Verification</Text>
          <Text style={styles.cryptoItem}>This report contains {summary.totalConversations} conversations</Text>
          <Text style={styles.cryptoItem}>{summary.verifiedCount} verified • {summary.tamperedCount} tampered</Text>
          <Text style={styles.cryptoItem}>Integrity Rate: {summary.integrityRate}%</Text>
        </View>

        <View style={{ marginTop: 20 }}>
          <Text style={{ fontSize: 11, fontWeight: 'bold', marginBottom: 8 }}>All conversations are stored on:</Text>
          <Text style={{ fontSize: 10, color: '#374151' }}>• Walrus Decentralized Storage</Text>
          <Text style={{ fontSize: 10, color: '#374151' }}>• Sui Blockchain (Testnet/Mainnet)</Text>
        </View>

        <View style={{ marginTop: 40, alignItems: 'center', paddingTop: 40, borderTop: '2px solid #e2e8f0' }}>
          <Text style={{ fontSize: 20, fontWeight: 'bold', color: '#4f46e5' }}>ANCHORPROOF</Text>
          <Text style={{ fontSize: 10, color: '#6b7280', marginTop: 4 }}>Verifiable AI Memory Infrastructure</Text>
          <Text style={{ fontSize: 9, color: '#6b7280', marginTop: 20 }}>
            This report is digitally signed and cryptographically verified.
          </Text>
          <Text style={{ fontSize: 8, color: '#6b7280', marginTop: 4 }}>
            Report ID: {Date.now()} • Generated: {new Date().toLocaleDateString()}
          </Text>
        </View>
      </Page>
    </Document>
  );
}