import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { AuditLog } from '@/components/dashboard/audit/AuditLog';

export default async function AuditPage() {
  const cookieStore = await cookies();
  const session = cookieStore.get('anchorproof-session');

  if (!session) {
    redirect('/login');
  }

  return <AuditLog />;
}
