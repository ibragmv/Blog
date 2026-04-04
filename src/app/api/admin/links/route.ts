import { NextResponse } from 'next/server';
import { AdminIdResponseSchema, AdminLinkDraftSchema, LinkRecordSchema } from '@/lib/content';
import { AdminAuthorizationError } from '@/lib/server/admin-auth';
import { listAdminLinks, saveAdminLink } from '@/lib/server/admin-data';

export async function GET() {
  try {
    const links = await listAdminLinks();
    return NextResponse.json(LinkRecordSchema.array().parse(links));
  } catch (error) {
    if (error instanceof AdminAuthorizationError) {
      return NextResponse.json({ error: error.message }, { status: 401 });
    }

    const message = error instanceof Error ? error.message : 'Failed to load links.';
    return NextResponse.json({ error: message }, { status: 500 });
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
    if (error instanceof AdminAuthorizationError) {
      return NextResponse.json({ error: error.message }, { status: 401 });
    }

    const message = error instanceof Error ? error.message : 'Failed to save link.';
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
