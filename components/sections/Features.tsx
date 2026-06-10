import Container from '../ui/Container';

export default function Features() {
  const specs = [
    {
      cat: 'DATA PRIVACY',
      label: 'Zero-Knowledge Encryption',
      text: 'Plaintext conversion strings are entirely encrypted in the browser workspace before network transmission. Cloud infrastructures never process raw data text records.',
    },
    {
      cat: 'INTEGRATION LOGIC',
      label: 'One-Line Execution SDK',
      text: 'Integrate auditable memory checks into active production generative AI middleware layers in under five minutes with a single import statement configuration.',
    },
    {
      cat: 'DATABASE SECURITY',
      label: 'Partitioned Tenant Schemas',
      text: 'Enforces complete multi-tenant boundaries at the database layout layer, fully blocking data leakage across subscribing corporate organizations.',
    },
    {
      cat: 'USER MANAGEMENT',
      label: 'Sponsored Transaction Pools',
      text: 'All transaction gas fees on the L1 ledger are sponsored natively behind the scenes. Enterprise administrators never hold, buy, or execute crypto tokens.',
    },
    {
      cat: 'COMPLIANCE METRICS',
      label: 'Regulatory Framework Native',
      text: 'Produces structured, unalterable system metadata summaries mapped directly to satisfy incoming compliance checks for HIPAA, GDPR, and the EU AI Act.',
    },
    {
      cat: 'LITIGATION CORE',
      label: 'Court-Admissible Attestations',
      text: 'Maintains clear cryptographic chain-of-custody logs that eliminate corporate liability disputes during independent regulatory reviews.',
    },
  ];

  return (
    <section
      id="capabilities"
      className="py-32 border-t border-slate-900 bg-slate-900/[0.02]"
    >
      <Container>
        <div className="max-w-3xl mb-24">
          <span className="text-xs font-mono font-bold uppercase tracking-widest text-cyan-400">
            System Capabilities Index
          </span>
          <h2 className="text-2xl sm:text-4xl font-mono font-black text-white mt-4 uppercase tracking-tight">
            Institutional Technical Parameters
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {specs.map((item, idx) => (
            <div key={idx} className="neon-border-glow p-6 bg-slate-950">
              <div className="text-[10px] font-mono text-slate-500 font-bold uppercase tracking-wider">
                {item.cat}
              </div>
              <h4 className="text-base font-bold text-slate-200 mt-2 font-mono uppercase tracking-tight">
                {item.label}
              </h4>
              <p className="text-xs sm:text-sm text-slate-400 mt-2 leading-relaxed font-sans font-light">
                {item.text}
              </p>
            </div>
          ))}
        </div>
      </Container>
    </section>
  );
}
