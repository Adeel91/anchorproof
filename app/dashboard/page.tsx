import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { DashboardClient } from '@/components/dashboard/DashboardClient';

export default async function DashboardPage() {
  const cookieStore = await cookies();
  const session = cookieStore.get('anchorproof-session');

  if (!session) {
    redirect('/login');
  }

  return <DashboardClient />;
}
