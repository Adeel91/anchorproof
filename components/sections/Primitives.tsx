import Container from '@/components/ui/Container';

export default function Primitives() {
  const blueprints = [
    {
      layer: 'Directory Authentication',
      title: 'zkLogin Directory Integration (via Enoki)',
      text: 'Removes Web3 onboarding friction. Enterprise operators log in using standard corporate Google or Microsoft Azure SSO credentials. The system automatically provisions deterministic, zero-knowledge signing addresses on the Sui ledger, eliminating manual seed phrase storage or gas configuration management from the browser client.',
    },
    {
      layer: 'Cryptographic Data Storage',
      title: 'Content-Addressable Walrus Quilts',
      text: 'AI text payloads are encrypted client-side inside the browser window using tenant-isolated keys before transmission. Conversations are bundled into immutable data batches called Quilts (holding up to 666 message records per batch) and dispatched directly to the decentralized Walrus storage network via content-addressed IDs.',
    },
    {
      layer: 'Public Ledger Notarization',
      title: 'Atomic Sui Network Anchoring',
      text: 'Every verified conversation Quilt package triggers a system-sponsored transaction block on the high-throughput Sui Network layer. This operation records the unique content blob ID, exact Unix transaction timestamp, and cryptographic signature verification strings as permanent, third-party verifiable proof of system context history.',
    },
    {
      layer: 'Security Namespace Seals',
      title: 'Isolated Multi-Tenant Namespaces',
      text: 'Engineered with strict data partitioning logic enforced at the database layer. This blocks cross-tenant visibility vectors completely. Compliance officers can establish rule-based access control permissions and configure immutable time-locks to guarantee the 7-year data retention holds required for institutional audit standards.',
    },
  ];

  const moduleNumber = (i: number) => `Module 0${i + 1}`;

  return (
    <section
      id="primitives"
      className="py-28 bg-slate-950 relative z-10 border-t border-slate-800/50"
    >
      <Container>
        <div className="max-w-3xl mb-16">
          <span className="text-xs font-mono font-bold uppercase tracking-widest text-indigo-400">
            System Core Parameters
          </span>
          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mt-4 tracking-tight">
            Structural Core Mechanics
          </h2>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {blueprints.map((b, i) => (
            <div
              key={i}
              className="neon-border-glow p-8 bg-slate-950 flex flex-col gap-3 transition-all duration-300 rounded-xl border border-slate-800/50 hover:border-cyan-400/30"
            >
              <div className="text-xs font-mono text-cyan-400 font-semibold tracking-wider">
                {`${moduleNumber(i)} // ${b.layer}`}
              </div>
              <h3 className="text-xl sm:text-2xl font-bold text-white tracking-tight mt-1">
                {b.title}
              </h3>
              <p className="text-sm sm:text-base text-slate-400 leading-relaxed font-light mt-2">
                {b.text}
              </p>
            </div>
          ))}
        </div>
      </Container>
    </section>
  );
}