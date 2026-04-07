export type Theme = 'dark' | 'light' | 'system';

export const SYSTEM_THEME_QUERY = '(prefers-color-scheme: dark)';

export function resolveTheme(theme: Theme): Exclude<Theme, 'system'> {
  if (theme === 'system') {
    return window.matchMedia(SYSTEM_THEME_QUERY).matches ? 'dark' : 'light';
  }

  return theme;
}
