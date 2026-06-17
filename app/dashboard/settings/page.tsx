import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { Settings } from '@/components/dashboard/settings/Settings';

export default async function SettingsPage() {
  const cookieStore = await cookies();
  const session = cookieStore.get('anchorproof-session');

  if (!session) {
    redirect('/login');
  }

  return <Settings />;
}