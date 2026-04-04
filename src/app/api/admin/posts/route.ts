import { NextResponse } from 'next/server';
import { AdminIdResponseSchema, AdminPostDraftSchema, PostRecordSchema } from '@/lib/content';
import { AdminAuthorizationError } from '@/lib/server/admin-auth';
import { listAdminPosts, saveAdminPost } from '@/lib/server/admin-data';

export async function GET() {
  try {
    const posts = await listAdminPosts();
    return NextResponse.json(PostRecordSchema.array().parse(posts));
  } catch (error) {
    if (error instanceof AdminAuthorizationError) {
      return NextResponse.json({ error: error.message }, { status: 401 });
    }

    const message = error instanceof Error ? error.message : 'Failed to load posts.';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const requestBody: unknown = await request.json().catch(() => null);
  const payload = AdminPostDraftSchema.safeParse(requestBody);

  if (!payload.success) {
    return NextResponse.json({ error: 'Invalid request data.' }, { status: 400 });
  }

  try {
    const id = await saveAdminPost(payload.data);
    return NextResponse.json(AdminIdResponseSchema.parse({ id }));
  } catch (error) {
    if (error instanceof AdminAuthorizationError) {
      return NextResponse.json({ error: error.message }, { status: 401 });
    }

    const message = error instanceof Error ? error.message : 'Failed to save post.';
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
