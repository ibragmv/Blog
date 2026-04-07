import { NextResponse } from 'next/server';
import {
  AdminDeleteSuccessResponseSchema,
  AdminIdResponseSchema,
  AdminLinkDraftSchema,
} from '@/lib/content';
import { removeAdminLink, saveAdminLink } from '@/lib/server/admin-data';
import { createAdminRouteErrorResponse } from '@/lib/server/admin-route';

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function PUT(request: Request, context: RouteContext) {
  const { id } = await context.params;
  const requestBody: unknown = await request.json().catch(() => null);
  const payload = AdminLinkDraftSchema.safeParse(requestBody);

  if (!payload.success) {
    return NextResponse.json({ error: 'Invalid request data.' }, { status: 400 });
  }

  try {
    const savedId = await saveAdminLink(payload.data, id);
    return NextResponse.json(AdminIdResponseSchema.parse({ id: savedId }));
  } catch (error) {
    return createAdminRouteErrorResponse(error, 'Failed to save link.', 400);
  }
}

export async function DELETE(_: Request, context: RouteContext) {
  const { id } = await context.params;

  try {
    await removeAdminLink(id);
    return NextResponse.json(AdminDeleteSuccessResponseSchema.parse({ success: true }));
  } catch (error) {
    return createAdminRouteErrorResponse(error, 'Failed to delete link.', 400);
  }
}
