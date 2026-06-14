import IndustryPageWrapper from '@/components/industry/IndustryPageWrapper';
import { BankingChat } from '@/components/chat';

export default function BankingPage() {
  return IndustryPageWrapper({
    hero: {
      badge: 'FINANCIAL SERVICES',
      title: 'Immutable audit trails for',
      highlightedText: 'banking AI systems',
      description:
        'SEC, FINRA, and Basel III compliant AI conversation logging with cryptographic verification.',
      gradientFrom: 'cyan',
      gradientTo: 'indigo',
      badgeColor: 'cyan',
    },
    stats: [
      {
        value: '$2.5B',
        label: 'Annual Compliance Savings',
        desc: 'Industry-wide',
      },
      {
        value: '100%',
        label: 'Audit Trail Integrity',
        desc: 'Cryptographically verified',
      },
      {
        value: 'Tier-1',
        label: 'Regulatory Rating',
        desc: 'SEC/FINRA compliant',
      },
    ],
    features: [
      {
        title: 'Regulatory Compliance',
        items: ['SEC Rule 17a-4', 'FINRA 4511', 'Basel III', 'Dodd-Frank'],
      },
      {
        title: 'Risk Mitigation',
        items: [
          'Fraud Detection',
          'Liability Protection',
          'Audit Readiness',
          'Dispute Resolution',
        ],
      },
      {
        title: 'Technical Capabilities',
        items: [
          'Immutable Logs',
          'Real-time Verification',
          'Court-admissible Proofs',
          'Zero-trust Architecture',
        ],
      },
    ],
    useCases: [
      {
        name: 'Customer Service AI',
        desc: 'Verify every AI-banker interaction',
        icon: '🏦',
      },
      {
        name: 'Loan Processing',
        desc: 'Immutable underwriting decisions',
        icon: '📝',
      },
      {
        name: 'Fraud Investigation',
        desc: 'Tamper-proof audit trails',
        icon: '🔍',
      },
      {
        name: 'Regulatory Reporting',
        desc: 'Automated compliance archives',
        icon: '📊',
      },
    ],
    cta: {
      title: "Ready to secure your bank's AI interactions?",
      description:
        'Join leading financial institutions using AnchorProof for immutable audit trails',
      buttonText: 'Start Free Trial',
      gradientColor: 'cyan',
    },
    chat: {
      title: 'Try Our Banking AI Assistant',
      subtitle: 'Experience Secure Banking AI',
      component: <BankingChat />,
      gradientColor: 'cyan',
    },
  });
}
