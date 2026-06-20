import Container from '@/components/ui/Container';
import { AlertTriangle, Database, ShieldOff } from 'lucide-react';

export default function Problem() {
  return (
    <section
      id="problem"
      className="py-12 sm:py-16 md:py-20 border-y border-slate-800/50 bg-slate-900/20"
    >
      <Container>
        <div className="max-w-3xl mx-auto text-center mb-10 sm:mb-14">
          <span className="text-[10px] sm:text-xs font-mono font-bold uppercase tracking-widest text-red-400 bg-red-400/5 px-3 py-1.5 rounded-lg border border-red-400/20 inline-block mb-3 sm:mb-4">
            The Enterprise AI Liability Crisis
          </span>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white tracking-tight">
            If you can&apos;t prove what your AI said,{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-400 to-amber-400">
              you can&apos;t defend yourself.
            </span>
          </h2>
          <p className="mt-3 sm:mt-4 text-sm sm:text-base text-slate-400 max-w-2xl mx-auto">
            Enterprises are facing lawsuits and regulatory fines over AI
            statements they can&apos;t verify. Internal databases can be edited.
            Courts and regulators require immutable, cryptographically
            verifiable evidence.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
          <div className="p-5 sm:p-6 bg-slate-900/50 border border-slate-800/50 rounded-xl hover:border-red-400/30 transition-all">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg bg-red-500/10 flex items-center justify-center mb-3 sm:mb-4">
              <AlertTriangle className="w-5 h-5 sm:w-6 sm:h-6 text-red-400" />
            </div>
            <h3 className="text-base sm:text-lg font-bold text-white">
              Air Canada Lost in Court
            </h3>
            <p className="text-xs sm:text-sm text-slate-400 mt-2 leading-relaxed">
              Air Canada tried to deny a refund their AI chatbot promised. The
              court ruled against them. Companies are fully liable for
              everything their AI systems say. Internal database records were
              rejected as a defense.
            </p>
          </div>

          <div className="p-5 sm:p-6 bg-slate-900/50 border border-slate-800/50 rounded-xl hover:border-red-400/30 transition-all">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg bg-amber-500/10 flex items-center justify-center mb-3 sm:mb-4">
              <Database className="w-5 h-5 sm:w-6 sm:h-6 text-amber-400" />
            </div>
            <h3 className="text-base sm:text-lg font-bold text-white">
              Your Logs Can Be Edited
            </h3>
            <p className="text-xs sm:text-sm text-slate-400 mt-2 leading-relaxed">
              Internal databases and logs can be altered by anyone with access.
              Courts need evidence that cannot be tampered with. Ordinary
              databases don&apos;t provide cryptographic proof.
            </p>
          </div>

          <div className="p-5 sm:p-6 bg-slate-900/50 border border-slate-800/50 rounded-xl hover:border-red-400/30 transition-all">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg bg-red-500/10 flex items-center justify-center mb-3 sm:mb-4">
              <ShieldOff className="w-5 h-5 sm:w-6 sm:h-6 text-red-400" />
            </div>
            <h3 className="text-base sm:text-lg font-bold text-white">
              EU AI Act Fines
            </h3>
            <p className="text-xs sm:text-sm text-slate-400 mt-2 leading-relaxed">
              Starting August 2026, fines go up to 35 million euros or 7% of
              global revenue. Without cryptographic proof, you cannot
              demonstrate compliance or defend yourself.
            </p>
          </div>
        </div>
      </Container>
    </section>
  );
}
