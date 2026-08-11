import Link from 'next/link';

export default function AdminNotFound() {
  return (
    <div className="admin-page admin-content" style={{ padding: '2rem 1rem' }}>
      <div className="card" style={{ maxWidth: '28rem', margin: '0 auto', textAlign: 'center' }}>
        <h1 style={{ marginTop: 0 }}>صفحه پیدا نشد</h1>
        <p className="muted">این بخش در پنل مدیریت وجود ندارد یا آدرس آن تغییر کرده است.</p>
        <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link href="/admin/dashboard" className="btn btn--primary">
            داشبورد
          </Link>
          <Link href="/admin/articles" className="btn btn--secondary">
            مطالب
          </Link>
        </div>
      </div>
    </div>
  );
}
