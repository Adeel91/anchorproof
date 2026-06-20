import Container from '@/components/ui/Container';
import Link from 'next/link';
import { Bot, Sparkles, Shield, Database, Link as LinkIcon } from 'lucide-react';

export default function IndustryDemos() {
  const demos = [
    {
      name: 'Banking',
      description: 'See how financial institutions use AnchorProof to verify customer service AI conversations. Every interaction is encrypted, stored immutably, and cryptographically verified.',
      href: '/industry/banking',
      color: 'from-cyan-400 to-blue-400',
      icon: <Bot className="w-5 h-5" />,
      features: ['Conversation history', 'Tamper detection', 'Audit logs', 'Verified reports'],
    },
    {
      name: 'Healthcare',
      description: 'See how healthcare providers use AnchorProof for HIPAA-compliant AI interactions. Every patient conversation is cryptographically verified and tamper-proof.',
      href: '/industry/healthcare',
      color: 'from-emerald-400 to-teal-400',
      icon: <Bot className="w-5 h-5" />,
      features: ['Conversation history', 'Tamper detection', 'Audit logs', 'Verified reports'],
    },
    {
      name: 'Insurance',
      description: 'See how insurers use AnchorProof for claims processing and underwriting AI. Cryptographically verified decisions with full audit trails.',
      href: '/industry/insurance',
      color: 'from-blue-400 to-indigo-400',
      icon: <Bot className="w-5 h-5" />,
      features: ['Conversation history', 'Tamper detection', 'Audit logs', 'Verified reports'],
    },
    {
      name: 'Government',
      description: 'See how public sector agencies use AnchorProof for AI accountability. Tamper-proof records with cryptographic proof of every interaction.',
      href: '/industry/government',
      color: 'from-purple-400 to-pink-400',
      icon: <Bot className="w-5 h-5" />,
      features: ['Conversation history', 'Tamper detection', 'Audit logs', 'Verified reports'],
    },
  ];

  return (
    <section id="demos" className="py-12 sm:py-16 md:py-20 bg-slate-900/10 border-y border-slate-800/50">
      <Container>
        <div className="max-w-3xl mx-auto text-center mb-8 sm:mb-14">
          <span className="text-[10px] sm:text-xs font-mono font-bold uppercase tracking-widest text-amber-400 bg-amber-400/5 px-3 py-1.5 rounded-lg border border-amber-400/20 inline-block mb-3 sm:mb-4">
            Enterprise Demos
          </span>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white tracking-tight">
            See how enterprises use AnchorProof to protect their AI.
          </h2>
          <p className="mt-3 sm:mt-4 text-sm sm:text-base text-slate-400 max-w-2xl mx-auto">
            Each demo shows conversation history, tamper detection, audit logs, and cryptographically verified compliance reports in action.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 max-w-5xl mx-auto">
          {demos.map((demo) => (
            <Link
              key={demo.name}
              href={demo.href}
              className="group relative overflow-hidden p-5 sm:p-6 bg-slate-900/50 border border-slate-800/50 rounded-xl hover:border-transparent transition-all duration-300"
            >
              <div className={`absolute inset-0 bg-gradient-to-r ${demo.color} opacity-0 group-hover:opacity-10 transition-opacity duration-500`} />
              
              <div className="relative flex flex-col h-full">
                <div className="flex items-start gap-3 sm:gap-4">
                  <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-lg bg-gradient-to-r ${demo.color} flex items-center justify-center text-white shadow-lg flex-shrink-0`}>
                    {demo.icon}
                  </div>
                  <div>
                    <h3 className="text-base sm:text-lg font-bold text-white group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-white group-hover:to-cyan-400 transition-all">
                      {demo.name}
                    </h3>
                    <p className="text-xs sm:text-sm text-slate-400 mt-1 leading-relaxed">{demo.description}</p>
                  </div>
                </div>
                
                <div className="mt-3 sm:mt-4 flex flex-wrap gap-1.5 sm:gap-2">
                  {demo.features.map((feature) => (
                    <span key={feature} className="text-[8px] sm:text-[10px] font-mono px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-full bg-slate-800/50 text-slate-400 border border-slate-700/30">
                      {feature}
                    </span>
                  ))}
                </div>
                
                <div className="mt-3 sm:mt-4 flex items-center gap-2 text-xs text-cyan-400 font-mono">
                  <Sparkles className="w-3 h-3" />
                  <span>Try the enterprise demo →</span>
                </div>
              </div>
            </Link>
          ))}
        </div>

        <div className="mt-6 sm:mt-8 text-center">
          <p className="text-xs sm:text-sm text-slate-500 font-mono">
            These demos use the Grok API for AI responses. Every conversation shows full history, tamper detection, audit logs, and cryptographically verified compliance reports.
          </p>
          <div className="mt-3 flex flex-wrap items-center justify-center gap-3 sm:gap-4 text-[10px] sm:text-xs text-slate-600 font-mono">
            <span className="flex items-center gap-1.5">
              <Shield className="w-3 h-3 text-cyan-400" />
              Tamper detection
            </span>
            <span className="w-px h-3 bg-slate-700" />
            <span className="flex items-center gap-1.5">
              <Database className="w-3 h-3 text-indigo-400" />
              Walrus storage
            </span>
            <span className="w-px h-3 bg-slate-700" />
            <span className="flex items-center gap-1.5">
              <LinkIcon className="w-3 h-3 text-purple-400" />
              Sui anchored
            </span>
            <span className="w-px h-3 bg-slate-700" />
            <span className="flex items-center gap-1.5">
              <Shield className="w-3 h-3 text-amber-400" />
              Audit logs
            </span>
          </div>
        </div>
      </Container>
    </section>
  );
}