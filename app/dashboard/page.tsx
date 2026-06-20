import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { StatsCards } from '@/components/dashboard/overview/StatsCards';
import { ComplianceHealth } from '@/components/dashboard/overview/ComplianceHealth';
import { ActivityTimeline } from '@/components/dashboard/overview/ActivityTimeline';
import { SystemStatus } from '@/components/dashboard/overview/SystemStatus';
import { ApiKeyOverview } from '@/components/dashboard/overview/ApiKeyOverview';

export default async function DashboardPage() {
  const cookieStore = await cookies();
  const session = cookieStore.get('anchorproof-session');

  if (!session) {
    redirect('/login');
  }

  return (
    <div className="space-y-6 sm:space-y-8 md:space-y-12 lg:space-y-16 mt-6">
      <SystemStatus />
      <StatsCards />
      <ComplianceHealth />
      <ActivityTimeline />
      <ApiKeyOverview />
    </div>
  );
}
