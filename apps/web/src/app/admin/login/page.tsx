import { Suspense } from 'react';
import { LoginForm } from '@/components/admin/login-form';
import { ApiConfigurationNotice } from '@/components/site/api-configuration-notice';
import { getApiEnv } from '@/lib/env';

function LoginFallback() {
  return (
    <div className="card login-card state-box state-box--loading" role="status">
      <span className="spinner" aria-hidden />
      <span className="muted">در حال بارگذاری…</span>
    </div>
  );
}

export default function AdminLoginPage() {
  const apiEnv = getApiEnv();

  return (
    <div className="login-page">
      {apiEnv.status === 'missing' ? (
        <ApiConfigurationNotice config={apiEnv} variant="admin" />
      ) : (
        <Suspense fallback={<LoginFallback />}>
          <LoginForm />
        </Suspense>
      )}
    </div>
  );
}
