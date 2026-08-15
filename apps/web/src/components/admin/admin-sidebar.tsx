'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LogoutButton } from './logout-button';
import { adminRoleLabel } from '@/lib/admin-labels';
import type { SessionUser } from '@/lib/auth/session';

const navItems = [
  {
    href: '/admin/dashboard',
    label: 'داشبورد',
    exact: true,
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden>
        <rect x="3" y="3" width="7" height="9" rx="1.5" />
        <rect x="14" y="3" width="7" height="5" rx="1.5" />
        <rect x="14" y="12" width="7" height="9" rx="1.5" />
        <rect x="3" y="16" width="7" height="5" rx="1.5" />
      </svg>
    ),
  },
  {
    href: '/admin/articles',
    label: 'مطالب',
    exact: false,
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden>
        <path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    href: '/admin/categories',
    label: 'دسته‌بندی‌ها',
    exact: false,
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden>
        <path d="M4 6h6v6H4zM14 6h6v4h-6zM4 16h6v2H4zM14 14h6v4h-6z" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    href: '/admin/tags',
    label: 'برچسب‌ها',
    exact: false,
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden>
        <path
          d="M20.6 13.4 12.7 21.3a1.4 1.4 0 0 1-2 0L2.7 13.3a1.4 1.4 0 0 1 0-2L10.6 3.4a1.4 1.4 0 0 1 1-.4H19a1.4 1.4 0 0 1 1.4 1.4v7.4a1.4 1.4 0 0 1-.4 1z"
          strokeLinejoin="round"
        />
        <circle cx="16.5" cy="7.5" r="1.2" fill="currentColor" stroke="none" />
      </svg>
    ),
  },
  {
    href: '/admin/stories',
    label: 'استوری‌ها',
    exact: false,
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden>
        <circle cx="12" cy="12" r="8" />
        <circle cx="12" cy="12" r="3" />
      </svg>
    ),
  },
  {
    href: '/admin/users',
    label: 'مدیریت کاربران',
    exact: false,
    adminOnly: true,
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden>
        <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" strokeLinecap="round" />
        <circle cx="9" cy="7" r="3.5" />
        <path d="M22 21v-2a3.5 3.5 0 0 0-2.5-3.35" strokeLinecap="round" />
        <path d="M16.5 3.7a3.5 3.5 0 0 1 0 6.6" strokeLinecap="round" />
      </svg>
    ),
  },
];

export function AdminSidebar({ user }: { user: SessionUser }) {
  const pathname = usePathname();

  function isActive(href: string, exact: boolean) {
    if (exact) return pathname === href;
    return pathname === href || pathname.startsWith(`${href}/`);
  }

  const visibleNav = navItems.filter((item) => !item.adminOnly || user.role === 'admin');

  return (
    <aside className="admin-sidebar">
      <div className="admin-sidebar__brand-block">
        <p className="admin-sidebar__brand">سامانه خبری</p>
        <p className="admin-sidebar__tagline">پنل مدیریت تحریریه</p>
      </div>

      <div className="admin-sidebar__user">
        <span className="admin-sidebar__user-name">{user.displayName}</span>
        {adminRoleLabel(user.role)}
        {user.mobile ? (
          <span className="muted" dir="ltr" style={{ display: 'block', marginTop: '0.25rem' }}>
            {user.mobile}
          </span>
        ) : null}
      </div>

      <nav aria-label="منوی مدیریت">
        <ul className="admin-nav">
          {visibleNav.map((item) => (
            <li key={item.href}>
              <Link
                href={item.href}
                className={
                  isActive(item.href, item.exact)
                    ? 'admin-nav__link admin-nav__link--active'
                    : 'admin-nav__link'
                }
              >
                <span className="admin-nav__icon">{item.icon}</span>
                <span>{item.label}</span>
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      <div className="admin-sidebar__footer">
        <Link href="/" className="btn btn--secondary btn--sm" target="_blank" rel="noreferrer">
          مشاهده سایت
        </Link>
        <LogoutButton />
      </div>
    </aside>
  );
}
