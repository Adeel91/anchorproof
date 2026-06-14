import IndustryPageWrapper from '@/components/industry/IndustryPageWrapper';
import { InsuranceChat } from '@/components/chat';

export default function InsurancePage() {
  return IndustryPageWrapper({
    hero: {
      badge: 'INSURANCE & RISK MANAGEMENT',
      title: 'Verifiable',
      highlightedText: 'claims processing',
      description:
        'Eliminate claims fraud with cryptographically verified AI-assisted underwriting and claims investigation transcripts.',
      gradientFrom: 'blue',
      gradientTo: 'indigo',
      badgeColor: 'blue',
    },
    stats: [
      {
        value: '60%',
        label: 'Faster Processing',
        desc: 'Automated claims verification',
      },
      {
        value: '100%',
        label: 'Fraud Detection',
        desc: 'Cryptographically verified',
      },
      {
        value: '$2.1B',
        label: 'Annual Savings',
        desc: 'Industry fraud reduction',
      },
    ],
    features: [
      {
        title: 'Claims Management',
        items: [
          'Claims Verification',
          'Fraud Detection',
          'Dispute Resolution',
          'Immutable Records',
        ],
      },
      {
        title: 'Underwriting',
        items: [
          'Risk Assessment',
          'Premium Calculation',
          'Policy Compliance',
          'Regulatory Reporting',
        ],
      },
      {
        title: 'Technical Capabilities',
        items: [
          'Real-time Verification',
          'Fraud Pattern Detection',
          'Court-admissible Proofs',
          'Zero-trust Architecture',
        ],
      },
    ],
    useCases: [
      {
        name: 'Claims Processing',
        desc: 'Verify every AI-assisted claim',
        icon: '📋',
      },
      { name: 'Underwriting', desc: 'Immutable risk assessment', icon: '⚖️' },
      {
        name: 'Fraud Investigation',
        desc: 'Tamper-proof audit trails',
        icon: '🛡️',
      },
      {
        name: 'Regulatory Compliance',
        desc: 'Automated compliance archives',
        icon: '📜',
      },
    ],
    cta: {
      title: 'Ready to transform your insurance operations?',
      description:
        'Join leading insurers using AnchorProof for fraud-free claims processing',
      buttonText: 'Request Insurance Demo',
      gradientColor: 'blue',
    },
    chat: {
      title: 'Try Our Insurance AI Assistant',
      subtitle: 'Ask About Claims, Underwriting & Fraud Detection',
      component: <InsuranceChat />,
      gradientColor: 'blue',
    },
  });
}
