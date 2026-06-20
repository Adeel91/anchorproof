import IndustryPageWrapper from '@/components/industry/IndustryPageWrapper';
import { HealthcareChat } from '@/components/chat';

export default function HealthcarePage() {
  return IndustryPageWrapper({
    design: 'clinic',
    hero: {
      badge: 'HIPAA COMPLIANT HEALTHCARE',
      badgeIcon: 'HeartPulse',
      title: 'Protecting patient trust through',
      highlightedText: 'verifiable AI conversations.',
      description: 'AnchorProof provides HIPAA, HITECH, and FDA compliant AI conversation logging with cryptographic verification. Every patient interaction becomes tamper-proof evidence that protects your healthcare organization and preserves patient trust.',
      gradientFrom: 'emerald',
      gradientTo: 'teal',
      badgeColor: 'emerald',
    },
    stats: [
      {
        value: 'HIPAA',
        label: 'Full Compliance',
        desc: 'Privacy & Security Rules',
        icon: 'Shield',
      },
      {
        value: 'HITECH',
        label: 'Certified',
        desc: 'EHR meaningful use',
        icon: 'FileCheck',
      },
      {
        value: '100%',
        label: 'Data Integrity',
        desc: 'Immutable patient records',
        icon: 'Lock',
      },
    ],
    features: [
      {
        icon: 'Shield',
        title: 'Compliance Frameworks',
        items: [
          'HIPAA Privacy Rule for patient data protection',
          'HIPAA Security Rule for electronic PHI',
          'HITECH Act for EHR meaningful use',
          'FDA guidelines for AI in healthcare'
        ],
      },
      {
        icon: 'Lock',
        title: 'Security Controls',
        items: [
          'End-to-end PHI encryption in transit and at rest',
          'Role-based access controls for patient data',
          'Immutable audit trails for all healthcare interactions',
          'Business Associate Agreement support'
        ],
      },
      {
        icon: 'FileCheck',
        title: 'Clinical Capabilities',
        items: [
          'Immutable patient record keeping',
          'Cryptographically verified clinical documentation',
          'HIPAA-compliant telehealth interactions',
          'Automated breach notification preparation'
        ],
      },
    ],
    useCases: [
      {
        icon: 'Shield',
        name: 'HIPAA Compliance',
        desc: 'Cryptographically verified patient data protection and privacy compliance',
      },
      {
        icon: 'FileCheck',
        name: 'Clinical Documentation',
        desc: 'Immutable medical records with full audit trails',
      },
      {
        icon: 'Database',
        name: 'Telehealth Compliance',
        desc: 'HIPAA-compliant virtual care with cryptographic verification',
      },
      {
        icon: 'TrendingUp',
        name: 'FDA AI Guidelines',
        desc: 'Compliance tracking for healthcare AI applications',
      },
    ],
    chat: {
      title: 'Live Enterprise Demo',
      subtitle: 'Experience HIPAA-compliant AI interactions',
      component: <HealthcareChat />,
      gradientColor: 'emerald',
    },
  });
}