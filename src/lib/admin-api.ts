import { type ZodType, z } from 'zod';
import type { AdminLinkDraft, AdminPostDraft } from '@/lib/content';
import {
  AdminDeleteSuccessResponseSchema,
  AdminErrorResponseSchema,
  AdminIdResponseSchema,
  AdminLinkDraftSchema,
  AdminPostDraftSchema,
  AdminSessionSchema,
  LinkRecordSchema,
  PostRecordSchema,
} from '@/lib/content';

const AdminLoginPayloadSchema = z.object({
  email: z.string().trim().min(1),
  password: z.string().min(1),
});

export class AdminApiError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = 'AdminApiError';
    this.status = status;
  }
}

async function readJsonResponse<T>(response: Response, schema: ZodType<T>): Promise<T> {
  const payload: unknown = await response.json().catch(() => ({}));

  if (!response.ok) {
    const parsedError = AdminErrorResponseSchema.safeParse(payload);
    throw new AdminApiError(
      parsedError.success ? parsedError.data.error : 'Admin request failed.',
      response.status
    );
  }

  return schema.parse(payload);
}

export async function getAdminSession() {
  const response = await fetch('/api/admin/session', {
    cache: 'no-store',
  });

  return readJsonResponse(response, AdminSessionSchema);
}

export async function signInAdmin(payload: { email: string; password: string }) {
  const requestBody = AdminLoginPayloadSchema.parse(payload);
  const response = await fetch('/api/admin/session', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(requestBody),
  });

  return readJsonResponse(response, AdminSessionSchema);
}

export async function signOutAdmin() {
  const response = await fetch('/api/admin/session', {
    method: 'DELETE',
  });

  return readJsonResponse(response, AdminSessionSchema);
}

export async function getAdminPosts() {
  const response = await fetch('/api/admin/posts', {
    cache: 'no-store',
  });

  return readJsonResponse(response, PostRecordSchema.array());
}

export async function getAdminPost(postId: string) {
  const response = await fetch(`/api/admin/posts/${postId}`, {
    cache: 'no-store',
  });

  return readJsonResponse(response, PostRecordSchema);
}

export async function createAdminPost(draft: AdminPostDraft) {
  const requestBody = AdminPostDraftSchema.parse(draft);
  const response = await fetch('/api/admin/posts', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(requestBody),
  });

  return readJsonResponse(response, AdminIdResponseSchema);
}

export async function updateAdminPost(postId: string, draft: AdminPostDraft) {
  const requestBody = AdminPostDraftSchema.parse(draft);
  const response = await fetch(`/api/admin/posts/${postId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(requestBody),
  });

  return readJsonResponse(response, AdminIdResponseSchema);
}

export async function deleteAdminPost(postId: string) {
  const response = await fetch(`/api/admin/posts/${postId}`, {
    method: 'DELETE',
  });

  return readJsonResponse(response, AdminDeleteSuccessResponseSchema);
}

export async function getAdminLinks() {
  const response = await fetch('/api/admin/links', {
    cache: 'no-store',
  });

  return readJsonResponse(response, LinkRecordSchema.array());
}

export async function createAdminLink(draft: AdminLinkDraft) {
  const requestBody = AdminLinkDraftSchema.parse(draft);
  const response = await fetch('/api/admin/links', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(requestBody),
  });

  return readJsonResponse(response, AdminIdResponseSchema);
}

export async function updateAdminLink(linkId: string, draft: AdminLinkDraft) {
  const requestBody = AdminLinkDraftSchema.parse(draft);
  const response = await fetch(`/api/admin/links/${linkId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(requestBody),
  });

  return readJsonResponse(response, AdminIdResponseSchema);
}

export async function deleteAdminLink(linkId: string) {
  const response = await fetch(`/api/admin/links/${linkId}`, {
    method: 'DELETE',
  });

  return readJsonResponse(response, AdminDeleteSuccessResponseSchema);
}
