import IndustryPageWrapper from '@/components/industry/IndustryPageWrapper';
import { InsuranceChat } from '@/components/chat';

export default function InsurancePage() {
  return IndustryPageWrapper({
    design: 'shield',
    hero: {
      badge: 'NAIC COMPLIANT INSURANCE',
      badgeIcon: 'Shield',
      title: 'Protecting policyholders through',
      highlightedText: 'verifiable claims processing.',
      description: 'AnchorProof provides cryptographically verified claims processing, underwriting, and fraud detection. Every claim interaction becomes tamper-proof evidence that eliminates disputes, reduces fraud, and protects policyholders.',
      gradientFrom: 'blue',
      gradientTo: 'indigo',
      badgeColor: 'blue',
    },
    stats: [
      {
        value: '60%',
        label: 'Faster Processing',
        desc: 'Automated claims verification',
        icon: 'TrendingUp',
      },
      {
        value: '100%',
        label: 'Fraud Detection',
        desc: 'Cryptographically verified',
        icon: 'Shield',
      },
      {
        value: '$2.1B',
        label: 'Annual Savings',
        desc: 'Industry fraud reduction',
        icon: 'Award',
      },
    ],
    features: [
      {
        icon: 'FileCheck',
        title: 'Claims Management',
        items: [
          'Cryptographic claims verification for fraud prevention',
          'AI-assisted fraud detection with immutable audit trails',
          'Dispute resolution with tamper-proof evidence',
          'Immutable claims records for regulatory compliance'
        ],
      },
      {
        icon: 'Scale',
        title: 'Underwriting',
        items: [
          'Cryptographically verified risk assessment',
          'Immutable premium calculation records',
          'Policy compliance tracking with full audit trails',
          'Regulatory reporting with cryptographic proof'
        ],
      },
      {
        icon: 'Shield',
        title: 'Technical Capabilities',
        items: [
          'Real-time verification of claims interactions',
          'Fraud pattern detection with AI assistance',
          'Tamper-proof evidence for legal proceedings',
          'Zero-trust security architecture for sensitive data'
        ],
      },
    ],
    useCases: [
      {
        icon: 'FileCheck',
        name: 'Claims Processing',
        desc: 'Cryptographically verified AI-assisted claims with full audit trails',
      },
      {
        icon: 'Scale',
        name: 'Underwriting',
        desc: 'Immutable risk assessment and premium calculation records',
      },
      {
        icon: 'Shield',
        name: 'Fraud Investigation',
        desc: 'Tamper-proof audit trails for forensic analysis',
      },
      {
        icon: 'TrendingUp',
        name: 'Regulatory Compliance',
        desc: 'Automated compliance archives for state insurance regulations',
      },
    ],
    chat: {
      title: 'Live Enterprise Demo',
      subtitle: 'Experience fraud-free claims processing',
      component: <InsuranceChat />,
      gradientColor: 'blue',
    },
  });
}