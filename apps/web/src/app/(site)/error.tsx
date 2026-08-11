'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import {
  isApiConfigurationError,
  ApiConfigurationNotice,
} from '@/components/site/api-configuration-notice';
import {
  ApiUnavailableNotice,
  isApiUnavailableError,
} from '@/components/site/api-unavailable-notice';

export default function SiteError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  if (isApiConfigurationError(error)) {
    return <ApiConfigurationNotice config={error.config} variant="site" />;
  }

  if (isApiUnavailableError(error) || error.message.includes('fetch failed')) {
    return <ApiUnavailableNotice error={error} />;
  }

  return (
    <div className="site-container-fluid" style={{ padding: '3rem 1rem', color: '#fff' }}>
      <h2>خطا در بارگذاری صفحه</h2>
      <p style={{ color: '#aaa', margin: '1rem 0' }}>{error.message}</p>
      <button type="button" className="btn-danger" onClick={reset} style={{ marginLeft: '0.5rem' }}>
        تلاش مجدد
      </button>
      <Link href="/" className="btn-danger" style={{ padding: '0.5rem 1rem' }}>
        خانه
      </Link>
    </div>
  );
}
