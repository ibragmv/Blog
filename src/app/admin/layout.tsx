import { AdminProviders } from '@/components/admin-providers';
import { requireAdminSessionOrRedirect } from '@/lib/server/admin-auth';
import { getConvexUrl } from '@/lib/server/convex';

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await requireAdminSessionOrRedirect('/admin');
  const convexUrl = getConvexUrl();

  return (
    <AdminProviders initialSession={session} convexUrl={convexUrl}>
      {children}
    </AdminProviders>
  );
}
