import { AdminSidebar } from './admin-sidebar';
import type { SessionUser } from '@/lib/auth/session';

export function AdminShell({
  user,
  children,
}: {
  user: SessionUser;
  children: React.ReactNode;
}) {
  return (
    <div className="admin-shell">
      <AdminSidebar user={user} />
      <main className="admin-content">{children}</main>
    </div>
  );
}
