'use client';

import type { ReactNode } from 'react';
import { AdminAuthProvider } from '@/components/admin-auth-provider';
import type { AdminSession } from '@/lib/content';

type AuthProvidersProps = {
  children: ReactNode;
  initialSession: AdminSession;
};

export function AuthProviders({ children, initialSession }: AuthProvidersProps) {
  return <AdminAuthProvider initialSession={initialSession}>{children}</AdminAuthProvider>;
}
