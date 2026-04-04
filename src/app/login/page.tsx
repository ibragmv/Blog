import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { AdminAuthProvider } from '@/components/admin-auth-provider';
import { LoginForm } from '@/components/login-form';
import { normalizeNextPath } from '@/lib/normalize-next-path';
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
  const nextPath = normalizeNextPath(params.next);

  if (session.authenticated) {
    redirect(nextPath);
  }

  return (
    <AdminAuthProvider initialSession={session}>
      <span data-admin-route="true" className="hidden" aria-hidden="true" />
      <LoginForm redirectTo={nextPath} />
    </AdminAuthProvider>
  );
}
