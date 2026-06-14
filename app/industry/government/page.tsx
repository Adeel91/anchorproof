import IndustryPageWrapper from '@/components/industry/IndustryPageWrapper';
import { GovernmentChat } from '@/components/chat';

export default function GovernmentPage() {
  return IndustryPageWrapper({
    hero: {
      badge: 'GOVERNMENT & PUBLIC SECTOR',
      title: 'FOIA compliant',
      highlightedText: 'citizen interactions',
      description:
        'FISMA, FedRAMP, and FOIA compliant AI conversation logging with immutable public records.',
      gradientFrom: 'purple',
      gradientTo: 'pink',
      badgeColor: 'purple',
    },
    stats: [
      { value: 'FedRAMP', label: 'Ready', desc: 'Authorization in progress' },
      { value: 'NIST', label: 'Compliant', desc: '800-53 controls' },
      { value: '100%', label: 'Audit Integrity', desc: 'Immutable records' },
    ],
    features: [
      {
        title: 'Compliance Frameworks',
        items: ['FOIA', 'FISMA', 'FedRAMP', 'NIST 800-53', 'CMMC 2.0'],
      },
      {
        title: 'Security Controls',
        items: [
          'Access Control',
          'Audit & Accountability',
          'Contingency Planning',
          'Incident Response',
        ],
      },
      {
        title: 'Public Sector Features',
        items: [
          'Immutable Public Records',
          'FOIA Request Management',
          'Chain of Custody',
          'Court-Admissible Proofs',
        ],
      },
    ],
    useCases: [
      {
        name: 'FOIA Compliance',
        desc: 'Immutable public records management',
        icon: '📋',
      },
      {
        name: 'FedRAMP Authorization',
        desc: 'Cloud security compliance',
        icon: '☁️',
      },
      {
        name: 'Cybersecurity',
        desc: 'NIST framework implementation',
        icon: '🛡️',
      },
      { name: 'Audit Trails', desc: 'Cryptographic verification', icon: '📊' },
    ],
    cta: {
      title: 'Ready to ensure government compliance?',
      description:
        'Join public sector organizations using AnchorProof for FOIA-compliant immutable records',
      buttonText: 'Request Government Demo',
      gradientColor: 'purple',
    },
    chat: {
      title: 'Government Compliance Assistant',
      subtitle: 'Ask about FOIA, FISMA & FedRAMP',
      component: <GovernmentChat />,
      gradientColor: 'purple',
    },
  });
}
