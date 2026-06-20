import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import DashboardClientLayout from './DashboardClientLayout';

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = await cookies();
  const session = cookieStore.get('anchorproof-session');

  if (!session) {
    redirect('/login');
  }

  return <DashboardClientLayout>{children}</DashboardClientLayout>;
}
