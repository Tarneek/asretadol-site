import type { ApiEnvMissing } from '@/lib/env';
import { ApiConfigurationError } from '@/lib/config';

type ApiConfigurationNoticeProps = {
  config: ApiEnvMissing;
  variant?: 'site' | 'admin';
};

export function ApiConfigurationNotice({
  config,
  variant = 'site',
}: ApiConfigurationNoticeProps) {
  const isAdmin = variant === 'admin';

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
          اتصال به API پیکربندی نشده است
        </h2>
        <p style={{ lineHeight: 1.6, opacity: isAdmin ? undefined : 0.9 }}>
          {config.message} {config.hint}
        </p>
        <p style={{ fontWeight: 600, marginBottom: '0.35rem' }}>متغیر محیطی موردنیاز:</p>
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
          {config.variable}={config.example}
        </pre>
        <p style={{ marginTop: '1rem', fontSize: '0.9rem', opacity: 0.85 }}>
          برای توسعه محلی، فایل <code>.env</code> در ریشه پروژه یا{' '}
          <code>apps/web/.env.local</code> را تنظیم کنید و سرور Next را مجدداً اجرا کنید.
        </p>
      </div>
    </div>
  );
}

export function isApiConfigurationError(error: unknown): error is ApiConfigurationError {
  return error instanceof ApiConfigurationError;
}
