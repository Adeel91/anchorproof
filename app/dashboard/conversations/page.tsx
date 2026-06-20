import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { ConversationList } from '@/components/dashboard/conversations/ConversationList';

export default async function ConversationsPage() {
  const cookieStore = await cookies();
  const session = cookieStore.get('anchorproof-session');

  if (!session) {
    redirect('/login');
  }

  return <ConversationList />;
}
