import Container from '@/components/ui/Container';
import { Database, Link, Lock, Key, Code, FileCheck } from 'lucide-react';

export default function Primitives() {
  const blueprints = [
    {
      layer: 'Enterprise Authentication',
      title: 'zkLogin with Google SSO',
      icon: <Key className="w-4 h-4 sm:w-5 sm:h-5 text-cyan-400" />,
      text: 'Enterprise teams log in with corporate Google or Microsoft credentials. No crypto wallets, no seed phrases, no gas fees. Just enterprise SSO that works.',
    },
    {
      layer: 'Data Encryption',
      title: 'SEAL Encryption for Secure Storage',
      icon: <Lock className="w-4 h-4 sm:w-5 sm:h-5 text-indigo-400" />,
      text: 'AI conversations are encrypted using SEAL before being stored immutably on Walrus decentralized storage. Tenant-specific keys ensure complete data isolation between business units.',
    },
    {
      layer: 'Immutable Storage',
      title: 'Walrus Blob Storage',
      icon: <Database className="w-4 h-4 sm:w-5 sm:h-5 text-purple-400" />,
      text: 'Encrypted conversations become immutable blobs on Walrus decentralized storage. Each blob has a unique content-addressed ID. Once stored, it cannot be altered or tampered with.',
    },
    {
      layer: 'Blockchain Verification',
      title: 'Sui Network Anchoring',
      icon: <Link className="w-4 h-4 sm:w-5 sm:h-5 text-cyan-400" />,
      text: 'Each conversation triggers a transaction on the Sui blockchain. The blob ID, timestamp, and cryptographic signatures become permanent proof that can be independently verified by anyone.',
    },
    {
      layer: 'Enterprise SDK',
      title: 'One-Line Integration',
      icon: <Code className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-400" />,
      text: 'Add AnchorProof to your enterprise AI applications with a single import statement. The SDK handles encryption, storage, and verification automatically.',
    },
    {
      layer: 'Compliance & Reporting',
      title: 'Audit Logs and Reports',
      icon: <FileCheck className="w-4 h-4 sm:w-5 sm:h-5 text-amber-400" />,
      text: 'Enterprise teams get detailed audit logs showing every AI conversation. Generate cryptographically verified compliance reports with blob IDs, Sui transaction hashes, and QR codes for instant verification.',
    },
  ];

  return (
    <section
      id="primitives"
      className="py-16 sm:py-20 md:py-36 bg-slate-950 border-t border-slate-800/50"
    >
      <Container>
        <div className="max-w-3xl mb-8 sm:mb-14">
          <span className="text-[10px] sm:text-xs font-mono font-bold uppercase tracking-widest text-indigo-400 bg-indigo-400/5 px-3 py-1.5 rounded-lg border border-indigo-400/20 inline-block mb-3 sm:mb-4">
            Enterprise Architecture
          </span>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white tracking-tight">
            Complete visibility into every AI conversation.
          </h2>
          <p className="mt-3 sm:mt-4 text-sm sm:text-base text-slate-400 max-w-2xl">
            AnchorProof gives enterprise teams immutable proof of AI
            conversations, detailed audit logs, and cryptographically verified
            compliance reports.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {blueprints.map((b, i) => (
            <div
              key={i}
              className="group p-5 sm:p-6 md:p-8 bg-slate-900/30 border border-slate-800/50 rounded-xl hover:border-cyan-400/30 hover:bg-slate-900/50 transition-all duration-300"
            >
              <div className="flex items-center gap-3 mb-3 sm:mb-4">
                <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-slate-800/50 flex items-center justify-center group-hover:scale-110 transition-transform">
                  {b.icon}
                </div>
                <span className="text-[8px] sm:text-[10px] font-mono text-cyan-400 font-semibold tracking-wider">
                  {b.layer}
                </span>
              </div>
              <h3 className="text-base sm:text-lg md:text-xl font-bold text-white tracking-tight mt-1">
                {b.title}
              </h3>
              <p className="text-xs sm:text-sm text-slate-400 leading-relaxed mt-1 sm:mt-2">
                {b.text}
              </p>
            </div>
          ))}
        </div>

        <div className="mt-6 sm:mt-8 p-3 sm:p-4 bg-indigo-500/5 border border-indigo-500/20 rounded-lg text-center">
          <p className="text-xs sm:text-sm text-slate-400 font-mono">
            Enterprise teams get complete visibility into AI conversations,
            tamper-proof audit logs, and cryptographically verified compliance
            reports.
          </p>
        </div>
      </Container>
    </section>
  );
}
