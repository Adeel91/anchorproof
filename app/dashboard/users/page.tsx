import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { UsersList } from '@/components/dashboard/users/UsersList';

export default async function UsersPage() {
  const cookieStore = await cookies();
  const session = cookieStore.get('anchorproof-session');

  if (!session) {
    redirect('/login');
  }

  return <UsersList />;
}
