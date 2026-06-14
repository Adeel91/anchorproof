import IndustryPageWrapper from '@/components/industry/IndustryPageWrapper';
import { HealthcareChat } from '@/components/chat';

export default function HealthcarePage() {
  return IndustryPageWrapper({
    hero: {
      badge: 'HEALTHCARE & LIFE SCIENCES',
      title: 'HIPAA compliant',
      highlightedText: 'AI patient interactions',
      description:
        'FDA, HIPAA, and HITECH compliant AI conversation logging with tamper-proof patient records.',
      gradientFrom: 'emerald',
      gradientTo: 'teal',
      badgeColor: 'emerald',
    },
    stats: [
      {
        value: 'HIPAA',
        label: 'Full Compliance',
        desc: 'Privacy & Security Rules',
      },
      { value: 'HITECH', label: 'Certified', desc: 'EHR meaningful use' },
      {
        value: '100%',
        label: 'Data Integrity',
        desc: 'Immutable patient records',
      },
    ],
    features: [
      {
        title: 'Compliance Frameworks',
        items: [
          'HIPAA Privacy Rule',
          'HIPAA Security Rule',
          'HITECH Act',
          'FDA Guidelines',
          'GDPR for Health',
        ],
      },
      {
        title: 'Security Controls',
        items: [
          'PHI Encryption',
          'Access Controls',
          'Audit Trails',
          'Business Associate Agreements',
        ],
      },
      {
        title: 'Healthcare Features',
        items: [
          'Immutable Patient Records',
          'Clinical Documentation',
          'Telehealth Compliance',
          'Breach Notification',
        ],
      },
    ],
    useCases: [
      {
        name: 'HIPAA Compliance',
        desc: 'Patient data protection and privacy',
        icon: '🔒',
      },
      {
        name: 'Clinical Documentation',
        desc: 'Immutable medical records',
        icon: '📋',
      },
      { name: 'Telehealth', desc: 'Compliant virtual care', icon: '💻' },
      { name: 'FDA Guidelines', desc: 'Healthcare AI compliance', icon: '⚕️' },
    ],
    cta: {
      title: 'Ready to secure your healthcare AI?',
      description:
        'Join leading healthcare providers using AnchorProof for HIPAA-compliant AI logs',
      buttonText: 'Request Healthcare Demo',
      gradientColor: 'emerald',
    },
    chat: {
      title: 'Healthcare Compliance Assistant',
      subtitle: 'Ask about HIPAA, HITECH & FDA',
      component: <HealthcareChat />,
      gradientColor: 'emerald',
    },
  });
}
