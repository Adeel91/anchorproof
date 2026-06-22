'use client';

import Link from 'next/link';
import Container from '@/components/ui/Container';
import Button from '@/components/ui/Button';
import {
  Brain,
  CheckCircle,
  Zap,
  TrendingUp,
  FileText,
  Shield,
} from 'lucide-react';

export default function AgenticSection() {
  return (
    <section className="py-16 sm:py-20 md:py-36 bg-slate-900/20 border-y border-slate-800/50">
      <Container>
        <div className="max-w-3xl mx-auto text-center mb-8 sm:mb-12">
          <span className="text-[10px] sm:text-xs font-mono font-bold uppercase tracking-widest text-purple-400 bg-purple-400/5 px-3 py-1.5 rounded-lg border border-purple-400/20 inline-block mb-3 sm:mb-4">
            Agentic Web
          </span>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white tracking-tight">
            AI-powered autonomous verification
          </h2>
          <p className="mt-3 sm:mt-4 text-sm sm:text-base text-slate-400 max-w-2xl mx-auto">
            Our Agentic AI automatically analyzes and verifies conversations,
            making intelligent decisions with cryptographic proof.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
          <div className="p-6 bg-slate-900/50 border border-slate-800/50 rounded-xl hover:border-purple-400/30 transition-all">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 rounded-lg bg-purple-500/10">
                <Brain className="w-5 h-5 text-purple-400" />
              </div>
              <h3 className="text-sm font-semibold text-white">
                Autonomous Decision Making
              </h3>
            </div>
            <div className="space-y-2 text-sm text-slate-400">
              <p className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-400 mt-0.5 flex-shrink-0" />
                <span>AI analyzes conversations for compliance value</span>
              </p>
              <p className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-400 mt-0.5 flex-shrink-0" />
                <span>Decides to verify, delete, or hold for review</span>
              </p>
              <p className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-400 mt-0.5 flex-shrink-0" />
                <span>
                  Provides reasoning with confidence, risk, and compliance
                  scores
                </span>
              </p>
            </div>
          </div>

          <div className="p-6 bg-slate-900/50 border border-slate-800/50 rounded-xl hover:border-purple-400/30 transition-all">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 rounded-lg bg-indigo-500/10">
                <Zap className="w-5 h-5 text-indigo-400" />
              </div>
              <h3 className="text-sm font-semibold text-white">
                Real-Time Analysis
              </h3>
            </div>
            <div className="space-y-2 text-sm text-slate-400">
              <p className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-400 mt-0.5 flex-shrink-0" />
                <span>Processes unverified conversations automatically</span>
              </p>
              <p className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-400 mt-0.5 flex-shrink-0" />
                <span>Live dashboard with decision tracking</span>
              </p>
              <p className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-400 mt-0.5 flex-shrink-0" />
                <span>
                  Smart categorization: financial, compliance, sensitive,
                  business, casual
                </span>
              </p>
            </div>
          </div>
        </div>

        <div className="mt-6 p-4 bg-purple-500/5 border border-purple-500/20 rounded-xl text-center max-w-2xl mx-auto">
          <div className="flex flex-wrap items-center justify-center gap-4 text-xs text-slate-400">
            <span className="flex items-center gap-1.5">
              <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
              <span>Avg. confidence: 85%</span>
            </span>
            <span className="text-slate-700">|</span>
            <span className="flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-amber-400" />
              <span>Automatic categorization</span>
            </span>
            <span className="text-slate-700">|</span>
            <span className="flex items-center gap-1.5">
              <Shield className="w-3.5 h-3.5 text-emerald-400" />
              <span>100% compliance coverage</span>
            </span>
          </div>
        </div>

        <div className="text-center mt-6">
          <Link href="/dashboard/agentic">
            <Button variant="outline" size="md">
              <Brain className="w-4 h-4 mr-2" />
              Explore Agentic Dashboard
            </Button>
          </Link>
        </div>
      </Container>
    </section>
  );
}
