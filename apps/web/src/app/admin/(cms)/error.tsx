'use client';

import Link from 'next/link';

export default function AdminCmsError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="state-box" role="alert">
      <h2 className="state-box__title">خطایی رخ داد</h2>
      <p className="state-box__message">
        {error.message || 'بارگذاری این صفحهٔ مدیریت ممکن نشد.'}
      </p>
      <div className="row-actions" style={{ justifyContent: 'center', marginTop: '1.25rem' }}>
        <button type="button" className="btn btn--secondary" onClick={reset}>
          تلاش دوباره
        </button>
        <Link href="/admin/dashboard" className="btn btn--primary">
          داشبورد
        </Link>
      </div>
    </div>
  );
}
