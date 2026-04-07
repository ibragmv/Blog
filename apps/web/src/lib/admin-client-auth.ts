import { AdminApiError } from '@/lib/admin-api';
import { normalizeNextPath } from '@/lib/normalize-next-path';
import { TranslationApiError } from '@/services/translation';

export const ADMIN_SERVICE_UNAVAILABLE_TITLE = 'Connection issue:';
export const ADMIN_SERVICE_UNAVAILABLE_MESSAGE =
  'Convex is temporarily unavailable. Check the backend connection and try again.';

export function getAdminLoginPath(nextPath: string) {
  return `/login?next=${encodeURIComponent(normalizeNextPath(nextPath))}`;
}

export function isAdminSessionExpiredError(error: unknown) {
  return (
    (error instanceof AdminApiError || error instanceof TranslationApiError) && error.status === 401
  );
}

export function isAdminServiceUnavailableError(error: unknown) {
  return (
    (error instanceof AdminApiError || error instanceof TranslationApiError) && error.status === 503
  );
}

export function getAdminServiceUnavailableMessage(error: unknown) {
  if (
    (error instanceof AdminApiError || error instanceof TranslationApiError) &&
    error.message.trim()
  ) {
    return error.message;
  }

  return ADMIN_SERVICE_UNAVAILABLE_MESSAGE;
}
