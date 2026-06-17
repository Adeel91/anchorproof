import Link from 'next/link';
import Button from '@/components/ui/Button';
import Container from '@/components/ui/Container';

export default function Hero() {
  return (
    <section className="relative min-h-[85vh] flex items-center justify-center py-16 sm:py-24 bg-slate-950 overflow-hidden">
      <div className="absolute inset-0 cyber-grid-matrix [mask-image:radial-gradient(ellipse_80%_60%_at_50%_20%,#000_70%,transparent_100%)]" />
      <div className="absolute top-0 left-1/2 w-[800px] lg:w-[1000px] h-[450px] lg:h-[550px] bg-cyan-400/[0.05] rounded-full blur-[160px] pointer-events-none animate-aurora-glow" />

      <Container className="relative z-10 text-left">
        <div className="max-w-4xl lg:max-w-5xl">
          <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border border-cyan-400/20 bg-cyan-400/5 text-cyan-400 font-mono text-[10px] sm:text-xs font-semibold tracking-wider mb-4 sm:mb-6">
            Cryptographic AI Memory Node
          </span>

          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-bold tracking-tighter text-white leading-[1.1] select-none">
            Verifiable memory infrastructure{' '}
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 via-indigo-400 to-white">
              built for enterprise AI systems.
            </span>
          </h1>

          <p className="mt-4 sm:mt-6 text-sm sm:text-base md:text-lg lg:text-xl text-slate-400 max-w-2xl lg:max-w-3xl leading-relaxed font-light">
            Internal database logs fail federal compliance audits because
            tracking records can be altered post-incident by network
            administrators. <span className="text-white font-medium">AnchorProof</span> secures every AI transaction
            client-side, offloading encrypted data batches into decentralized
            storage arrays, and anchoring immutable state records onto L1
            ledgers.
          </p>

          <div className="mt-6 sm:mt-8 flex flex-col sm:flex-row items-center gap-3 sm:gap-4">
            <Link href="/login" className="w-full sm:w-auto">
              <Button
                variant="primary"
                size="lg"
                className="w-full sm:w-auto px-6 sm:px-8 shadow-[0_4px_30px_rgba(99,102,241,0.3)]"
              >
                Initialize System Console
              </Button>
            </Link>
            <a href="#primitives" className="w-full sm:w-auto">
              <Button
                variant="outline"
                size="lg"
                className="w-full sm:w-auto px-6 sm:px-8"
              >
                View Architecture Specs
              </Button>
            </a>
          </div>
        </div>
      </Container>
    </section>
  );
}