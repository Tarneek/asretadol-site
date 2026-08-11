'use client';

import Image from 'next/image';
import Link from 'next/link';
import { FormEvent, useEffect, useId, useRef, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { SiteThemeToggle } from '@/components/site/site-theme-toggle';

/** Header chrome theme — independent of `data-site-theme` on the page shell. */
const HEADER_THEME: 'light' | 'dark' = 'light';

const NAV = [
  { href: '/', label: 'خانه' },
  { href: '/category/iranian-economy', label: 'اقتصاد ایران' },
  { href: '/category/world-economy', label: 'اقتصاد جهان' },
  { href: '/#short-news', label: 'علاقه‌مندی‌ها' },
  { href: '/#about', label: 'درباره ما' },
  { href: '/#contact', label: 'تماس با ما' },
];

function SearchIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" width="18" height="18" aria-hidden="true" fill="none">
      <circle cx="11" cy="11" r="6.5" stroke="currentColor" strokeWidth="1.8" />
      <path d="M16.5 16.5L20 20" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

function MenuIcon() {
  return (
    <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true" fill="none">
      <path d="M4 7h16M4 12h16M4 17h16" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true" fill="none">
      <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

function SiteSearchForm({
  query,
  onQueryChange,
  onSubmit,
  id,
  className,
}: {
  query: string;
  onQueryChange: (value: string) => void;
  onSubmit: (event: FormEvent) => void;
  id: string;
  className?: string;
}) {
  return (
    <form className={`site-search${className ? ` ${className}` : ''}`} onSubmit={onSubmit} role="search">
      <label className="sr-only" htmlFor={id}>
        جستجو در مطالب
      </label>
      <span className="site-search__icon" aria-hidden="true">
        <SearchIcon />
      </span>
      <input
        id={id}
        type="search"
        className="site-search__input"
        placeholder="جستجو در اخبار..."
        value={query}
        onChange={(e) => onQueryChange(e.target.value)}
        autoComplete="off"
      />
      <button type="submit" className="site-search__submit" aria-label="اجرای جستجو">
        جستجو
      </button>
    </form>
  );
}

export function SiteHeader() {
  const router = useRouter();
  const pathname = usePathname();
  const drawerTitleId = useId();
  const desktopSearchId = useId();
  const mobileSearchId = useId();
  const closeBtnRef = useRef<HTMLButtonElement>(null);

  const [menuOpen, setMenuOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!menuOpen) return;

    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    closeBtnRef.current?.focus();

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setMenuOpen(false);
    };
    window.addEventListener('keydown', onKeyDown);

    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [menuOpen]);

  function onSearch(event: FormEvent) {
    event.preventDefault();
    const q = query.trim();
    if (!q) return;
    router.push(`/?q=${encodeURIComponent(q)}`);
    setMenuOpen(false);
  }

  return (
    <>
      <header
        className={`site-header site-header--${HEADER_THEME}${scrolled ? ' is-scrolled' : ''}`}
        data-header-theme={HEADER_THEME}
      >
        <div className="site-container-fluid site-header__inner">
          <Link href="/" className="site-header__brand" aria-label="پایگاه خبری تحلیلی — صفحه اصلی">
            <Image
              src="/img/logo-top.png"
              alt="پایگاه خبری تحلیلی"
              width={220}
              height={56}
              className="site-header__logo"
              priority
            />
          </Link>

          <nav className="site-header__nav" aria-label="ناوبری اصلی">
            <ul className="site-header__nav-list">
              {NAV.map((item) => (
                <li key={item.href}>
                  <Link href={item.href} className="site-header__nav-link">
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <div className="site-header__tools">
            <SiteSearchForm
              id={desktopSearchId}
              className="site-search--desktop"
              query={query}
              onQueryChange={setQuery}
              onSubmit={onSearch}
            />

            <SiteThemeToggle />

            <Link href="/admin/login" className="site-header__admin-link">
              ورود
            </Link>

            <button
              type="button"
              className="site-header__icon-btn site-header__menu-btn"
              aria-label="باز کردن منو"
              aria-expanded={menuOpen}
              aria-controls="site-mobile-drawer"
              onClick={() => setMenuOpen(true)}
            >
              <MenuIcon />
            </button>
          </div>
        </div>
      </header>

      <div
        className={`site-drawer-backdrop${menuOpen ? ' is-open' : ''}`}
        onClick={() => setMenuOpen(false)}
        aria-hidden={!menuOpen}
      />

      <aside
        id="site-mobile-drawer"
        className={`site-drawer${menuOpen ? ' is-open' : ''}`}
        role="dialog"
        aria-modal="true"
        aria-labelledby={drawerTitleId}
        aria-hidden={!menuOpen}
      >
        <div className="site-drawer__head">
          <p id={drawerTitleId} className="site-drawer__title">
            منو
          </p>
          <button
            ref={closeBtnRef}
            type="button"
            className="site-drawer__close"
            aria-label="بستن منو"
            onClick={() => setMenuOpen(false)}
          >
            <CloseIcon />
          </button>
        </div>

        <SiteSearchForm
          id={mobileSearchId}
          className="site-search--drawer"
          query={query}
          onQueryChange={setQuery}
          onSubmit={onSearch}
        />

        <div className="site-drawer__theme-row">
          <span className="site-drawer__theme-label">ظاهر سایت</span>
          <SiteThemeToggle />
        </div>

        <nav className="site-drawer__nav" aria-label="ناوبری موبایل">
          <ul className="site-drawer__list">
            {NAV.map((item) => (
              <li key={item.href}>
                <Link href={item.href} className="site-drawer__link" onClick={() => setMenuOpen(false)}>
                  {item.label}
                </Link>
              </li>
            ))}
            <li>
              <Link
                href="/admin/login"
                className="site-drawer__link site-drawer__link--accent"
                onClick={() => setMenuOpen(false)}
              >
                ورود مدیریت
              </Link>
            </li>
          </ul>
        </nav>
      </aside>
    </>
  );
}
