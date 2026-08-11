'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        const payload = (await response.json().catch(() => null)) as {
          code?: string;
          message?: string;
        } | null;
        if (response.status === 503 && payload?.code === 'API_NOT_CONFIGURED') {
          setError('آدرس API تنظیم نشده است. متغیر NEXT_PUBLIC_API_URL را بررسی کنید.');
          return;
        }
        if (response.status === 503 && payload?.code === 'API_UNAVAILABLE') {
          setError('ارتباط با سرور برقرار نشد. پایگاه‌داده و سرویس API را اجرا کنید.');
          return;
        }
        setError('ایمیل یا رمز عبور نادرست است.');
        return;
      }

      const next = searchParams.get('next') || '/admin/dashboard';
      router.push(next);
      router.refresh();
    } catch {
      setError('ارتباط با سرور قطع شد. کمی بعد دوباره تلاش کنید.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <form className="card login-card stack" onSubmit={handleSubmit}>
      <div>
        <h1 className="login-card__title">ورود به پنل</h1>
        <p className="login-card__subtitle">سامانه مدیریت خبرگزاری</p>
      </div>
      <div className="form-field">
        <label className="form-field__label" htmlFor="login-email">
          ایمیل
        </label>
        <input
          id="login-email"
          type="email"
          dir="ltr"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          autoComplete="email"
        />
      </div>
      <div className="form-field">
        <label className="form-field__label" htmlFor="login-password">
          رمز عبور
        </label>
        <input
          id="login-password"
          type="password"
          dir="ltr"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          autoComplete="current-password"
        />
      </div>
      {error ? (
        <div className="alert alert--error" role="alert">
          {error}
        </div>
      ) : null}
      <button type="submit" className="btn btn--primary" disabled={loading} style={{ width: '100%' }}>
        {loading ? 'در حال ورود…' : 'ورود'}
      </button>
    </form>
  );
}
