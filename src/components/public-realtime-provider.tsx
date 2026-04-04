'use client';

import { ConvexProvider } from 'convex/react';
import type { ReactNode } from 'react';
import { getConvexClient } from '@/lib/convex';

export function PublicRealtimeProvider({ children }: { children: ReactNode }) {
  return <ConvexProvider client={getConvexClient()}>{children}</ConvexProvider>;
}
