import { AdminApiError } from '@/lib/admin-api';
import { normalizeNextPath } from '@/lib/normalize-next-path';
import { TranslationApiError } from '@/services/translation';

export function getAdminLoginPath(nextPath: string) {
  return `/login?next=${encodeURIComponent(normalizeNextPath(nextPath))}`;
}

export function isAdminSessionExpiredError(error: unknown) {
  return (
    (error instanceof AdminApiError || error instanceof TranslationApiError) && error.status === 401
  );
}
