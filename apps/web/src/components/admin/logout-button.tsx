'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

export function LogoutButton() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleLogout() {
    setLoading(true);
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/admin/login');
    router.refresh();
  }

  return (
    <button
      type="button"
      className="btn btn--ghost btn--sm"
      onClick={handleLogout}
      disabled={loading}
    >
      {loading ? 'در حال خروج…' : 'خروج'}
    </button>
  );
}
