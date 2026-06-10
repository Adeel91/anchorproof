import Container from '../ui/Container';

export default function Footer() {
  return (
    <footer className="border-t border-slate-900 bg-slate-950 py-12 mt-auto">
      <Container className="flex flex-col md:flex-row items-center justify-between gap-6 text-xs text-slate-500 font-mono">
        <div className="flex flex-col gap-2">
          <span className="font-bold tracking-wider text-slate-300">
            © {new Date().getFullYear()} ANCHORPROOF SYSTEMS INC.
          </span>
          <span className="text-slate-600">
            Infrastructure Layer: Sui Network L1 + Walrus Protocol Decentralized
            Blobs.
          </span>
        </div>
        <div className="flex gap-8">
          <a href="#" className="hover:text-slate-300 transition-colors">
            Regulatory Frameworks
          </a>
          <a href="#" className="hover:text-slate-300 transition-colors">
            SOC2 Auditing Logs
          </a>
          <a href="#" className="hover:text-slate-300 transition-colors">
            GDPR / HIPAA Mapping
          </a>
        </div>
      </Container>
    </footer>
  );
}
