import { NextResponse } from 'next/server';
import { z } from 'zod';
import { AdminAuthorizationError } from '@/lib/server/admin-auth';
import { getAdminPostById, removeAdminPost, saveAdminPost } from '@/lib/server/admin-data';

const adminPostSchema = z.object({
  titleRU: z.string(),
  titleEN: z.string().optional(),
  slug: z.string(),
  contentRU: z.string(),
  contentEN: z.string().optional(),
  published: z.boolean(),
});

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

    return NextResponse.json(post);
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
  const payload = adminPostSchema.safeParse(await request.json());

  if (!payload.success) {
    return NextResponse.json({ error: 'Invalid request data.' }, { status: 400 });
  }

  try {
    const savedId = await saveAdminPost(payload.data, id);
    return NextResponse.json({ id: savedId });
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
    return NextResponse.json({ success: true });
  } catch (error) {
    if (error instanceof AdminAuthorizationError) {
      return NextResponse.json({ error: error.message }, { status: 401 });
    }

    const message = error instanceof Error ? error.message : 'Failed to delete post.';
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
