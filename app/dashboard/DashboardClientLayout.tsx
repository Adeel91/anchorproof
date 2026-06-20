'use client';

import { useEffect, useMemo, useState, useRef } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { Sidebar } from '@/components/dashboard/layout/Sidebar';
import {
  DashboardDataProvider,
  useDashboardData,
} from '@/providers/DashboardDataProvider';

function DashboardContent({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { tenant, loading, isReady, error } = useDashboardData();
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const hasRedirected = useRef(false);
  const hasSetInitialLoad = useRef(false);

  const tenantName = useMemo(() => tenant?.name, [tenant?.name]);

  useEffect(() => {
    if (hasRedirected.current) return;
    if (loading) return;
    if (pathname.includes('/login')) return;
    if (tenant) return;

    hasRedirected.current = true;
    router.push('/login');
  }, [loading, tenant, pathname, router]);

  useEffect(() => {
    if (hasSetInitialLoad.current) return;
    if (loading) return;

    if (tenant || isReady) {
      hasSetInitialLoad.current = true;
      requestAnimationFrame(() => {
        setIsInitialLoad(false);
      });
    }
  }, [loading, isReady, tenant]);

  if (isInitialLoad && (loading || !isReady)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0a0a0f]">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-400 text-sm font-mono">Loading...</p>
        </div>
      </div>
    );
  }

  if (error && isInitialLoad) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0a0a0f]">
        <div className="text-center">
          <div className="text-red-400 text-sm mb-2">{error}</div>
          <button
            onClick={() => window.location.reload()}
            className="text-indigo-400 hover:text-indigo-300 text-sm"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!tenant && !pathname.includes('/login')) {
    return null;
  }

  return (
    <div className="min-h-screen bg-[#0a0a0f]">
      <Sidebar tenantName={tenantName} />
      <main className="lg:ml-64 min-h-screen">
        <div className="p-4 sm:p-6 pb-32 pt-16 lg:pt-6">
          <div className="max-w-7xl mx-auto">{children}</div>
        </div>
      </main>
    </div>
  );
}

export default function DashboardClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <DashboardDataProvider>
      <DashboardContent>{children}</DashboardContent>
    </DashboardDataProvider>
  );
}
