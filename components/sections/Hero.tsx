import Link from 'next/link';
import Button from '@/components/ui/Button';
import Container from '@/components/ui/Container';

export default function Hero() {
  return (
    <section className="relative min-h-[90vh] flex items-center justify-center py-12 sm:py-16 md:py-20 bg-slate-950 overflow-hidden">
      <div className="absolute inset-0 cyber-grid-matrix [mask-image:radial-gradient(ellipse_80%_60%_at_50%_20%,#000_70%,transparent_100%)]" />
      <div className="absolute top-0 left-1/2 w-[800px] lg:w-[1000px] h-[450px] lg:h-[550px] bg-cyan-400/[0.05] rounded-full blur-[160px] pointer-events-none" />

      <Container className="relative z-10 text-center">
        <div className="max-w-4xl mx-auto">
          <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border border-cyan-400/20 bg-cyan-400/5 text-cyan-400 font-mono text-[10px] sm:text-xs font-semibold tracking-wider mb-4 sm:mb-6">
            Enterprise AI Memory Infrastructure
          </span>

          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold tracking-tighter text-white leading-[1.1]">
            Know exactly what your AI said.{' '}
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 via-indigo-400 to-white">
              Protect your company from liability.
            </span>
          </h1>

          <p className="mt-4 sm:mt-6 text-sm sm:text-base md:text-lg text-slate-400 max-w-3xl mx-auto leading-relaxed font-light">
            AnchorProof is an enterprise compliance platform that
            cryptographically verifies every AI conversation. Detect tampering
            instantly. Generate tamper-proof audit logs and compliance reports.
            Protect your organization from regulatory fines and legal exposure.
          </p>

          <div className="mt-6 sm:mt-8 flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4">
            <Link href="/login" className="w-full sm:w-auto">
              <Button
                variant="primary"
                size="lg"
                className="w-full sm:w-auto px-6 sm:px-8 shadow-[0_4px_30px_rgba(99,102,241,0.3)]"
              >
                Start Protecting Your Enterprise
              </Button>
            </Link>
            <a href="#primitives" className="w-full sm:w-auto">
              <Button
                variant="outline"
                size="lg"
                className="w-full sm:w-auto px-6 sm:px-8"
              >
                See How It Works
              </Button>
            </a>
          </div>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-4 sm:gap-6 text-[10px] sm:text-xs text-slate-500 font-mono">
            <span className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span>EU AI Act Compliant</span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
              <span>Tamper-Proof Evidence</span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-400" />
              <span>Cryptographically Verified</span>
            </span>
          </div>
        </div>
      </Container>
    </section>
  );
}
