import { fetchMutation, fetchQuery } from 'convex/nextjs';
import type { FunctionArgs, FunctionReference, FunctionReturnType } from 'convex/server';
import type { AdminLinkDraft, AdminPostDraft } from '@/lib/content';
import { requireAdminSessionToken } from '@/lib/server/admin-auth';
import { api, parseConvexId } from '@/lib/server/convex';
import { toConvexServiceUnavailableError } from '@/lib/server/convex-errors';

type AdminFunctionRef = FunctionReference<'query'> | FunctionReference<'mutation'>;
type AdminFunctionArgs<Func extends AdminFunctionRef> = Omit<FunctionArgs<Func>, 'sessionToken'>;

async function fetchAdminQuery<Query extends FunctionReference<'query'>>(
  query: Query,
  args: AdminFunctionArgs<Query>
): Promise<FunctionReturnType<Query>> {
  const sessionToken = await requireAdminSessionToken();

  try {
    return await fetchQuery(query, {
      ...args,
      sessionToken,
    } as FunctionArgs<Query>);
  } catch (error) {
    throw toConvexServiceUnavailableError(
      error,
      'Admin data is temporarily unavailable. Please try again.'
    );
  }
}

async function fetchAdminMutation<Mutation extends FunctionReference<'mutation'>>(
  mutation: Mutation,
  args: AdminFunctionArgs<Mutation>
): Promise<FunctionReturnType<Mutation>> {
  const sessionToken = await requireAdminSessionToken();

  try {
    return await fetchMutation(mutation, {
      ...args,
      sessionToken,
    } as FunctionArgs<Mutation>);
  } catch (error) {
    throw toConvexServiceUnavailableError(
      error,
      'Admin data is temporarily unavailable. Please try again.'
    );
  }
}

export async function listAdminPosts() {
  return fetchAdminQuery(api.posts.listAdmin, {});
}

export async function getAdminPostById(postId: string) {
  return fetchAdminQuery(api.posts.getAdminById, {
    postId: parseConvexId('posts', postId),
  });
}

export async function saveAdminPost(draft: AdminPostDraft, postId?: string) {
  return fetchAdminMutation(api.posts.save, {
    ...(postId ? { postId: parseConvexId('posts', postId) } : {}),
    ...draft,
  });
}

export async function removeAdminPost(postId: string) {
  return fetchAdminMutation(api.posts.remove, {
    postId: parseConvexId('posts', postId),
  });
}

export async function listAdminLinks() {
  return fetchAdminQuery(api.links.listAdmin, {});
}

export async function saveAdminLink(draft: AdminLinkDraft, linkId?: string) {
  return fetchAdminMutation(api.links.save, {
    ...(linkId ? { linkId: parseConvexId('links', linkId) } : {}),
    ...draft,
  });
}

export async function removeAdminLink(linkId: string) {
  return fetchAdminMutation(api.links.remove, {
    linkId: parseConvexId('links', linkId),
  });
}
