'use client';

import {
  useWallets,
  useConnectWallet,
  useCurrentAccount,
} from '@mysten/dapp-kit';
import { isEnokiWallet } from '@mysten/enoki';
import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { getEnokiProfile } from '@/lib/enoki/auth';

interface EnokiWalletWithProvider {
  provider?: string;
  name?: string;
}

export function LoginForm() {
  const wallets = useWallets();
  const currentAccount = useCurrentAccount();
  const { mutate: connectWallet } = useConnectWallet();
  const router = useRouter();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const syncAttempted = useRef(false);

  const enokiWallets = wallets.filter(isEnokiWallet);
  const googleWallet = enokiWallets.find(
    (wallet) =>
      (wallet as EnokiWalletWithProvider).provider === 'google' ||
      wallet.name === 'Enoki zkLogin'
  );

  useEffect(() => {
    if (!currentAccount?.address || !googleWallet || syncAttempted.current)
      return;

    const finalizeLoginAndSyncDb = async () => {
      syncAttempted.current = true;
      setLoading(true);

      try {
        const suiAddress = currentAccount.address;

        const profile = await getEnokiProfile(googleWallet);

        let email = profile?.email || null;
        let name = profile?.name || null;

        if (!email) {
          email = `user-${suiAddress.slice(0, 8)}@anchorproof.com`;
          name = 'User';
        }

        const emailDomain = email.split('@')[1];
        const isGmail =
          emailDomain === 'gmail.com' || emailDomain === 'googlemail.com';

        const syncResponse = await fetch('/api/tenant', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            suiAddress,
            email,
            name: name || email.split('@')[0],
            emailDomain,
            isPersonal: isGmail,
          }),
        });

        if (!syncResponse.ok) {
          const errorData = await syncResponse.json();
          throw new Error(
            errorData.error || 'Database tenant allocation failed.'
          );
        }

        const data = await syncResponse.json();

        document.cookie = `anchorproof-session=${data.user.id}; path=/; max-age=604800; SameSite=Lax`;

        router.push('/dashboard');
      } catch (error) {
        const err = error as Error;
        console.error('Sync error:', err);
        setError(err.message || 'Failed to create tenant profile.');
        setLoading(false);
        syncAttempted.current = false;
      }
    };

    finalizeLoginAndSyncDb();
  }, [currentAccount, googleWallet, router]);

  const handleGoogleLogin = () => {
    setLoading(true);
    setError(null);

    const targetWallet = googleWallet || enokiWallets[0];

    if (!targetWallet) {
      setError('Wallet adapter not ready.');
      setLoading(false);
      return;
    }

    connectWallet(
      { wallet: targetWallet },
      {
        onError: (err) => {
          console.error('Connection failed:', err);
          setError('Authentication failed.');
          setLoading(false);
        },
      }
    );
  };

  return (
    <main className="relative min-h-screen w-full flex items-center justify-center bg-[#030712] overflow-hidden px-4 select-none">
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#1f2937_1px,transparent_1px),linear-gradient(to_bottom,#1f2937_1px,transparent_1px)] bg-[size:4rem_4rem] opacity-25" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-indigo-600/10 blur-[140px] rounded-full pointer-events-none" />

      <div className="relative w-full max-w-md border border-gray-800/80 bg-gray-900/30 backdrop-blur-2xl p-8 sm:p-10 rounded-2xl shadow-[0_0_60px_0_rgba(0,0,0,0.7)] flex flex-col">
        <div className="flex flex-col items-center mb-10 text-center">
          <div className="relative w-14 h-14 rounded-xl bg-gradient-to-br from-indigo-500 via-purple-500 to-cyan-400 p-[1px] shadow-[0_0_40px_rgba(99,102,241,0.25)] mb-6">
            <div className="w-full h-full bg-gray-950 rounded-xl flex items-center justify-center">
              <div className="w-5 h-5 rounded bg-gradient-to-tr from-indigo-400 to-cyan-400 animate-spin [animation-duration:12s]" />
            </div>
          </div>
          <h1 className="text-2xl font-mono font-black tracking-widest bg-clip-text text-transparent bg-gradient-to-b from-white via-gray-200 to-gray-500 uppercase">
            Launch Portal
          </h1>
          <p className="text-[10px] font-mono font-bold text-gray-500 mt-2.5 uppercase tracking-[0.25em]">
            Enterprise Cryptographic Auditing
          </p>
        </div>

        <div className="flex-1 flex flex-col justify-center">
          <button
            onClick={handleGoogleLogin}
            disabled={loading}
            className="w-full h-12 flex items-center justify-center gap-3.5 rounded-xl font-mono font-bold text-xs uppercase tracking-widest transition-all duration-200 bg-gray-50 text-gray-950 hover:bg-white active:scale-[0.98] disabled:opacity-40 disabled:pointer-events-none shadow-[0_4px_25px_rgba(255,255,255,0.06)] cursor-pointer"
          >
            {loading ? (
              <div className="flex items-center gap-3">
                <div className="w-4 h-4 border-2 border-gray-950 border-t-transparent rounded-full animate-spin" />
                <span className="text-gray-700">
                  Finalizing Tenant Profile...
                </span>
              </div>
            ) : (
              <>
                <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22l.81-.63z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1C7.7 1 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                  />
                </svg>
                <span>Sign In with Google Workspace</span>
              </>
            )}
          </button>

          {error && (
            <div className="mt-5 flex items-start gap-3 p-3.5 rounded-xl bg-red-950/20 border border-red-900/30">
              <span className="w-1.5 h-1.5 rounded-full bg-red-400 mt-1.5 shrink-0" />
              <p className="text-[10px] font-mono font-medium text-red-400/90 tracking-wide leading-relaxed text-left">
                {error}
              </p>
            </div>
          )}
        </div>

        <div className="mt-12 pt-6 border-t border-gray-800/50 flex items-center justify-between text-[9px] font-mono text-gray-600 uppercase tracking-widest">
          <span className="flex items-center gap-1.5">
            <span className="w-1 h-1 bg-cyan-400 rounded-full shadow-[0_0_6px_#22d3ee]" />
            ZK-SUI Ledger Active
          </span>
          <span>v0.2.0-Alpha</span>
        </div>
      </div>
    </main>
  );
}
