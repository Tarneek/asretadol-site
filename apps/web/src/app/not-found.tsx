import Link from 'next/link';
import '@/styles/site.css';

export default function NotFound() {
  return (
    <div className="site-root" style={{ padding: '4rem 1rem', textAlign: 'center' }}>
      <h1 style={{ color: '#fff', marginBottom: '1rem' }}>صفحه پیدا نشد</h1>
      <p style={{ color: '#aaa', marginBottom: '1.5rem' }}>
        مطلب یا صفحه‌ای که دنبال آن هستید در دسترس نیست.
      </p>
      <Link href="/" className="btn-danger" style={{ padding: '0.6rem 1.2rem' }}>
        بازگشت به خانه
      </Link>
    </div>
  );
}
