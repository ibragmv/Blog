import type { AdminSession } from '@/lib/content';

type SignInPayload = {
  email: string;
  password: string;
};

async function readSessionResponse(response: Response): Promise<AdminSession> {
  const data = (await response.json()) as Partial<AdminSession> & { error?: string };

  if (!response.ok) {
    throw new Error(data.error || 'Admin session request failed.');
  }

  return {
    authenticated: data.authenticated ?? false,
    email: data.email ?? null,
    sessionToken: data.sessionToken ?? null,
  };
}

export async function getAdminSession() {
  const response = await fetch('/api/admin/session');
  return readSessionResponse(response);
}

export async function signInAdmin(payload: SignInPayload) {
  const response = await fetch('/api/admin/session', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  return readSessionResponse(response);
}

export async function signOutAdmin() {
  const response = await fetch('/api/admin/session', {
    method: 'DELETE',
  });

  return readSessionResponse(response);
}
