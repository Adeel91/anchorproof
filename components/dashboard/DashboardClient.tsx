'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Container from '@/components/ui/Container';
import Button from '@/components/ui/Button';

interface Tenant {
  id: string;
  name: string;
  slug: string;
  suiAddress: string;
  walrusNamespace: string;
  subscriptionTier: string;
  emailDomain: string;
}

interface User {
  id: string;
  email: string;
  name: string;
  role: string;
  tenantId: string;
}

export function DashboardClient() {
  const [tenant, setTenant] = useState<Tenant | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('/api/tenant/current');
        if (!response.ok) throw new Error('Failed to fetch');
        const data = await response.json();
        setTenant(data.tenant);
        setUser(data.user);
      } catch (error) {
        console.error(error);
        router.push('/login');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [router]);

  const truncateAddress = (address: string) => {
    if (!address) return '0x0000...0000';
    return `${address.slice(0, 8)}...${address.slice(-8)}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-[#030712] relative select-none">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#1f2937_1px,transparent_1px),linear-gradient(to_bottom,#1f2937_1px,transparent_1px)] bg-[size:4rem_4rem] opacity-25" />
        <div className="relative text-center">
          <div className="w-10 h-10 border-2 border-indigo-500 border-t-transparent rounded-xl animate-spin mb-4 shadow-[0_0_20px_rgba(99,102,241,0.2)]" />
          <p className="text-gray-500 text-xs font-mono font-bold uppercase tracking-[0.2em]">
            Loading secure environment...
          </p>
        </div>
      </div>
    );
  }

  if (!tenant || !user) return null;

  return (
    <main className="relative min-h-screen w-full bg-[#030712] text-gray-200 overflow-hidden font-sans pb-20">
      <Container>
        {/* Header Summary Profile Section */}
        <div className="mt-20 relative border border-gray-800/80 bg-gray-900/10 backdrop-blur-xl p-8 rounded-2xl mb-8 shadow-[0_4px_30px_rgba(0,0,0,0.4)] overflow-hidden">
          <div className="absolute top-0 left-0 w-12 h-[1px] bg-indigo-500 shadow-[0_0_8px_#6366f1]" />
          <div className="absolute top-0 left-0 w-[1px] h-12 bg-indigo-500 shadow-[0_0_8px_#6366f1]" />

          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_8px_#34d399]" />
                <span className="text-[10px] font-bold text-emerald-400 tracking-widest uppercase">
                  Active Session // {tenant.subscriptionTier.toUpperCase()}{' '}
                  Access
                </span>
              </div>
              <h1 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-b from-white via-gray-200 to-gray-400 uppercase tracking-tight">
                {tenant.name}
              </h1>
              <div className="flex items-center gap-3 mt-3 text-xs text-gray-500 font-bold uppercase tracking-wider">
                <span className="text-gray-400 lowercase">{user.email}</span>
                <span className="text-gray-700 font-normal">|</span>
                <span>
                  Role: <span className="text-indigo-400">{user.role}</span>
                </span>
              </div>
            </div>

            <div className="border border-gray-800 bg-black/40 px-5 py-4 rounded-xl min-w-[280px]">
              <span className="text-[10px] font-bold text-gray-600 uppercase tracking-widest block mb-1">
                Enterprise Wallet
              </span>
              <span className="text-sm text-cyan-400 font-bold font-mono break-all block">
                {truncateAddress(tenant.suiAddress)}
              </span>
            </div>
          </div>
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-12">
          <div className="relative group border border-gray-800/80 bg-gray-900/5 hover:bg-gray-900/10 hover:border-gray-700/80 p-5 rounded-xl transition-all duration-300">
            <span className="text-[10px] font-bold text-gray-600 uppercase tracking-widest block">
              Tenant Identifier
            </span>
            <span className="text-sm text-indigo-400 font-bold tracking-wider mt-2 block break-all">
              {tenant.id.slice(0, 16)}...
            </span>
          </div>
          <div className="relative group border border-gray-800/80 bg-gray-900/5 hover:bg-gray-900/10 hover:border-gray-700/80 p-5 rounded-xl transition-all duration-300">
            <span className="text-[10px] font-bold text-gray-600 uppercase tracking-widest block">
              Email Domain
            </span>
            <span className="text-sm text-gray-300 font-bold tracking-wider mt-2 block">
              {tenant.emailDomain}
            </span>
          </div>
          <div className="relative group border border-gray-800/80 bg-gray-900/5 hover:bg-gray-900/10 hover:border-gray-700/80 p-5 rounded-xl transition-all duration-300">
            <span className="text-[10px] font-bold text-gray-600 uppercase tracking-widest block">
              Storage Namespace
            </span>
            <span className="text-sm text-cyan-400 font-bold tracking-wider mt-2 block">
              {tenant.walrusNamespace}
            </span>
          </div>
        </div>

        {/* Two Column Layout - Equal Height */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* API Keys Section */}
          <div className="flex flex-col border border-gray-800/60 rounded-xl overflow-hidden bg-gray-900/5">
            <div className="flex items-center justify-between border-b border-gray-800/60 px-6 py-4">
              <div className="flex items-center gap-2">
                <span className="w-1 h-4 bg-indigo-500 rounded-sm" />
                <h2 className="text-sm font-bold text-white uppercase tracking-wider">
                  API Keys
                </h2>
              </div>
              <Button variant="primary">Generate Key</Button>
            </div>

            <div className="flex flex-col items-center justify-center p-8 text-center flex-1 min-h-[200px]">
              <div className="w-10 h-10 rounded-full bg-gray-800/50 border border-gray-700 flex items-center justify-center mb-4">
                <span className="text-sm text-gray-500 font-bold">!</span>
              </div>
              <p className="text-gray-400 text-sm font-medium mb-2">
                No API keys configured
              </p>
              <p className="text-gray-500 text-xs">
                Generate a key to start verifying conversations
              </p>
            </div>
          </div>

          {/* Verifications Section */}
          <div className="flex flex-col border border-gray-800/60 rounded-xl overflow-hidden bg-gray-900/5">
            <div className="flex items-center justify-between border-b border-gray-800/60 px-6 py-4">
              <div className="flex items-center gap-2">
                <span className="w-1 h-4 bg-cyan-400 rounded-sm" />
                <h2 className="text-sm font-bold text-white uppercase tracking-wider">
                  Verifications
                </h2>
              </div>
              <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">
                Live Feed
              </span>
            </div>

            <div className="flex flex-col items-center justify-center p-8 text-center flex-1 min-h-[200px]">
              <div className="w-2 h-2 rounded-full bg-gray-600 animate-pulse mb-4" />
              <p className="text-gray-400 text-sm font-medium mb-2">
                No verifications recorded
              </p>
              <p className="text-gray-500 text-xs">
                Anchored conversations will appear here
              </p>
            </div>
          </div>
        </div>
      </Container>
    </main>
  );
}
