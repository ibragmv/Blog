'use client';

import type { ReactNode } from 'react';
import { AdminAuthProvider } from '@/components/admin-auth-provider';
import type { AdminSession } from '@/lib/content';

type AdminProvidersProps = {
  children: ReactNode;
  initialSession: AdminSession;
};

export function AdminProviders({ children, initialSession }: AdminProvidersProps) {
  return <AdminAuthProvider initialSession={initialSession}>{children}</AdminAuthProvider>;
}
