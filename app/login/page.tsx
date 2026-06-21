import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { LoginForm } from '@/components/auth/LoginForm';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Login | AnchorProof',
  description:
    'Log in to your AnchorProof account to manage and secure your blockchain-verified conversations.',
  openGraph: {
    title: 'Login | AnchorProof',
    description: 'Access your secure AnchorProof dashboard.',
    type: 'website',
  },
};

export default async function LoginPage() {
  const cookieStore = await cookies();
  const session = cookieStore.get('anchorproof-session');

  if (session) {
    redirect('/dashboard');
  }

  return <LoginForm />;
}
