import { NextResponse } from 'next/server';
import { z } from 'zod';
import { AdminAuthorizationError } from '@/lib/server/admin-auth';
import { removeAdminLink, saveAdminLink } from '@/lib/server/admin-data';

const adminLinkSchema = z.object({
  title: z.string(),
  url: z.string(),
  icon: z.string(),
  order: z.number(),
});

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function PUT(request: Request, context: RouteContext) {
  const { id } = await context.params;
  const payload = adminLinkSchema.safeParse(await request.json());

  if (!payload.success) {
    return NextResponse.json({ error: 'Invalid request data.' }, { status: 400 });
  }

  try {
    const savedId = await saveAdminLink(payload.data, id);
    return NextResponse.json({ id: savedId });
  } catch (error) {
    if (error instanceof AdminAuthorizationError) {
      return NextResponse.json({ error: error.message }, { status: 401 });
    }

    const message = error instanceof Error ? error.message : 'Failed to save link.';
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

export async function DELETE(_: Request, context: RouteContext) {
  const { id } = await context.params;

  try {
    await removeAdminLink(id);
    return NextResponse.json({ success: true });
  } catch (error) {
    if (error instanceof AdminAuthorizationError) {
      return NextResponse.json({ error: error.message }, { status: 401 });
    }

    const message = error instanceof Error ? error.message : 'Failed to delete link.';
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
