'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { enokiFlow } from '@/lib/enoki/auth';
import { Ed25519Keypair } from '@mysten/sui/keypairs/ed25519';
import Container from '@/components/ui/Container';
import Button from '@/components/ui/Button';

export default function Header() {
  const [address, setAddress] = useState<string | null>(null);
  const pathname = usePathname();

  useEffect(() => {
    const checkSession = async () => {
      try {
        const session = await enokiFlow.getSession();
        if (session?.ephemeralKeyPair) {
          const privateKeyBytes = Uint8Array.from(
            Buffer.from(session.ephemeralKeyPair, 'base64')
          );
          const keypair = Ed25519Keypair.fromSecretKey(privateKeyBytes);
          const suiAddress = keypair.getPublicKey().toSuiAddress();

          document.cookie = `anchorproof-session=${suiAddress}; path=/; max-age=604800; SameSite=Lax`;
          setAddress(suiAddress);
        }
      } catch (error) {
        console.error('Session check failed:', error);
      }
    };

    checkSession();
  }, []);

  const handleLogout = async () => {
    await enokiFlow.logout();
    document.cookie =
      'anchorproof-session=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
    window.location.href = '/login';
  };

  const displayAddress = address
    ? `${address.slice(0, 6)}...${address.slice(-4)}`
    : '';

  return (
    <header className="fixed top-0 inset-x-0 h-20 border-b border-slate-900 bg-slate-950/70 backdrop-blur-xl z-50 transition-all">
      <Container className="h-full flex items-center justify-between">
        <Link
          href="/"
          className="flex items-center gap-3.5 font-mono font-black tracking-widest text-lg text-white group"
        >
          <div className="w-6 h-6 rounded bg-gradient-to-br from-indigo-500 via-purple-500 to-cyan-400 shadow-[0_0_15px_rgba(0,242,255,0.4)] group-hover:rotate-90 transition-transform duration-500" />
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400 group-hover:to-white transition-all">
            ANCHORPROOF
          </span>
        </Link>

        {/* Show nav only on landing page */}
        {pathname === '/' && (
          <nav className="hidden lg:flex items-center gap-12 text-xs font-mono font-bold uppercase tracking-widest text-slate-400">
            <Link
              href="#liability"
              className="hover:text-cyan-400 transition-colors relative group"
            >
              The Liability
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-cyan-400 group-hover:w-full transition-all" />
            </Link>
            <Link
              href="#primitives"
              className="hover:text-cyan-400 transition-colors relative group"
            >
              Core Architecture
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-cyan-400 group-hover:w-full transition-all" />
            </Link>
            <Link
              href="#capabilities"
              className="hover:text-cyan-400 transition-colors relative group"
            >
              Technical Specs
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-cyan-400 group-hover:w-full transition-all" />
            </Link>
          </nav>
        )}

        <div className="flex items-center gap-6">
          {address ? (
            <>
              <div className="hidden xl:flex items-center gap-2 text-[10px] font-mono font-extrabold tracking-widest text-cyan-400 bg-cyan-400/5 border border-cyan-400/20 px-3 py-1.5 rounded uppercase">
                <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
                {displayAddress}
              </div>
              <Button
                variant="outline"
                onClick={handleLogout}
                className="h-11 px-6 text-xs font-bold font-mono uppercase tracking-widest"
              >
                Sign Out
              </Button>
            </>
          ) : (
            // Show login button on all pages except login page itself
            pathname !== '/login' && (
              <Link href="/login">
                <Button
                  variant="primary"
                  className="h-11 px-6 text-xs font-bold font-mono uppercase tracking-widest shadow-[0_0_20px_rgba(99,102,241,0.2)]"
                >
                  Launch Portal
                </Button>
              </Link>
            )
          )}
        </div>
      </Container>
    </header>
  );
}
