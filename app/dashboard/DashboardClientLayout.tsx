// app/dashboard/DashboardClientLayout.tsx
'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { Sidebar } from '@/components/dashboard/layout/Sidebar';
import { DashboardDataProvider, useDashboardData } from '@/providers/DashboardDataProvider';

function DashboardContent({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { tenant, loading, isReady, error } = useDashboardData();
  const [isInitialLoad, setIsInitialLoad] = useState(true);

  const tenantName = useMemo(() => tenant?.name, [tenant?.name]);

  useEffect(() => {
    // Only redirect on initial load and if there's no tenant
    if (isInitialLoad && !loading && !isReady && !tenant) {
      router.push('/login');
    }
    
    if (isInitialLoad && (isReady || tenant)) {
      setIsInitialLoad(false);
    }
  }, [loading, isReady, tenant, router, isInitialLoad]);

  // Show loading only on initial load
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

  // Show error only on initial load
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

  // If no tenant after loading and not on login page
  if (!loading && !tenant && !pathname.includes('/login')) {
    router.push('/login');
    return null;
  }

  return (
    <div className="min-h-screen bg-[#0a0a0f]">
      <Sidebar tenantName={tenantName} />
      <main className="ml-64 min-h-screen">
        <div className="p-6 pb-32 pt-16">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
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