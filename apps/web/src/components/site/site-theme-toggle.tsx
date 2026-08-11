'use client';

import { useSiteTheme } from '@/components/site/site-theme-provider';

function SunIcon() {
  return (
    <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true" fill="none">
      <circle cx="12" cy="12" r="4.25" stroke="currentColor" strokeWidth="1.8" />
      <path
        d="M12 2.5v2.2M12 19.3v2.2M4.5 12H2.3M21.7 12h-2.2M5.8 5.8 4.1 4.1M19.9 19.9l-1.7-1.7M18.2 5.8l1.7-1.7M4.1 19.9l1.7-1.7"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  );
}

function MoonIcon() {
  return (
    <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true" fill="none">
      <path
        d="M20 14.5A7.5 7.5 0 0 1 9.5 4 6 6 0 1 0 20 14.5Z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function SiteThemeToggle() {
  const { theme, toggleTheme } = useSiteTheme();
  const isLight = theme === 'light';

  return (
    <button
      type="button"
      className="site-header__icon-btn site-header__theme-btn"
      onClick={toggleTheme}
      aria-label={isLight ? 'فعال‌سازی حالت شب' : 'فعال‌سازی حالت روز'}
      title={isLight ? 'حالت شب' : 'حالت روز'}
    >
      {isLight ? <MoonIcon /> : <SunIcon />}
    </button>
  );
}
