import { NextResponse } from 'next/server';
import { ADMIN_SESSION_EXPIRED_MESSAGE } from '@/lib/admin-auth-shared';
import { AdminErrorResponseSchema } from '@/lib/content';
import { AdminAuthorizationError } from '@/lib/server/admin-auth';
import { ADMIN_SESSION_COOKIE_NAME } from '@/lib/server/convex';

function createAdminErrorResponse(message: string, status: number) {
  return NextResponse.json(AdminErrorResponseSchema.parse({ error: message }), { status });
}

export function createAdminUnauthorizedResponse() {
  const response = createAdminErrorResponse(ADMIN_SESSION_EXPIRED_MESSAGE, 401);
  response.cookies.delete(ADMIN_SESSION_COOKIE_NAME);
  return response;
}

export function createAdminRouteErrorResponse(
  error: unknown,
  fallbackMessage: string,
  status: number
) {
  if (error instanceof AdminAuthorizationError) {
    return createAdminUnauthorizedResponse();
  }

  const message = error instanceof Error ? error.message : fallbackMessage;
  return createAdminErrorResponse(message, status);
}
