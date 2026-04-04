import { createHash, randomBytes } from 'node:crypto';
import { api } from '../../../convex/_generated/api';
import type { Id, TableNames } from '../../../convex/_generated/dataModel';

export const ADMIN_SESSION_COOKIE_NAME = 'archive_admin_session';
export const ADMIN_SESSION_MAX_AGE_MS = 1000 * 60 * 60 * 24 * 7;

export function createAdminSessionToken() {
  return randomBytes(32).toString('hex');
}

export function hashAdminSessionToken(sessionToken: string) {
  return createHash('sha256').update(sessionToken).digest('hex');
}

export function parseConvexId<TableName extends TableNames>(
  tableName: TableName,
  value: string
): Id<TableName> {
  const normalizedValue = value.trim();

  if (!normalizedValue) {
    throw new Error(`Invalid ${tableName} id.`);
  }

  return normalizedValue as Id<TableName>;
}

export { api };
