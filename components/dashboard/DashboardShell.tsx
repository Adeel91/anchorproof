'use client';

import Container from '../ui/Container';

interface DashboardShellProps {
  children?: React.ReactNode;
  loading?: boolean;
}

export function DashboardShell({
  children,
  loading = false,
}: DashboardShellProps) {
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#030712]">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-gray-500 text-sm">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#030712] mt-8">
      <Container>{children}</Container>
    </div>
  );
}
