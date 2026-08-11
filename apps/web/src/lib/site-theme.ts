export const SITE_THEME_STORAGE_KEY = 'site-theme';

export type SiteTheme = 'light' | 'dark';

export const SITE_THEME_DEFAULT: SiteTheme = 'dark';

export function isSiteTheme(value: string | null | undefined): value is SiteTheme {
  return value === 'light' || value === 'dark';
}

export function readStoredSiteTheme(): SiteTheme {
  if (typeof window === 'undefined') {
    return SITE_THEME_DEFAULT;
  }
  try {
    const stored = localStorage.getItem(SITE_THEME_STORAGE_KEY);
    return isSiteTheme(stored) ? stored : SITE_THEME_DEFAULT;
  } catch {
    return SITE_THEME_DEFAULT;
  }
}
