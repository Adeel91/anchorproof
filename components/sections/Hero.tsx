'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Button from '@/components/ui/Button';
import Container from '@/components/ui/Container';
import {
  Fingerprint,
  Search,
  Loader2,
  CheckCircle,
  Database,
  Link as LinkIcon,
  ArrowRight,
  Sparkles,
  Shield,
  Lock,
  Clock,
  Brain,
} from 'lucide-react';

export default function Hero() {
  const router = useRouter();
  const [hash, setHash] = useState('');
  const [loading, setLoading] = useState(false);

  const handleVerify = (e: React.FormEvent) => {
    e.preventDefault();
    if (!hash.trim()) return;
    setLoading(true);
    router.push(`/verify?hash=${hash.trim()}`);
  };

  return (
    <section className="relative min-h-screen flex items-center justify-center py-16 sm:py-20 lg:py-24 bg-slate-950 overflow-hidden">
      <div className="absolute inset-0 cyber-grid-matrix [mask-image:radial-gradient(ellipse_80%_60%_at_50%_20%,#000_70%,transparent_100%)]" />
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-indigo-500/[0.08] rounded-full blur-[120px]" />
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-purple-500/[0.05] rounded-full blur-[100px]" />
      <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-cyan-500/[0.04] rounded-full blur-[100px]" />
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-indigo-500/20 to-transparent" />
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-indigo-500/5 rounded-full blur-3xl" />
      </div>

      <Container className="relative z-10">
        <div className="max-w-5xl mx-auto">
          <div className="flex flex-wrap items-center justify-center gap-2 mb-6">
            <span className="inline-flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full border border-indigo-400/20 bg-indigo-400/5 text-indigo-400 font-mono text-[10px] sm:text-xs font-semibold tracking-wider backdrop-blur-sm">
              <Sparkles className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
              <span className="hidden xs:inline">
                Enterprise AI Memory Infrastructure
              </span>
              <span className="xs:hidden">Enterprise AI</span>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse ml-0.5 sm:ml-1" />
            </span>
            <span className="inline-flex items-center gap-1 px-2 sm:px-3 py-1 sm:py-1.5 rounded-full border border-purple-400/20 bg-purple-400/5 text-purple-400 font-mono text-[9px] sm:text-[10px] font-semibold tracking-wider backdrop-blur-sm">
              <Brain className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
              <span className="hidden xs:inline">Agentic AI</span>
              <span className="xs:hidden">AI</span>
            </span>
          </div>

          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold tracking-tight text-white leading-[1.1] text-center max-w-4xl mx-auto">
            Know exactly what your AI said.{' '}
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 via-purple-400 to-white">
              Protect your company from liability.
            </span>
          </h1>

          <p className="mt-4 sm:mt-6 text-sm sm:text-base md:text-lg text-slate-400 leading-relaxed text-center max-w-2xl mx-auto">
            AnchorProof cryptographically verifies every AI conversation. Detect
            tampering instantly. Generate tamper-proof audit logs and compliance
            reports.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 mt-6 sm:mt-8">
            <Link href="/login" className="w-full sm:w-auto">
              <Button
                variant="primary"
                size="lg"
                className="w-full sm:w-auto px-8 shadow-[0_4px_30px_rgba(99,102,241,0.3)] group"
              >
                <span className="hidden xs:inline">
                  Start Protecting Your Enterprise
                </span>
                <span className="xs:hidden">Get Started</span>
                <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
            <a href="#primitives" className="w-full sm:w-auto">
              <Button
                variant="outline"
                size="lg"
                className="w-full sm:w-auto px-8"
              >
                See How It Works
              </Button>
            </a>
          </div>

          <div className="grid md:grid-cols-2 gap-6 md:gap-10 mt-10">
            <div className="text-center md:text-left flex flex-col justify-center">
              <h3 className="text-sm font-semibold text-white flex items-center justify-center md:justify-start gap-2">
                <Fingerprint className="w-4 h-4 text-indigo-400" />
                Why Verify?
              </h3>
              <div className="space-y-2 mt-2 text-sm text-slate-400">
                <p>✓ Instantly verify any conversation&apos;s authenticity</p>
                <p>✓ Check if the content has been tampered with</p>
                <p>✓ Generate court-admissible proof of integrity</p>
              </div>
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 mt-4 text-xs text-slate-500">
                <span className="flex items-center gap-1">
                  <Shield className="w-3.5 h-3.5 text-emerald-400/70" />
                  Blockchain Verified
                </span>
                <span className="text-slate-700">•</span>
                <span className="flex items-center gap-1">
                  <Database className="w-3.5 h-3.5 text-cyan-400/70" />
                  Walrus Stored
                </span>
                <span className="text-slate-700">•</span>
                <span className="flex items-center gap-1">
                  <LinkIcon className="w-3.5 h-3.5 text-blue-400/70" />
                  Sui Verified
                </span>
              </div>
            </div>

            <div className="relative">
              <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500/20 via-purple-500/20 to-indigo-500/20 rounded-xl blur-xl opacity-30" />
              <div className="relative bg-slate-900/80 border border-slate-700/50 rounded-xl p-5 backdrop-blur-sm">
                <div className="flex items-center gap-2 mb-3">
                  <Fingerprint className="w-4 h-4 text-indigo-400" />
                  <span className="text-xs font-mono font-semibold text-indigo-400 uppercase tracking-wider">
                    Verify Any Conversation
                  </span>
                  <span className="ml-auto flex items-center gap-1.5 text-[10px] text-slate-500">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    Public
                  </span>
                </div>
                <p className="text-xs text-slate-500 mb-3">
                  Enter an AnchorProof hash to verify authenticity and integrity
                </p>
                <form
                  onSubmit={handleVerify}
                  className="flex flex-col sm:flex-row gap-2"
                >
                  <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                    <input
                      type="text"
                      value={hash}
                      onChange={(e) => setHash(e.target.value)}
                      placeholder="Paste AnchorProof hash (0x...)"
                      className="w-full pl-9 pr-3 py-2.5 bg-slate-800/50 border border-slate-700 rounded-lg text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all"
                    />
                  </div>
                  <Button
                    type="submit"
                    variant="primary"
                    size="md"
                    disabled={loading || !hash.trim()}
                    className="w-full sm:w-auto sm:min-w-[120px]"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin mr-2" />
                        Verifying...
                      </>
                    ) : (
                      <>
                        <Fingerprint className="w-4 h-4 mr-2" />
                        Verify
                      </>
                    )}
                  </Button>
                </form>
              </div>
            </div>
          </div>

          <div className="mt-10 pt-6 border-t border-slate-800/50 flex flex-wrap items-center justify-center gap-4 sm:gap-6 text-[10px] sm:text-xs text-slate-500">
            <span className="flex items-center gap-1.5">
              <Shield className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-400/70" />
              SEC & FINRA Compliant
            </span>
            <span className="text-slate-700">|</span>
            <span className="flex items-center gap-1.5">
              <Lock className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-cyan-400/70" />
              End-to-End Encrypted
            </span>
            <span className="text-slate-700">|</span>
            <span className="flex items-center gap-1.5">
              <CheckCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-indigo-400/70" />
              Immutable Records
            </span>
            <span className="text-slate-700">|</span>
            <span className="flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-purple-400/70" />
              Real-Time Audit
            </span>
            <span className="text-slate-700">|</span>
            <span className="flex items-center gap-1.5">
              <Brain className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-purple-400/70" />
              Agentic AI
            </span>
          </div>
        </div>
      </Container>
    </section>
  );
}
