import { createHash, randomBytes } from 'node:crypto';
import { api } from '../../../convex/_generated/api';

export const ADMIN_SESSION_COOKIE_NAME = 'blog_admin_session';
export const ADMIN_SESSION_MAX_AGE_MS = 1000 * 60 * 60 * 24 * 7;

export function createAdminSessionToken() {
  return randomBytes(32).toString('hex');
}

export function hashAdminSessionToken(sessionToken: string) {
  return createHash('sha256').update(sessionToken).digest('hex');
}

export { api };
