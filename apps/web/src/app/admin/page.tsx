import { redirect } from 'next/navigation';

/** Canonical dashboard lives at /admin/dashboard (inside the CMS layout). */
export default function AdminIndexPage() {
  redirect('/admin/dashboard');
}
