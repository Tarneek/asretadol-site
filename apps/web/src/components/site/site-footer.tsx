import Link from 'next/link';
import {
  IconCamera,
  IconPlay,
  IconSend,
  IconShareNetwork,
} from '@/components/icons/site-icons';

const INTERNAL = [
  { href: '#', label: 'قوانین و مقررات' },
  { href: '#', label: 'حفظ حریم خصوصی' },
  { href: '#', label: 'راهنمای استفاده' },
  { href: '#contact', label: 'تماس با ما' },
];

const CATS_A = [
  { href: '/category/politics', label: 'سیاست' },
  { href: '/category/iranian-economy', label: 'اقتصاد ایران' },
  { href: '/category/world-economy', label: 'اقتصاد جهان' },
  { href: '/category/international', label: 'بین‌الملل' },
];

const CATS_B = [
  { href: '/category/society-events', label: 'جامعه و حوادث' },
  { href: '/category/sport', label: 'ورزش' },
  { href: '/category/health-medicine', label: 'سلامت و پزشکی' },
  { href: '/category/it', label: 'فناوری اطلاعات' },
];

const SOCIAL = [
  { name: 'تلگرام', href: '#', Icon: IconSend },
  { name: 'فیسبوک', href: '#', Icon: IconShareNetwork },
  { name: 'اینستاگرام', href: '#', Icon: IconCamera },
  { name: 'یوتیوب', href: '#', Icon: IconPlay },
] as const;

export function SiteFooter() {
  return (
    <footer className="footer" id="contact">
      <div className="site-container-fluid footer-grid">
        <div>
          <h6>پیوندهای داخلی</h6>
          <ul>
            {INTERNAL.map((item) => (
              <li key={item.label}>
                <Link href={item.href}>{item.label}</Link>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h6>دسته‌بندی</h6>
          <ul>
            {CATS_A.map((item) => (
              <li key={item.href}>
                <Link href={item.href}>{item.label}</Link>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h6>دسته‌بندی</h6>
          <ul>
            {CATS_B.map((item) => (
              <li key={item.href}>
                <Link href={item.href}>{item.label}</Link>
              </li>
            ))}
          </ul>
        </div>
        <div id="about">
          <h5>برای دریافت خبرنامه عضو شوید</h5>
          <form>
            <input type="email" placeholder="ایمیل شما" aria-label="ایمیل خبرنامه" />
            <button type="button" className="btn-danger">
              عضو شوید
            </button>
          </form>
          <div className="sotial" aria-label="شبکه‌های اجتماعی">
            {SOCIAL.map(({ name, href, Icon }) => (
              <a key={name} href={href} aria-label={name}>
                <Icon size={18} />
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
