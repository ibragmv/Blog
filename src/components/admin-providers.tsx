'use client';

import { ConvexProvider } from 'convex/react';
import type { ReactNode } from 'react';
import { AdminAuthProvider } from '@/components/admin-auth-provider';
import type { AdminSession } from '@/lib/content';
import { getConvexClient } from '@/lib/convex';

type AdminProvidersProps = {
  children: ReactNode;
  initialSession: AdminSession;
  convexUrl: string;
};

export function AdminProviders({ children, initialSession, convexUrl }: AdminProvidersProps) {
  return (
    <ConvexProvider client={getConvexClient(convexUrl)}>
      <AdminAuthProvider initialSession={initialSession}>{children}</AdminAuthProvider>
    </ConvexProvider>
  );
}
