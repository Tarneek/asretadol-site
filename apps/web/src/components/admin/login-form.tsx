'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { normalizeIranianMobile } from '@/lib/iranian-mobile';

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [mobile, setMobile] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setLoading(true);
    setError(null);

    const normalized = normalizeIranianMobile(mobile);
    if (!normalized) {
      setError('شماره موبایل معتبر نیست. مثال: 09123456789');
      setLoading(false);
      return;
    }

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mobile: normalized, password }),
      });

      if (!response.ok) {
        const payload = (await response.json().catch(() => null)) as {
          code?: string;
          message?: string;
        } | null;
        if (payload?.code === 'API_NOT_CONFIGURED') {
          setError('آدرس API تنظیم نشده است. متغیر NEXT_PUBLIC_API_URL یا API_INTERNAL_URL را بررسی کنید.');
          return;
        }
        if (payload?.code === 'API_UNAVAILABLE' || response.status === 503) {
          setError('سرویس API در دسترس نیست. اتصال شبکه داخلی Docker یا وضعیت کانتینر API را بررسی کنید.');
          return;
        }
        if (payload?.code === 'API_ERROR' || response.status === 502) {
          setError(payload?.message || 'خطا از سمت سرور API. لاگ‌های Nest را بررسی کنید.');
          return;
        }
        if (response.status === 400 || payload?.code === 'VALIDATION_ERROR') {
          setError(payload?.message || 'شماره موبایل معتبر نیست.');
          return;
        }
        if (response.status === 401 || payload?.code === 'INVALID_CREDENTIALS') {
          setError(payload?.message || 'شماره موبایل یا رمز عبور نادرست است.');
          return;
        }
        setError(payload?.message || 'ورود ناموفق بود. دوباره تلاش کنید.');
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
        <label className="form-field__label" htmlFor="login-mobile">
          شماره موبایل
        </label>
        <input
          id="login-mobile"
          type="tel"
          inputMode="numeric"
          dir="ltr"
          value={mobile}
          onChange={(e) => setMobile(e.target.value)}
          required
          autoComplete="username"
          placeholder="09123456789"
          pattern="09[0-9]{9}"
          maxLength={14}
        />
        <p className="form-field__hint">فرمت: ۱۱ رقم و شروع با ۰۹</p>
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
