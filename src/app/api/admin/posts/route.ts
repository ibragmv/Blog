import { NextResponse } from 'next/server';
import { z } from 'zod';
import { AdminAuthorizationError } from '@/lib/server/admin-auth';
import { listAdminPosts, saveAdminPost } from '@/lib/server/admin-data';

const adminPostSchema = z.object({
  titleRU: z.string(),
  titleEN: z.string().optional(),
  slug: z.string(),
  contentRU: z.string(),
  contentEN: z.string().optional(),
  published: z.boolean(),
});

export async function GET() {
  try {
    const posts = await listAdminPosts();
    return NextResponse.json(posts);
  } catch (error) {
    if (error instanceof AdminAuthorizationError) {
      return NextResponse.json({ error: error.message }, { status: 401 });
    }

    const message = error instanceof Error ? error.message : 'Failed to load posts.';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const payload = adminPostSchema.safeParse(await request.json());

  if (!payload.success) {
    return NextResponse.json({ error: 'Invalid request data.' }, { status: 400 });
  }

  try {
    const id = await saveAdminPost(payload.data);
    return NextResponse.json({ id });
  } catch (error) {
    if (error instanceof AdminAuthorizationError) {
      return NextResponse.json({ error: error.message }, { status: 401 });
    }

    const message = error instanceof Error ? error.message : 'Failed to save post.';
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
