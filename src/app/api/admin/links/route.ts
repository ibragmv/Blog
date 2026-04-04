import { NextResponse } from 'next/server';
import { AdminIdResponseSchema, AdminLinkDraftSchema, LinkRecordSchema } from '@/lib/content';
import { listAdminLinks, saveAdminLink } from '@/lib/server/admin-data';
import { createAdminRouteErrorResponse } from '@/lib/server/admin-route';

export async function GET() {
  try {
    const links = await listAdminLinks();
    return NextResponse.json(LinkRecordSchema.array().parse(links));
  } catch (error) {
    return createAdminRouteErrorResponse(error, 'Failed to load links.', 500);
  }
}

export async function POST(request: Request) {
  const requestBody: unknown = await request.json().catch(() => null);
  const payload = AdminLinkDraftSchema.safeParse(requestBody);

  if (!payload.success) {
    return NextResponse.json({ error: 'Invalid request data.' }, { status: 400 });
  }

  try {
    const id = await saveAdminLink(payload.data);
    return NextResponse.json(AdminIdResponseSchema.parse({ id }));
  } catch (error) {
    return createAdminRouteErrorResponse(error, 'Failed to save link.', 400);
  }
}
