import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { Reports } from '@/components/dashboard/compliance/Reports';

export default async function CompliancePage() {
  const cookieStore = await cookies();
  const session = cookieStore.get('anchorproof-session');

  if (!session) {
    redirect('/login');
  }

  return <Reports />;
}