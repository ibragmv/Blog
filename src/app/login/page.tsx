import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { AuthProviders } from '@/components/auth-providers';
import { LoginForm } from '@/components/login-form';
import { getCurrentAdminSession } from '@/lib/server/admin-auth';

export const metadata: Metadata = {
  title: 'Login',
  description: 'Sign in to the private admin panel.',
  alternates: {
    canonical: '/login',
  },
};

type Props = {
  searchParams: Promise<{ next?: string | string[] }>;
};

export default async function LoginPage({ searchParams }: Props) {
  const session = await getCurrentAdminSession();
  const params = await searchParams;
  const nextPath = typeof params.next === 'string' ? params.next : '/admin';

  if (session.authenticated) {
    redirect(nextPath);
  }

  return (
    <AuthProviders initialSession={session}>
      <LoginForm redirectTo={nextPath} />
    </AuthProviders>
  );
}
