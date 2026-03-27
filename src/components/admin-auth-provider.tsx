'use client';

import { createContext, type ReactNode, useCallback, useContext, useEffect, useState } from 'react';
import { getAdminSession, signInAdmin, signOutAdmin } from '@/lib/admin-session';
import type { AdminSession } from '@/lib/content';

type AdminAuthContextValue = {
  email: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  sessionToken: string | null;
  refreshSession: () => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
};

const AdminAuthContext = createContext<AdminAuthContextValue | null>(null);

function normalizeSession(session: AdminSession) {
  return {
    email: session.authenticated ? session.email : null,
    sessionToken: session.authenticated ? session.sessionToken : null,
  };
}

export function AdminAuthProvider({
  children,
  initialSession,
}: {
  children: ReactNode;
  initialSession: AdminSession;
}) {
  const [email, setEmail] = useState<string | null>(normalizeSession(initialSession).email);
  const [sessionToken, setSessionToken] = useState<string | null>(
    normalizeSession(initialSession).sessionToken
  );
  const [isLoading, setIsLoading] = useState(false);

  const applySession = useCallback((session: AdminSession) => {
    const normalized = normalizeSession(session);
    setEmail(normalized.email);
    setSessionToken(normalized.sessionToken);
  }, []);

  const refreshSession = async () => {
    setIsLoading(true);

    try {
      const session = await getAdminSession();
      applySession(session);
    } catch {
      applySession({
        authenticated: false,
        email: null,
        sessionToken: null,
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void (async () => {
      setIsLoading(true);

      try {
        const session = await getAdminSession();
        applySession(session);
      } catch {
        applySession({
          authenticated: false,
          email: null,
          sessionToken: null,
        });
      } finally {
        setIsLoading(false);
      }
    })();
  }, [applySession]);

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
        email,
        isAuthenticated: !!sessionToken,
        isLoading,
        sessionToken,
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
