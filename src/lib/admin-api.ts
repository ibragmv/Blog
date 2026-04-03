import type {
  AdminLinkDraft,
  AdminPostDraft,
  AdminSession,
  LinkRecord,
  PostRecord,
} from '@/lib/content';

type ErrorPayload = {
  error?: string;
};

export class AdminApiError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = 'AdminApiError';
    this.status = status;
  }
}

async function readJsonResponse<T>(response: Response): Promise<T> {
  const payload = ((await response.json().catch(() => ({}))) as T & ErrorPayload) ?? {};

  if (!response.ok) {
    throw new AdminApiError(payload.error || 'Admin request failed.', response.status);
  }

  return payload as T;
}

export async function getAdminSession() {
  const response = await fetch('/api/admin/session', {
    cache: 'no-store',
  });

  return readJsonResponse<AdminSession>(response);
}

export async function signInAdmin(payload: { email: string; password: string }) {
  const response = await fetch('/api/admin/session', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  return readJsonResponse<AdminSession>(response);
}

export async function signOutAdmin() {
  const response = await fetch('/api/admin/session', {
    method: 'DELETE',
  });

  return readJsonResponse<AdminSession>(response);
}

export async function getAdminPosts() {
  const response = await fetch('/api/admin/posts', {
    cache: 'no-store',
  });

  return readJsonResponse<PostRecord[]>(response);
}

export async function getAdminPost(postId: string) {
  const response = await fetch(`/api/admin/posts/${postId}`, {
    cache: 'no-store',
  });

  return readJsonResponse<PostRecord>(response);
}

export async function createAdminPost(draft: AdminPostDraft) {
  const response = await fetch('/api/admin/posts', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(draft),
  });

  return readJsonResponse<{ id: string }>(response);
}

export async function updateAdminPost(postId: string, draft: AdminPostDraft) {
  const response = await fetch(`/api/admin/posts/${postId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(draft),
  });

  return readJsonResponse<{ id: string }>(response);
}

export async function deleteAdminPost(postId: string) {
  const response = await fetch(`/api/admin/posts/${postId}`, {
    method: 'DELETE',
  });

  return readJsonResponse<{ success: true }>(response);
}

export async function getAdminLinks() {
  const response = await fetch('/api/admin/links', {
    cache: 'no-store',
  });

  return readJsonResponse<LinkRecord[]>(response);
}

export async function createAdminLink(draft: AdminLinkDraft) {
  const response = await fetch('/api/admin/links', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(draft),
  });

  return readJsonResponse<{ id: string }>(response);
}

export async function updateAdminLink(linkId: string, draft: AdminLinkDraft) {
  const response = await fetch(`/api/admin/links/${linkId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(draft),
  });

  return readJsonResponse<{ id: string }>(response);
}

export async function deleteAdminLink(linkId: string) {
  const response = await fetch(`/api/admin/links/${linkId}`, {
    method: 'DELETE',
  });

  return readJsonResponse<{ success: true }>(response);
}
