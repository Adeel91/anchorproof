import Container from '@/components/ui/Container';
import { Shield, FileCheck, Eye, FileText } from 'lucide-react';

export default function Solution() {
  return (
    <section
      id="solution"
      className="py-16 sm:py-20 md:py-36 bg-slate-900/10 border-y border-slate-800/50"
    >
      <Container>
        <div className="max-w-3xl mx-auto text-center mb-8 sm:mb-14">
          <span className="text-[10px] sm:text-xs font-mono font-bold uppercase tracking-widest text-cyan-400 bg-cyan-400/5 px-3 py-1.5 rounded-lg border border-cyan-400/20 inline-block mb-3 sm:mb-4">
            For Enterprise Teams
          </span>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white tracking-tight">
            See every AI conversation. Detect tampering. Generate compliance
            reports.
          </h2>
          <p className="mt-3 sm:mt-4 text-sm sm:text-base text-slate-400 max-w-2xl mx-auto">
            AnchorProof gives enterprise leaders the cryptographic proof they
            need to protect their organization from AI liability.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          <div className="text-center p-4 sm:p-6 border border-slate-800/50 rounded-xl bg-slate-900/20 hover:border-cyan-400/30 transition-all">
            <div className="w-12 h-12 sm:w-14 sm:h-14 mx-auto rounded-full bg-cyan-500/10 flex items-center justify-center mb-3 sm:mb-4">
              <Eye className="w-5 h-5 sm:w-6 sm:h-6 text-cyan-400" />
            </div>
            <h3 className="text-sm sm:text-base font-bold text-white">
              View Every Conversation
            </h3>
            <p className="text-xs sm:text-sm text-slate-400 mt-2 leading-relaxed">
              Enterprise dashboard shows every AI conversation with full
              details. See exactly what your AI said to customers and employees
              with cryptographic proof.
            </p>
          </div>

          <div className="text-center p-4 sm:p-6 border border-slate-800/50 rounded-xl bg-slate-900/20 hover:border-cyan-400/30 transition-all">
            <div className="w-12 h-12 sm:w-14 sm:h-14 mx-auto rounded-full bg-amber-500/10 flex items-center justify-center mb-3 sm:mb-4">
              <Shield className="w-5 h-5 sm:w-6 sm:h-6 text-amber-400" />
            </div>
            <h3 className="text-sm sm:text-base font-bold text-white">
              Detect Tampering
            </h3>
            <p className="text-xs sm:text-sm text-slate-400 mt-2 leading-relaxed">
              Instantly see if any AI response has been altered. Cryptographic
              verification shows you exactly what was said, when, and by whom.
            </p>
          </div>

          <div className="text-center p-4 sm:p-6 border border-slate-800/50 rounded-xl bg-slate-900/20 hover:border-cyan-400/30 transition-all">
            <div className="w-12 h-12 sm:w-14 sm:h-14 mx-auto rounded-full bg-indigo-500/10 flex items-center justify-center mb-3 sm:mb-4">
              <FileText className="w-5 h-5 sm:w-6 sm:h-6 text-indigo-400" />
            </div>
            <h3 className="text-sm sm:text-base font-bold text-white">
              Detailed Audit Logs
            </h3>
            <p className="text-xs sm:text-sm text-slate-400 mt-2 leading-relaxed">
              Complete audit trail of every AI interaction. See who accessed
              what, when, and from where. Perfect for internal compliance and
              regulatory reviews.
            </p>
          </div>

          <div className="text-center p-4 sm:p-6 border border-slate-800/50 rounded-xl bg-slate-900/20 hover:border-cyan-400/30 transition-all">
            <div className="w-12 h-12 sm:w-14 sm:h-14 mx-auto rounded-full bg-emerald-500/10 flex items-center justify-center mb-3 sm:mb-4">
              <FileCheck className="w-5 h-5 sm:w-6 sm:h-6 text-emerald-400" />
            </div>
            <h3 className="text-sm sm:text-base font-bold text-white">
              Compliance Reports
            </h3>
            <p className="text-xs sm:text-sm text-slate-400 mt-2 leading-relaxed">
              Generate cryptographically verified compliance reports with blob
              IDs, Sui transaction hashes, and QR codes for instant
              verification.
            </p>
          </div>
        </div>
      </Container>
    </section>
  );
}
