'use client';

import { createContext, type ReactNode, useContext, useEffect, useState } from 'react';
import { resolveTheme, SYSTEM_THEME_QUERY, type Theme } from '@/lib/theme';

type ThemeProviderProps = {
  children: ReactNode;
  defaultTheme?: Theme;
  storageKey?: string;
};

type ThemeProviderState = {
  theme: Theme;
  setTheme: (theme: Theme) => void;
};

const ThemeProviderContext = createContext<ThemeProviderState | null>(null);

function isTheme(value: string | null): value is Theme {
  return value === 'dark' || value === 'light' || value === 'system';
}

export function ThemeProvider({
  children,
  defaultTheme = 'system',
  storageKey = 'archive-theme',
}: ThemeProviderProps) {
  const [theme, setThemeState] = useState<Theme>(defaultTheme);

  useEffect(() => {
    const storedTheme = window.localStorage.getItem(storageKey);

    if (isTheme(storedTheme)) {
      setThemeState(storedTheme);
    }
  }, [storageKey]);

  useEffect(() => {
    const root = window.document.documentElement;
    const mediaQuery = window.matchMedia(SYSTEM_THEME_QUERY);

    const applyTheme = () => {
      const resolvedTheme = resolveTheme(theme);
      root.classList.remove('light', 'dark');
      root.classList.add(resolvedTheme);
      root.style.colorScheme = resolvedTheme;
    };

    applyTheme();

    if (theme !== 'system') {
      return;
    }

    const handleChange = () => applyTheme();
    mediaQuery.addEventListener('change', handleChange);

    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [theme]);

  const value = {
    theme,
    setTheme: (nextTheme: Theme) => {
      window.localStorage.setItem(storageKey, nextTheme);
      setThemeState(nextTheme);
    },
  };

  return <ThemeProviderContext.Provider value={value}>{children}</ThemeProviderContext.Provider>;
}

export const useTheme = () => {
  const context = useContext(ThemeProviderContext);

  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider.');
  }

  return context;
};

export type { Theme };
