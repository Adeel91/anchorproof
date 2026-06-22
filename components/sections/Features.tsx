import Container from '@/components/ui/Container';

export default function Features() {
  const features = [
    {
      category: 'Visibility',
      title: 'Complete Conversation History',
      description:
        'Enterprise dashboard shows every AI conversation with timestamps, customer IDs, agent IDs, and full message transcripts. See exactly what your AI said.',
    },
    {
      category: 'Integrity',
      title: 'Tamper Detection',
      description:
        'Cryptographic verification shows if any AI response has been altered. Know immediately if your AI conversations have been compromised.',
    },
    {
      category: 'Auditing',
      title: 'Detailed Audit Logs',
      description:
        'Every action is logged with cryptographic proof. See who accessed conversations, when, and from where. Perfect for internal compliance and regulatory reviews.',
    },
    {
      category: 'Reporting',
      title: 'Cryptographically Verified Reports',
      description:
        'Generate PDF reports with blob IDs, Sui transaction hashes, QR codes, and cryptographic signatures. Tamper-proof evidence for regulatory compliance.',
    },
    {
      category: 'Integration',
      title: 'Enterprise SDK',
      description:
        'Add AnchorProof to your AI applications with a single import. The SDK handles encryption, storage, and verification automatically.',
    },
    {
      category: 'Security',
      title: 'Immutable Storage',
      description:
        'Conversations stored on Walrus decentralized storage. Sui blockchain verification provides permanent, tamper-proof proof of every interaction.',
    },
  ];

  return (
    <section id="features" className="py-16 sm:py-20 md:py-36 bg-slate-950">
      <Container>
        <div className="max-w-3xl mx-auto text-center mb-8 sm:mb-14">
          <span className="text-[10px] sm:text-xs font-mono font-bold uppercase tracking-widest text-cyan-400 bg-cyan-400/5 px-3 py-1.5 rounded-lg border border-cyan-400/20 inline-block mb-3 sm:mb-4">
            Enterprise Capabilities
          </span>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white tracking-tight">
            Everything you need to govern enterprise AI.
          </h2>
          <p className="mt-3 sm:mt-4 text-sm sm:text-base text-slate-400 max-w-2xl mx-auto">
            Protect your organization from AI liability with complete
            visibility, tamper detection, audit logs, and cryptographically
            verified compliance reporting.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {features.map((feature, idx) => (
            <div
              key={idx}
              className="p-4 sm:p-6 bg-slate-900/30 border border-slate-800/50 rounded-xl hover:border-cyan-400/30 transition-all"
            >
              <div className="text-[8px] sm:text-[10px] font-mono text-cyan-400 font-bold uppercase tracking-wider">
                {feature.category}
              </div>
              <h4 className="text-sm sm:text-base font-bold text-white mt-2">
                {feature.title}
              </h4>
              <p className="text-xs sm:text-sm text-slate-400 mt-2 leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </Container>
    </section>
  );
}
