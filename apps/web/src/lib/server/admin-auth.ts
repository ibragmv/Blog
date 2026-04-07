import { fetchMutation, fetchQuery } from 'convex/nextjs';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { ADMIN_SESSION_EXPIRED_MESSAGE } from '@/lib/admin-auth-shared';
import type { AdminSession } from '@/lib/content';
import {
  ADMIN_SESSION_COOKIE_NAME,
  ADMIN_SESSION_MAX_AGE_MS,
  api,
  createAdminSessionToken,
  hashAdminSessionToken,
} from '@/lib/server/convex';
import {
  ConvexServiceUnavailableError,
  isConvexServiceUnavailableError,
  toConvexServiceUnavailableError,
  warnOnConvexServiceUnavailable,
} from '@/lib/server/convex-errors';

type VerifiedAdminSession = {
  email: string;
};

export class AdminAuthorizationError extends Error {
  constructor(message = ADMIN_SESSION_EXPIRED_MESSAGE) {
    super(message);
    this.name = 'AdminAuthorizationError';
  }
}

function buildUnauthenticatedSession(): AdminSession {
  return {
    authenticated: false,
    email: null,
  };
}

async function getStoredAdminSession(): Promise<{ email: string; sessionToken: string } | null> {
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get(ADMIN_SESSION_COOKIE_NAME)?.value;

  if (!sessionToken) {
    return null;
  }

  let session: { email: string; expiresAt: number } | null | undefined;

  try {
    session = await fetchQuery(api.sessions.getByTokenHash, {
      tokenHash: hashAdminSessionToken(sessionToken),
    });
  } catch (error) {
    throw toConvexServiceUnavailableError(
      error,
      'Admin session storage is temporarily unavailable. Please try again.'
    );
  }

  if (!session || session.expiresAt <= Date.now()) {
    return null;
  }

  return {
    email: session.email,
    sessionToken,
  };
}

function getAdminCredentials() {
  const email = process.env.ADMIN_EMAIL?.trim();
  const password = process.env.ADMIN_PASSWORD;

  if (!email || !password) {
    throw new Error('Missing ADMIN_EMAIL or ADMIN_PASSWORD.');
  }

  return { email, password };
}

export async function getCurrentAdminSession(): Promise<AdminSession> {
  let session: Awaited<ReturnType<typeof getStoredAdminSession>>;

  try {
    session = await getStoredAdminSession();
  } catch (error) {
    if (error instanceof ConvexServiceUnavailableError) {
      warnOnConvexServiceUnavailable('admin-auth:getCurrentAdminSession', error);
      return buildUnauthenticatedSession();
    }

    throw error;
  }

  if (!session) {
    return buildUnauthenticatedSession();
  }

  return {
    authenticated: true,
    email: session.email,
  };
}

export async function requireAdminSession(): Promise<VerifiedAdminSession> {
  const session = await getStoredAdminSession();

  if (!session) {
    throw new AdminAuthorizationError();
  }

  return {
    email: session.email,
  };
}

export async function requireAdminSessionToken(): Promise<string> {
  const session = await getStoredAdminSession();

  if (!session) {
    throw new AdminAuthorizationError();
  }

  return session.sessionToken;
}

export async function requireAdminSessionOrRedirect(nextPath = '/admin') {
  const session = await getCurrentAdminSession();

  if (!session.authenticated) {
    redirect(`/login?next=${encodeURIComponent(nextPath)}`);
  }

  return session;
}

export async function signInAdmin(email: string, password: string): Promise<AdminSession> {
  const credentials = getAdminCredentials();

  if (
    email.trim().toLowerCase() !== credentials.email.toLowerCase() ||
    password !== credentials.password
  ) {
    throw new Error('Invalid email or password.');
  }

  const sessionToken = createAdminSessionToken();

  try {
    await fetchMutation(api.sessions.create, {
      tokenHash: hashAdminSessionToken(sessionToken),
      email: credentials.email,
      expiresAt: Date.now() + ADMIN_SESSION_MAX_AGE_MS,
    });
  } catch (error) {
    throw toConvexServiceUnavailableError(
      error,
      'Unable to create an admin session right now. Please try again.'
    );
  }

  const cookieStore = await cookies();
  cookieStore.set(ADMIN_SESSION_COOKIE_NAME, sessionToken, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: Math.floor(ADMIN_SESSION_MAX_AGE_MS / 1000),
  });

  return {
    authenticated: true,
    email: credentials.email,
  };
}

export async function signOutAdmin(): Promise<AdminSession> {
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get(ADMIN_SESSION_COOKIE_NAME)?.value;

  if (sessionToken) {
    try {
      await fetchMutation(api.sessions.removeByTokenHash, {
        tokenHash: hashAdminSessionToken(sessionToken),
      });
    } catch (error) {
      if (isConvexServiceUnavailableError(error)) {
        warnOnConvexServiceUnavailable('admin-auth:signOutAdmin', error);
      } else {
        throw error;
      }
    }
  }

  cookieStore.delete(ADMIN_SESSION_COOKIE_NAME);
  return buildUnauthenticatedSession();
}
