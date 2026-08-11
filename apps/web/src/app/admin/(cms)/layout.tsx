import { redirect } from 'next/navigation';
import { AdminShell } from '@/components/admin/admin-shell';
import { ApiConfigurationNotice } from '@/components/site/api-configuration-notice';
import { getApiEnv } from '@/lib/env';
import { getSession } from '@/lib/auth/session';

export default async function AdminCmsLayout({ children }: { children: React.ReactNode }) {
  const apiEnv = getApiEnv();
  if (apiEnv.status === 'missing') {
    return (
      <div className="admin-page admin-content">
        <ApiConfigurationNotice config={apiEnv} variant="admin" />
      </div>
    );
  }

  const session = await getSession();
  if (!session) {
    redirect('/admin/login');
  }

  return (
    <div className="admin-page">
      <AdminShell user={session}>{children}</AdminShell>
    </div>
  );
}
