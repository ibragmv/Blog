import { AdminAuthProvider } from '@/components/admin-auth-provider';
import { requireAdminSessionOrRedirect } from '@/lib/server/admin-auth';

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await requireAdminSessionOrRedirect('/admin');

  return (
    <>
      <span data-admin-route="true" className="hidden" aria-hidden="true" />
      <AdminAuthProvider initialSession={session}>{children}</AdminAuthProvider>
    </>
  );
}
