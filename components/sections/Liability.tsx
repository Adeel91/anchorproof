import Container from '@/components/ui/Container';
import { Gavel, AlertCircle, Scale } from 'lucide-react';

export default function Liability() {
  return (
    <section
      id="liability"
      className="py-12 sm:py-16 md:py-20 border-y border-slate-800/50 bg-slate-950 relative"
    >
      <Container>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
          <div className="lg:col-span-5">
            <span className="text-[10px] sm:text-xs font-mono font-black uppercase tracking-widest text-cyan-400 bg-cyan-400/5 px-3 py-1.5 rounded-lg border border-cyan-400/20 inline-block mb-3 sm:mb-6">
              The Regulatory Hazard Matrix
            </span>
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-white leading-[1.1]">
              Enterprise leaders are{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-indigo-400">
                personally liable for AI statements.
              </span>
            </h2>
            <div className="mt-4 sm:mt-6 flex flex-wrap items-center gap-3 sm:gap-4 text-[10px] sm:text-xs text-slate-500 font-mono">
              <span className="flex items-center gap-2">
                <Gavel className="w-3 h-3 sm:w-4 sm:h-4 text-cyan-400" />
                <span>Legal Precedent</span>
              </span>
              <span className="w-px h-3 sm:h-4 bg-slate-700" />
              <span className="flex items-center gap-2">
                <AlertCircle className="w-3 h-3 sm:w-4 sm:h-4 text-amber-400" />
                <span>EU AI Act 2026</span>
              </span>
            </div>
          </div>

          <div className="lg:col-span-7 space-y-4 sm:space-y-6 text-slate-400 text-sm sm:text-base leading-relaxed">
            <div className="font-mono font-bold text-slate-200 uppercase tracking-wider text-[10px] sm:text-xs bg-slate-900/40 p-3 sm:p-4 border-l-2 border-cyan-400 rounded-r-lg">
              What The Air Canada Case Means For Enterprise Leaders
            </div>

            <p>
              Air Canada tried to avoid responsibility when their AI chatbot
              incorrectly promised a refund. Their defense was that internal
              database records should override what the AI said.
            </p>

            <div className="bg-red-500/5 border border-red-500/20 rounded-lg p-3 sm:p-4">
              <p className="text-xs sm:text-sm text-slate-300">
                The court rejected this argument entirely. The ruling:{' '}
                <span className="text-white font-semibold">
                  companies cannot hide behind internal systems. What your AI
                  says is your responsibility. C-suite leaders are personally
                  exposed.
                </span>
              </p>
            </div>

            <p>
              With the{' '}
              <span className="text-white font-semibold">
                EU AI Act enforcement starting August 2026
              </span>
              , penalties go up to{' '}
              <span className="text-amber-400 font-bold font-mono text-base sm:text-lg">
                35 million euros or 7% of global annual revenue
              </span>
              . Without cryptographic proof, you cannot demonstrate compliance
              or defend your organization.
            </p>

            <div className="flex items-center gap-3 sm:gap-4 text-[10px] sm:text-xs text-slate-500 font-mono pt-2">
              <Scale className="w-3 h-3 sm:w-4 sm:h-4 text-indigo-400" />
              <span>
                AnchorProof provides the cryptographic foundation for
                tamper-proof evidence and regulatory compliance.
              </span>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
