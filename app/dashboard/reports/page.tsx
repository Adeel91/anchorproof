import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { Reports } from '@/components/dashboard/reports/Reports';

export default async function ReportsPage() {
  const cookieStore = await cookies();
  const session = cookieStore.get('anchorproof-session');

  if (!session) {
    redirect('/login');
  }

  return <Reports />;
}
