'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Container from '@/components/ui/Container';
import Button from '@/components/ui/Button';
import {
  Fingerprint,
  Search,
  Loader2,
  CheckCircle,
  Database,
  Link as LinkIcon,
  Shield,
  ExternalLink,
  FileCheck,
  Copy,
} from 'lucide-react';

export default function VerifySection() {
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
    <section className="py-16 sm:py-20 md:py-36 bg-slate-950 border-b border-slate-800/50">
      <Container>
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8 sm:mb-10">
            <span className="text-[10px] sm:text-xs font-mono font-bold uppercase tracking-widest text-amber-400 bg-amber-400/5 px-3 py-1.5 rounded-lg border border-amber-400/20 inline-block mb-3 sm:mb-4">
              Public Verification
            </span>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white tracking-tight">
              Verify any conversation instantly
            </h2>
            <p className="mt-3 sm:mt-4 text-sm sm:text-base text-slate-400 max-w-2xl mx-auto">
              Anyone can verify the authenticity and integrity of any
              AnchorProof verified conversation — no login required.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="p-1.5 rounded-lg bg-emerald-500/10 mt-0.5">
                  <CheckCircle className="w-4 h-4 text-emerald-400" />
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-white">
                    Three Hash Display
                  </h4>
                  <p className="text-xs text-slate-400">
                    Walrus Blob ID · Sui Transaction · AnchorProof
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="p-1.5 rounded-lg bg-blue-500/10 mt-0.5">
                  <Copy className="w-4 h-4 text-blue-400" />
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-white">
                    Copy & Share
                  </h4>
                  <p className="text-xs text-slate-400">
                    Copy any hash or share verification links
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="p-1.5 rounded-lg bg-amber-500/10 mt-0.5">
                  <Shield className="w-4 h-4 text-amber-400" />
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-white">
                    Tamper Detection
                  </h4>
                  <p className="text-xs text-slate-400">
                    Automatically detects if content has been modified
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="p-1.5 rounded-lg bg-purple-500/10 mt-0.5">
                  <FileCheck className="w-4 h-4 text-purple-400" />
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-white">
                    Court-Admissible
                  </h4>
                  <p className="text-xs text-slate-400">
                    Cryptographic proof for compliance and legal use
                  </p>
                </div>
              </div>
            </div>

            <div className="relative">
              <div className="absolute -inset-1 bg-gradient-to-r from-amber-500/20 via-orange-500/20 to-amber-500/20 rounded-xl blur-xl opacity-30" />
              <div className="relative bg-slate-900/80 border border-slate-700/50 rounded-xl p-5 backdrop-blur-sm">
                <div className="flex items-center gap-2 mb-2">
                  <Fingerprint className="w-4 h-4 text-amber-400" />
                  <span className="text-xs font-mono font-semibold text-amber-400 uppercase tracking-wider">
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
                      className="w-full pl-9 pr-3 py-2.5 bg-slate-800/50 border border-slate-700 rounded-lg text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 transition-all"
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
                <div className="flex flex-wrap items-center justify-center gap-3 mt-3 pt-3 border-t border-slate-700/50 text-[10px] text-slate-500">
                  <span className="flex items-center gap-1">
                    <CheckCircle className="w-3 h-3 text-emerald-400/70" />
                    Blockchain
                  </span>
                  <span className="text-slate-700">•</span>
                  <span className="flex items-center gap-1">
                    <Database className="w-3 h-3 text-cyan-400/70" />
                    Walrus
                  </span>
                  <span className="text-slate-700">•</span>
                  <span className="flex items-center gap-1">
                    <LinkIcon className="w-3 h-3 text-blue-400/70" />
                    Sui
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6 text-center">
            <Link href="/verify">
              <Button variant="outline" size="md">
                <ExternalLink className="w-4 h-4 mr-2" />
                Open Full Verify Page
              </Button>
            </Link>
          </div>
        </div>
      </Container>
    </section>
  );
}
