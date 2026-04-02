import { fetchMutation, fetchQuery } from 'convex/nextjs';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import type { AdminSession } from '@/lib/content';
import {
  ADMIN_SESSION_COOKIE_NAME,
  ADMIN_SESSION_MAX_AGE_MS,
  api,
  createAdminSessionToken,
  hashAdminSessionToken,
} from '@/lib/server/convex';

function buildUnauthenticatedSession(): AdminSession {
  return {
    authenticated: false,
    email: null,
    sessionToken: null,
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
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get(ADMIN_SESSION_COOKIE_NAME)?.value;

  if (!sessionToken) {
    return buildUnauthenticatedSession();
  }

  const session = await fetchQuery(api.sessions.getByTokenHash, {
    tokenHash: hashAdminSessionToken(sessionToken),
  });

  if (!session || session.expiresAt <= Date.now()) {
    return buildUnauthenticatedSession();
  }

  return {
    authenticated: true,
    email: session.email,
    sessionToken,
  };
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

  await fetchMutation(api.sessions.create, {
    tokenHash: hashAdminSessionToken(sessionToken),
    email: credentials.email,
    expiresAt: Date.now() + ADMIN_SESSION_MAX_AGE_MS,
  });

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
    sessionToken,
  };
}

export async function signOutAdmin(): Promise<AdminSession> {
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get(ADMIN_SESSION_COOKIE_NAME)?.value;

  if (sessionToken) {
    await fetchMutation(api.sessions.removeByTokenHash, {
      tokenHash: hashAdminSessionToken(sessionToken),
    });
  }

  cookieStore.delete(ADMIN_SESSION_COOKIE_NAME);
  return buildUnauthenticatedSession();
}
