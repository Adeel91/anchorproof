'use client';

import { useState } from 'react';
import { handleGoogleSSORedirect } from '@/lib/enoki/auth';
import Container from '@/components/ui/Container';
import Button from '@/components/ui/Button';

export default function LoginPage() {
  const [isRedirecting, setIsRedirecting] = useState(false);

  const handleSSOTrigger = async () => {
    setIsRedirecting(true);
    try {
      if (typeof window !== 'undefined') {
        await handleGoogleSSORedirect(window);
      }
    } catch (error) {
      console.error('SSO redirection failed:', error);
      setIsRedirecting(false);
    }
  };

  return (
    <main className="relative min-h-[85vh] flex items-center justify-center py-20 bg-slate-950 overflow-hidden">
      <div className="absolute inset-0 cyber-grid-matrix [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)]" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] bg-cyan-400/[0.04] rounded-full blur-[140px] pointer-events-none animate-aurora-glow" />

      <Container className="relative z-10 flex justify-center">
        <div className="w-full max-w-md bg-slate-950/80 border border-slate-900/80 p-8 sm:p-10 backdrop-blur-xl shadow-[0_4px_30px_rgba(0,242,255,0.04)] neon-border-glow rounded-xl">
          <div className="text-center mb-6">
            <div className="w-6 h-6 rounded-md bg-gradient-to-br from-indigo-500 to-cyan-400 mx-auto shadow-[0_0_15px_rgba(0,242,255,0.3)] mb-4" />
            <h2 className="text-xl font-bold tracking-tight text-white font-heading">
              Authenticate Node
            </h2>
            <p className="text-xs text-slate-500 font-mono mt-1.5 tracking-wide">
              Secure Multi-Tenant ZK Gateway
            </p>
          </div>

          <div className="w-full h-px bg-slate-900/60 my-5" />

          <p className="text-xs sm:text-sm text-slate-400 font-sans leading-relaxed text-center mb-6 font-light">
            Access requires authentication via corporate single sign-on (SSO).
            Your secure cryptographic key-pair address is derived
            deterministically via zero-knowledge proofs.
          </p>

          <Button
            onClick={handleSSOTrigger}
            disabled={isRedirecting}
            variant="primary"
            className="w-full h-11 text-xs font-semibold tracking-wide gap-2.5"
          >
            {isRedirecting ? (
              <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path
                    fill="currentColor"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="currentColor"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                  />
                </svg>
                Sign in with Google SSO
              </>
            )}
          </Button>

          <div className="w-full h-px bg-slate-900/60 my-5" />

          <div className="text-[10px] font-mono text-slate-500 text-center tracking-wide leading-relaxed">
            Infrastructure Status: Sponsored Gas Layer Active <br />
            No Seed Phrases — No Wallet Required
          </div>
        </div>
      </Container>
    </main>
  );
}
