'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { enokiFlow } from '@/lib/enoki/auth';
import { Ed25519Keypair } from '@mysten/sui/keypairs/ed25519';
import Container from '@/components/ui/Container';

export default function Dashboard() {
  const [address, setAddress] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const loadSession = async () => {
      try {
        const session = await enokiFlow.getSession();
        console.log('Session:', session);

        if (session?.ephemeralKeyPair) {
          // Reconstruct the keypair from the stored secret
          const privateKeyBytes = Uint8Array.from(
            Buffer.from(session.ephemeralKeyPair, 'base64')
          );
          const keypair = Ed25519Keypair.fromSecretKey(privateKeyBytes);
          const suiAddress = keypair.getPublicKey().toSuiAddress();

          // ✅ SET THE COOKIE HERE - THIS WAS MISSING
          document.cookie = `anchorproof-session=${suiAddress}; path=/; max-age=604800; SameSite=Lax`;

          setAddress(suiAddress);
        }
      } catch (error) {
        console.error('Failed to load session:', error);
      }
      setLoading(false);
    };

    loadSession();
  }, []);

  if (loading) {
    return (
      <main className="py-12 min-h-[90vh]">
        <Container>
          <div className="text-center py-20">
            <p className="text-gray-400">Loading session...</p>
          </div>
        </Container>
      </main>
    );
  }

  if (!address) {
    return (
      <main className="py-12 min-h-[90vh]">
        <Container>
          <div className="text-center py-20">
            <p className="text-gray-400 mb-4">No authenticated session found</p>
            <button
              onClick={() => router.push('/login')}
              className="px-4 py-2 bg-indigo-600 rounded-lg text-white"
            >
              Sign In
            </button>
          </div>
        </Container>
      </main>
    );
  }

  return (
    <main className="py-12 min-h-[90vh]">
      <Container>
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between border-b border-slate-900 pb-8 gap-4">
          <div>
            <span className="text-xs font-mono font-bold text-indigo-400 bg-indigo-500/10 px-2.5 py-1 rounded-md border border-indigo-500/20 uppercase">
              Authenticated Session Active
            </span>
            <h1 className="text-2xl sm:text-4xl font-black text-white mt-3">
              Dashboard
            </h1>
          </div>
        </div>

        {/* Wallet Info Panel */}
        <div className="mt-8 p-5 rounded-xl bg-gradient-to-r from-indigo-500/10 to-cyan-500/10 border border-indigo-500/20">
          <div className="text-xs font-mono text-slate-400 uppercase tracking-wider">
            Active Sui Wallet
          </div>
          <div className="text-sm font-mono text-white mt-1 break-all">
            {address}
          </div>
          <div className="text-xs text-slate-500 mt-2">
            This is your derived Sui address from Google SSO
          </div>
        </div>

        {/* Your existing dashboard content with mock data */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-8">
          <div className="p-5 rounded-xl bg-slate-900/20 border border-slate-900 font-mono">
            <div className="text-slate-500 text-[10px] uppercase font-bold tracking-wider">
              Assigned Sui Node
            </div>
            <div className="text-xs text-slate-300 mt-2 font-semibold break-all">
              {address}
            </div>
          </div>
          <div className="p-5 rounded-xl bg-slate-900/20 border border-slate-900 font-mono">
            <div className="text-slate-500 text-[10px] uppercase font-bold tracking-wider">
              Walrus Namespace
            </div>
            <div className="text-xs text-slate-300 mt-2 font-semibold break-all">
              ns-{address?.slice(0, 16)}
            </div>
          </div>
          <div className="p-5 rounded-xl bg-slate-900/20 border border-slate-900 font-mono">
            <div className="text-slate-500 text-[10px] uppercase font-bold tracking-wider">
              Retention Policy
            </div>
            <div className="text-xs text-indigo-400 mt-2 font-bold uppercase text-[11px]">
              Tier: Pro (7-Year Hold)
            </div>
          </div>
        </div>
      </Container>
    </main>
  );
}
