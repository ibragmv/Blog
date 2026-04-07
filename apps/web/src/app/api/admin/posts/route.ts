import { NextResponse } from 'next/server';
import { AdminIdResponseSchema, AdminPostDraftSchema, PostRecordSchema } from '@/lib/content';
import { listAdminPosts, saveAdminPost } from '@/lib/server/admin-data';
import { createAdminRouteErrorResponse } from '@/lib/server/admin-route';

export async function GET() {
  try {
    const posts = await listAdminPosts();
    return NextResponse.json(PostRecordSchema.array().parse(posts));
  } catch (error) {
    return createAdminRouteErrorResponse(error, 'Failed to load posts.', 500);
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
    return createAdminRouteErrorResponse(error, 'Failed to save post.', 400);
  }
}
