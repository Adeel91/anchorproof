import type { Metadata } from 'next';
import IndustryPageWrapper from '@/components/industry/IndustryPageWrapper';
import { GovernmentChat } from '@/components/chat';

export const metadata: Metadata = {
  title: 'Government & Public Sector Compliance',
  description:
    'FISMA, FedRAMP, and FOIA compliant AI conversation logging. Secure public sector transparency with cryptographic, tamper-proof audit trails.',
  openGraph: {
    title: 'AnchorProof | Government & Public Sector Compliance',
    description:
      'Cryptographically verified AI logs meeting federal frameworks, NIST controls, and public records integrity regulations.',
    type: 'website',
  },
};

export default function GovernmentPage() {
  return IndustryPageWrapper({
    design: 'capitol',
    hero: {
      badge: 'FEDERAL COMPLIANCE READY',
      badgeIcon: 'Landmark',
      title: 'Ensuring government transparency through',
      highlightedText: 'verifiable citizen interactions.',
      description:
        'AnchorProof provides FISMA, FedRAMP, and FOIA compliant AI conversation logging with cryptographic verification. Every citizen interaction becomes tamper-proof evidence that protects your agency from compliance failures and FOIA disputes.',
      gradientFrom: 'indigo',
      gradientTo: 'purple',
      badgeColor: 'indigo',
    },
    stats: [
      {
        value: 'FedRAMP',
        label: 'Ready',
        desc: 'Authorization in progress',
        icon: 'Shield',
      },
      {
        value: 'NIST',
        label: 'Compliant',
        desc: '800-53 controls',
        icon: 'FileCheck',
      },
      {
        value: '100%',
        label: 'Audit Integrity',
        desc: 'Immutable public records',
        icon: 'Lock',
      },
    ],
    features: [
      {
        icon: 'Shield',
        title: 'Compliance Frameworks',
        items: [
          'FOIA for public records management',
          'FISMA for federal information security',
          'FedRAMP for cloud service authorization',
          'NIST 800-53 security controls',
        ],
      },
      {
        icon: 'Lock',
        title: 'Security Controls',
        items: [
          'Role-based access control for sensitive data',
          'Audit and accountability logging',
          'Contingency planning and disaster recovery',
          'Incident response and breach notification',
        ],
      },
      {
        icon: 'FileCheck',
        title: 'Public Sector Capabilities',
        items: [
          'Immutable public records preservation',
          'FOIA request management and tracking',
          'Complete chain of custody verification',
          'Cryptographic proof for legal proceedings',
        ],
      },
    ],
    useCases: [
      {
        icon: 'Shield',
        name: 'FOIA Compliance',
        desc: 'Immutable public records with cryptographic verification for transparency',
      },
      {
        icon: 'Building2',
        name: 'FedRAMP Authorization',
        desc: 'Cloud security compliance with full audit trails',
      },
      {
        icon: 'Lock',
        name: 'Cybersecurity',
        desc: 'NIST framework implementation with immutable security logs',
      },
      {
        icon: 'TrendingUp',
        name: 'Audit Trails',
        desc: 'Cryptographic verification for government audits',
      },
    ],
    chat: {
      title: 'Live Enterprise Demo',
      subtitle: 'Experience FOIA-compliant AI interactions',
      component: <GovernmentChat />,
      gradientColor: 'indigo',
    },
  });
}
