'use client';

import { usePathname } from 'next/navigation';
import Container from '@/components/ui/Container';
import Link from 'next/link';

export default function Footer() {
  const pathname = usePathname();
  const isDashboardPage = pathname?.startsWith('/dashboard') || false;

  const footerMargin = isDashboardPage ? 'ml-64' : 'ml-0';

  return (
    <footer
      className={`border-t border-slate-800/50 bg-slate-950 py-8 mt-auto ${footerMargin}`}
    >
      <Container className="flex flex-col md:flex-row items-center justify-between gap-6 text-[10px] text-slate-500 font-mono">
        <div className="flex flex-col items-center md:items-start gap-1">
          <span className="font-bold tracking-widest text-slate-300 text-xs">
            © {new Date().getFullYear()} AnchorProof
          </span>
          <span className="text-[10px] text-slate-600 text-center md:text-left">
            Verifiable AI Memory Infrastructure
          </span>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2">
          <Link
            href="/industry/banking"
            className="text-slate-500 hover:text-cyan-400 transition-colors tracking-wider uppercase text-[10px]"
          >
            Banking
          </Link>
          <Link
            href="/industry/healthcare"
            className="text-slate-500 hover:text-cyan-400 transition-colors tracking-wider uppercase text-[10px]"
          >
            Healthcare
          </Link>
          <Link
            href="/industry/insurance"
            className="text-slate-500 hover:text-cyan-400 transition-colors tracking-wider uppercase text-[10px]"
          >
            Insurance
          </Link>
          <Link
            href="/industry/government"
            className="text-slate-500 hover:text-cyan-400 transition-colors tracking-wider uppercase text-[10px]"
          >
            Government
          </Link>
          <span className="text-slate-700">|</span>
          <Link
            href="/privacy"
            className="text-slate-500 hover:text-cyan-400 transition-colors tracking-wider uppercase text-[10px]"
          >
            Privacy
          </Link>
          <Link
            href="/terms"
            className="text-slate-500 hover:text-cyan-400 transition-colors tracking-wider uppercase text-[10px]"
          >
            Terms
          </Link>
          <Link
            href="/security"
            className="text-slate-500 hover:text-cyan-400 transition-colors tracking-wider uppercase text-[10px]"
          >
            Security
          </Link>
        </div>
      </Container>
    </footer>
  );
}
