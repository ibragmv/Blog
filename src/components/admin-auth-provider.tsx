'use client';

import { createContext, type ReactNode, useContext, useState } from 'react';
import { getAdminSession, signInAdmin, signOutAdmin } from '@/lib/admin-api';
import type { AdminSession } from '@/lib/content';

type AdminAuthContextValue = {
  email: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  refreshSession: () => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
};

const AdminAuthContext = createContext<AdminAuthContextValue | null>(null);

function normalizeSession(session: AdminSession) {
  return {
    email: session.authenticated ? session.email : null,
    isAuthenticated: session.authenticated,
  };
}

export function AdminAuthProvider({
  children,
  initialSession,
}: {
  children: ReactNode;
  initialSession: AdminSession;
}) {
  const [session, setSession] = useState(() => normalizeSession(initialSession));
  const [isLoading, setIsLoading] = useState(false);

  const applySession = (nextSession: AdminSession) => {
    setSession(normalizeSession(nextSession));
  };

  const refreshSession = async () => {
    setIsLoading(true);

    try {
      const session = await getAdminSession();
      applySession(session);
    } catch {
      applySession({
        authenticated: false,
        email: null,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const signIn = async (nextEmail: string, password: string) => {
    setIsLoading(true);

    try {
      const session = await signInAdmin({ email: nextEmail, password });
      applySession(session);
    } finally {
      setIsLoading(false);
    }
  };

  const signOut = async () => {
    setIsLoading(true);

    try {
      const session = await signOutAdmin();
      applySession(session);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AdminAuthContext.Provider
      value={{
        email: session.email,
        isAuthenticated: session.isAuthenticated,
        isLoading,
        refreshSession,
        signIn,
        signOut,
      }}
    >
      {children}
    </AdminAuthContext.Provider>
  );
}

export function useAdminAuth() {
  const context = useContext(AdminAuthContext);

  if (!context) {
    throw new Error('useAdminAuth must be used within AdminAuthProvider.');
  }

  return context;
}
