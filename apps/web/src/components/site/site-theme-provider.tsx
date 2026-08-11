'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import {
  readStoredSiteTheme,
  SITE_THEME_DEFAULT,
  SITE_THEME_STORAGE_KEY,
  type SiteTheme,
} from '@/lib/site-theme';

type SiteThemeContextValue = {
  theme: SiteTheme;
  setTheme: (theme: SiteTheme) => void;
  toggleTheme: () => void;
};

const SiteThemeContext = createContext<SiteThemeContextValue | null>(null);

function applySiteThemeToDom(theme: SiteTheme) {
  const root = document.getElementById('homepage');
  if (root) {
    root.setAttribute('data-site-theme', theme);
  }
}

export function SiteThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<SiteTheme>(SITE_THEME_DEFAULT);

  useEffect(() => {
    const stored = readStoredSiteTheme();
    setThemeState(stored);
    applySiteThemeToDom(stored);
  }, []);

  const setTheme = useCallback((next: SiteTheme) => {
    setThemeState(next);
    try {
      localStorage.setItem(SITE_THEME_STORAGE_KEY, next);
    } catch {
      /* ignore quota / private mode */
    }
    applySiteThemeToDom(next);
  }, []);

  const toggleTheme = useCallback(() => {
    setThemeState((current) => {
      const next: SiteTheme = current === 'light' ? 'dark' : 'light';
      try {
        localStorage.setItem(SITE_THEME_STORAGE_KEY, next);
      } catch {
        /* ignore */
      }
      applySiteThemeToDom(next);
      return next;
    });
  }, []);

  const value = useMemo(
    () => ({ theme, setTheme, toggleTheme }),
    [theme, setTheme, toggleTheme],
  );

  return <SiteThemeContext.Provider value={value}>{children}</SiteThemeContext.Provider>;
}

export function useSiteTheme(): SiteThemeContextValue {
  const ctx = useContext(SiteThemeContext);
  if (!ctx) {
    throw new Error('useSiteTheme must be used within SiteThemeProvider');
  }
  return ctx;
}
