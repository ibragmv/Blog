import { fetchMutation, fetchQuery } from 'convex/nextjs';
import type { AdminLinkDraft, AdminPostDraft } from '@/lib/content';
import { requireAdminSession } from '@/lib/server/admin-auth';
import { api, parseConvexId } from '@/lib/server/convex';

export async function listAdminPosts() {
  const session = await requireAdminSession();
  return fetchQuery(api.posts.listAdmin, {
    sessionToken: session.sessionToken,
  });
}

export async function getAdminPostById(postId: string) {
  const session = await requireAdminSession();
  return fetchQuery(api.posts.getAdminById, {
    sessionToken: session.sessionToken,
    postId: parseConvexId('posts', postId),
  });
}

export async function saveAdminPost(draft: AdminPostDraft, postId?: string) {
  const session = await requireAdminSession();
  return fetchMutation(api.posts.save, {
    sessionToken: session.sessionToken,
    ...(postId ? { postId: parseConvexId('posts', postId) } : {}),
    ...draft,
  });
}

export async function removeAdminPost(postId: string) {
  const session = await requireAdminSession();
  return fetchMutation(api.posts.remove, {
    sessionToken: session.sessionToken,
    postId: parseConvexId('posts', postId),
  });
}

export async function listAdminLinks() {
  const session = await requireAdminSession();
  return fetchQuery(api.links.listAdmin, {
    sessionToken: session.sessionToken,
  });
}

export async function saveAdminLink(draft: AdminLinkDraft, linkId?: string) {
  const session = await requireAdminSession();
  return fetchMutation(api.links.save, {
    sessionToken: session.sessionToken,
    ...(linkId ? { linkId: parseConvexId('links', linkId) } : {}),
    ...draft,
  });
}

export async function removeAdminLink(linkId: string) {
  const session = await requireAdminSession();
  return fetchMutation(api.links.remove, {
    sessionToken: session.sessionToken,
    linkId: parseConvexId('links', linkId),
  });
}
