import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { ApiKeySection } from '@/components/dashboard/apiKeys/ApiKeySection';

export default async function KeysPage() {
  const cookieStore = await cookies();
  const session = cookieStore.get('anchorproof-session');

  if (!session) {
    redirect('/login');
  }

  return <ApiKeySection />;
}