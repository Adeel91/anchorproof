import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { VerificationHistory } from '@/components/dashboard/verification/VerificationHistory';

export default async function VerificationPage() {
  const cookieStore = await cookies();
  const session = cookieStore.get('anchorproof-session');

  if (!session) {
    redirect('/login');
  }

  return <VerificationHistory />;
}