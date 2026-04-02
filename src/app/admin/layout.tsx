import { AdminProviders } from '@/components/admin-providers';
import { requireAdminSessionOrRedirect } from '@/lib/server/admin-auth';

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await requireAdminSessionOrRedirect('/admin');

  return <AdminProviders initialSession={session}>{children}</AdminProviders>;
}
