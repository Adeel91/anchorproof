import IndustryPageWrapper from '@/components/industry/IndustryPageWrapper';
import { BankingChat } from '@/components/chat';

export default function BankingPage() {
  return IndustryPageWrapper({
    design: 'vault',
    hero: {
      badge: 'TIER-1 FINANCIAL SERVICES',
      badgeIcon: 'Crown',
      title: 'Where financial institutions',
      highlightedText: 'secure their AI conversations.',
      description:
        'AnchorProof provides SEC, FINRA, and Basel III compliant AI conversation logging with cryptographic verification. Every customer interaction becomes tamper-proof, court-admissible evidence that protects your institution from regulatory fines and legal exposure.',
      gradientFrom: 'amber',
      gradientTo: 'cyan',
      badgeColor: 'amber',
    },
    stats: [
      {
        value: '$2.5B',
        label: 'Annual Compliance Savings',
        desc: 'Industry-wide',
        icon: 'DollarSign',
      },
      {
        value: '100%',
        label: 'Audit Trail Integrity',
        desc: 'Cryptographically verified',
        icon: 'Shield',
      },
      {
        value: 'Tier-1',
        label: 'Regulatory Rating',
        desc: 'SEC/FINRA compliant',
        icon: 'Crown',
      },
    ],
    features: [
      {
        icon: 'Shield',
        title: 'Regulatory Compliance',
        items: [
          'SEC Rule 17a-4 compliant record keeping',
          'FINRA 4511 regulatory reporting',
          'Basel III capital requirements',
          'Dodd-Frank stress testing',
        ],
      },
      {
        icon: 'Eye',
        title: 'Risk Mitigation',
        items: [
          'Real-time fraud detection',
          'Legal liability protection',
          'Audit-ready documentation',
          'Dispute resolution evidence',
        ],
      },
      {
        icon: 'Lock',
        title: 'Technical Capabilities',
        items: [
          'Immutable conversation logs',
          'Real-time cryptographic verification',
          'Tamper-proof evidence chain',
          'Zero-trust security architecture',
        ],
      },
    ],
    useCases: [
      {
        icon: 'FileCheck',
        name: 'Customer Service AI',
        desc: 'Cryptographically verify every AI-banker interaction with full audit trails',
      },
      {
        icon: 'Database',
        name: 'Loan Processing',
        desc: 'Immutable underwriting decisions with cryptographic proof',
      },
      {
        icon: 'Link',
        name: 'Fraud Investigation',
        desc: 'Tamper-proof audit trails for forensic analysis',
      },
      {
        icon: 'TrendingUp',
        name: 'Regulatory Reporting',
        desc: 'Automated compliance archives for SEC and FINRA',
      },
    ],
    chat: {
      title: 'Live Enterprise Demo',
      subtitle: 'Experience secure banking AI',
      component: <BankingChat />,
      gradientColor: 'amber',
    },
  });
}
