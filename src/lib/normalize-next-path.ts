export const DEFAULT_ADMIN_REDIRECT_PATH = '/admin';

function hasControlCharacters(value: string) {
  return Array.from(value).some((character) => {
    const code = character.charCodeAt(0);
    return code <= 31 || code === 127;
  });
}

export function normalizeNextPath(nextPath: string | string[] | null | undefined): string {
  const candidate = Array.isArray(nextPath) ? nextPath[0] : nextPath;

  if (typeof candidate !== 'string') {
    return DEFAULT_ADMIN_REDIRECT_PATH;
  }

  const normalizedPath = candidate.trim();

  if (!normalizedPath || !normalizedPath.startsWith('/')) {
    return DEFAULT_ADMIN_REDIRECT_PATH;
  }

  if (normalizedPath.startsWith('//') || normalizedPath.includes('\\')) {
    return DEFAULT_ADMIN_REDIRECT_PATH;
  }

  if (hasControlCharacters(normalizedPath)) {
    return DEFAULT_ADMIN_REDIRECT_PATH;
  }

  return normalizedPath;
}
