import {
  createContext,
  type ReactNode,
  useContext,
  useEffect,
  useEffectEvent,
  useState,
} from 'react';
import { getAdminSession, signInAdmin, signOutAdmin } from '@/lib/admin-session';

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

export function AdminAuthProvider({ children }: { children: ReactNode }) {
  const [email, setEmail] = useState<string | null>(null);
  const [sessionToken, setSessionToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const applySession = useEffectEvent(
    (session: { authenticated: boolean; email: string | null; sessionToken: string | null }) => {
      setEmail(session.authenticated ? session.email : null);
      setSessionToken(session.authenticated ? session.sessionToken : null);
    }
  );

  const refreshSession = useEffectEvent(async () => {
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
  });

  useEffect(() => {
    void refreshSession();
  }, []);

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
