import { NextResponse } from 'next/server';
import {
  AdminDeleteSuccessResponseSchema,
  AdminIdResponseSchema,
  AdminPostDraftSchema,
  PostRecordSchema,
} from '@/lib/content';
import { AdminAuthorizationError } from '@/lib/server/admin-auth';
import { getAdminPostById, removeAdminPost, saveAdminPost } from '@/lib/server/admin-data';

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function GET(_: Request, context: RouteContext) {
  const { id } = await context.params;

  try {
    const post = await getAdminPostById(id);

    if (!post) {
      return NextResponse.json({ error: 'Post not found.' }, { status: 404 });
    }

    return NextResponse.json(PostRecordSchema.parse(post));
  } catch (error) {
    if (error instanceof AdminAuthorizationError) {
      return NextResponse.json({ error: error.message }, { status: 401 });
    }

    const message = error instanceof Error ? error.message : 'Failed to load post.';
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

export async function PUT(request: Request, context: RouteContext) {
  const { id } = await context.params;
  const requestBody: unknown = await request.json().catch(() => null);
  const payload = AdminPostDraftSchema.safeParse(requestBody);

  if (!payload.success) {
    return NextResponse.json({ error: 'Invalid request data.' }, { status: 400 });
  }

  try {
    const savedId = await saveAdminPost(payload.data, id);
    return NextResponse.json(AdminIdResponseSchema.parse({ id: savedId }));
  } catch (error) {
    if (error instanceof AdminAuthorizationError) {
      return NextResponse.json({ error: error.message }, { status: 401 });
    }

    const message = error instanceof Error ? error.message : 'Failed to save post.';
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

export async function DELETE(_: Request, context: RouteContext) {
  const { id } = await context.params;

  try {
    await removeAdminPost(id);
    return NextResponse.json(AdminDeleteSuccessResponseSchema.parse({ success: true }));
  } catch (error) {
    if (error instanceof AdminAuthorizationError) {
      return NextResponse.json({ error: error.message }, { status: 401 });
    }

    const message = error instanceof Error ? error.message : 'Failed to delete post.';
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
