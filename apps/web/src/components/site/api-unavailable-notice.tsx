import { ApiConfigurationError } from '@/lib/config';
import { ApiNetworkError } from '@/lib/api/client';
import { tryGetApiBaseUrl } from '@/lib/config';

type ApiUnavailableNoticeProps = {
  variant?: 'site' | 'admin';
  error?: unknown;
};

export function ApiUnavailableNotice({
  variant = 'site',
  error,
}: ApiUnavailableNoticeProps) {
  const isAdmin = variant === 'admin';
  const resolvedBase =
    error instanceof ApiNetworkError
      ? error.url
      : (tryGetApiBaseUrl() ?? 'http://localhost:3001/api');

  return (
    <div
      className={isAdmin ? 'admin-page' : 'site-container-fluid'}
      style={isAdmin ? undefined : { padding: '2.5rem 1rem' }}
    >
      <div
        className={isAdmin ? 'card' : undefined}
        style={
          isAdmin
            ? { maxWidth: '640px', margin: '2rem auto' }
            : {
                background: 'rgba(255,255,255,0.06)',
                border: '1px solid rgba(255,255,255,0.12)',
                borderRadius: '12px',
                padding: '1.5rem',
                color: '#fff',
              }
        }
        role="alert"
      >
        <h2 style={{ marginTop: 0, fontSize: isAdmin ? '1.25rem' : '1.35rem' }}>
          {isAdmin ? 'API unavailable' : 'سرور خبر در دسترس نیست'}
        </h2>
        <p style={{ lineHeight: 1.7, opacity: isAdmin ? undefined : 0.9 }}>
          {isAdmin
            ? 'The Nest API could not be reached. Content and admin actions need a running API.'
            : 'در حال حاضر امکان دریافت اخبار از API وجود ندارد. هدر و فوتر سایت قابل استفاده‌اند؛ محتوای خبری به‌محض در دسترس بودن سرور بارگذاری می‌شود.'}
        </p>
        <p style={{ fontWeight: 600, marginBottom: '0.35rem' }}>
          {isAdmin ? 'Expected API base:' : 'آدرس مورد انتظار API:'}
        </p>
        <pre
          style={{
            margin: 0,
            padding: '0.75rem 1rem',
            borderRadius: '8px',
            overflow: 'auto',
            fontSize: '0.875rem',
            background: isAdmin ? '#f4f5f7' : 'rgba(0,0,0,0.35)',
          }}
        >
          {resolvedBase}
        </pre>
        <ol
          style={{
            marginTop: '1.25rem',
            paddingInlineStart: '1.25rem',
            lineHeight: 1.8,
            fontSize: '0.95rem',
            opacity: 0.9,
          }}
        >
          <li>
            {isAdmin ? (
              <>
                Start Postgres: <code>docker compose up -d</code>
              </>
            ) : (
              <>
                PostgreSQL را اجرا کنید: <code>docker compose up -d</code>
              </>
            )}
          </li>
          <li>
            {isAdmin ? (
              <>
                Run migrations: <code>pnpm migration:run</code>
              </>
            ) : (
              <>
                مایگریشن‌ها: <code>pnpm migration:run</code>
              </>
            )}
          </li>
          <li>
            {isAdmin ? (
              <>
                Start API: <code>pnpm dev:api</code>
              </>
            ) : (
              <>
                API را اجرا کنید: <code>pnpm dev:api</code>
              </>
            )}
          </li>
          <li>
            {isAdmin ? <>Then reload this page.</> : <>سپس این صفحه را تازه‌سازی کنید.</>}
          </li>
        </ol>
      </div>
    </div>
  );
}

export function isApiUnavailableError(error: unknown): boolean {
  return error instanceof ApiNetworkError || error instanceof ApiConfigurationError;
}
