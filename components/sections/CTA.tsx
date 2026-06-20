import Link from 'next/link';
import Container from '@/components/ui/Container';
import Button from '@/components/ui/Button';

export default function CTA() {
  return (
    <section className="py-12 sm:py-16 md:py-20 bg-slate-950 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/5 via-indigo-500/5 to-purple-500/5" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-cyan-400/[0.03] rounded-full blur-[120px] pointer-events-none" />

      <Container className="relative z-10 text-center">
        <div className="max-w-3xl mx-auto">
          <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border border-cyan-400/20 bg-cyan-400/5 text-cyan-400 font-mono text-[8px] sm:text-[10px] font-semibold tracking-wider mb-3 sm:mb-4">
            Enterprise AI Governance • Tamper-Proof • Cryptographically Verified
          </span>

          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white tracking-tight">
            Protect your enterprise from AI liability.
          </h2>

          <p className="mt-3 sm:mt-4 text-sm sm:text-base text-slate-400 max-w-2xl mx-auto leading-relaxed">
            Get complete visibility into every AI conversation. Detect tampering instantly. Generate cryptographically verified compliance reports. Protect your organization from regulatory fines and legal exposure.
          </p>

          <div className="mt-6 sm:mt-8 flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4">
            <Link href="/login" className="w-full sm:w-auto">
              <Button variant="primary" size="lg" className="w-full sm:w-auto px-6 sm:px-8 shadow-[0_4px_30px_rgba(99,102,241,0.3)]">
                Start Protecting Your Enterprise
              </Button>
            </Link>
            <a href="#demos" className="w-full sm:w-auto">
              <Button variant="outline" size="lg" className="w-full sm:w-auto px-6 sm:px-8">
                Try an Enterprise Demo
              </Button>
            </a>
          </div>

          <div className="mt-4 sm:mt-6 flex flex-wrap items-center justify-center gap-2 sm:gap-4 text-[10px] sm:text-xs text-slate-500 font-mono">
            <span>Complete conversation history</span>
            <span className="w-0.5 h-3 bg-slate-700 hidden sm:block" />
            <span>Tamper detection</span>
            <span className="w-0.5 h-3 bg-slate-700 hidden sm:block" />
            <span>Audit logs</span>
            <span className="w-0.5 h-3 bg-slate-700 hidden sm:block" />
            <span>Cryptographically verified reports</span>
          </div>
        </div>
      </Container>
    </section>
  );
}