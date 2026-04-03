import { NextResponse } from 'next/server';
import { z } from 'zod';
import { AdminAuthorizationError } from '@/lib/server/admin-auth';
import { listAdminLinks, saveAdminLink } from '@/lib/server/admin-data';

const adminLinkSchema = z.object({
  title: z.string(),
  url: z.string(),
  icon: z.string(),
  order: z.number(),
});

export async function GET() {
  try {
    const links = await listAdminLinks();
    return NextResponse.json(links);
  } catch (error) {
    if (error instanceof AdminAuthorizationError) {
      return NextResponse.json({ error: error.message }, { status: 401 });
    }

    const message = error instanceof Error ? error.message : 'Failed to load links.';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const payload = adminLinkSchema.safeParse(await request.json());

  if (!payload.success) {
    return NextResponse.json({ error: 'Invalid request data.' }, { status: 400 });
  }

  try {
    const id = await saveAdminLink(payload.data);
    return NextResponse.json({ id });
  } catch (error) {
    if (error instanceof AdminAuthorizationError) {
      return NextResponse.json({ error: error.message }, { status: 401 });
    }

    const message = error instanceof Error ? error.message : 'Failed to save link.';
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
