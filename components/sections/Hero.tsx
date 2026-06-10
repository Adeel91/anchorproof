import Link from 'next/link';
import Button from '@/components/ui/Button';
import Container from '@/components/ui/Container';

export default function Hero() {
  return (
    <section className="relative min-h-[88vh] flex items-center justify-center py-24 bg-slate-950 overflow-hidden">
      <div className="absolute inset-0 cyber-grid-matrix [mask-image:radial-gradient(ellipse_80%_60%_at_50%_20%,#000_70%,transparent_100%)]" />
      <div className="absolute top-0 left-1/2 w-[1000px] h-[550px] bg-cyan-400/[0.05] rounded-full blur-[160px] pointer-events-none animate-aurora-glow" />

      <Container className="relative z-10 text-left">
        <div className="max-w-5xl">
          <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border border-cyan-400/20 bg-cyan-400/5 text-cyan-400 font-mono text-xs font-semibold tracking-wider mb-6">
            Cryptographic AI Memory Node
          </span>

          <h1 className="text-5xl sm:text-7xl lg:text-8xl font-bold tracking-tighter text-white leading-[1.15] animate-text-pulse select-none">
            Verifiable memory infrastructure <br />
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 via-indigo-400 to-white">
              built for enterprise AI systems.
            </span>
          </h1>

          <p className="mt-8 text-base sm:text-lg lg:text-xl text-slate-400 max-w-3xl leading-relaxed font-light">
            Internal database logs fail federal compliance audits because
            tracking records can be altered post-incident by network
            administrators. **AnchorProof** secures every AI transaction
            client-side, offloading encrypted data batches into decentralized
            storage arrays, and anchoring immutable state records onto L1
            ledgers.
          </p>

          <div className="mt-10 flex flex-col sm:flex-row items-center gap-4">
            <Link href="/login" className="w-full sm:w-auto">
              <Button
                variant="primary"
                className="w-full sm:w-auto h-11 px-8 text-xs font-semibold tracking-wider shadow-[0_4px_20px_rgba(99,102,241,0.25)]"
              >
                Initialize System Console
              </Button>
            </Link>
            <a href="#primitives" className="w-full sm:w-auto">
              <Button
                variant="outline"
                className="w-full sm:w-auto h-11 px-8 text-xs font-semibold tracking-wider text-slate-300"
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
