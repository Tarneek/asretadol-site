import type { Metadata } from 'next';
import Link from 'next/link';
import { Breadcrumbs } from '@/components/site/listing';
import { ContactForm } from '@/components/site/contact-form';
import { SectionHeader } from '@/components/site/section-header';

export const metadata: Metadata = {
  title: 'تماس با ما',
  description:
    'راه‌های ارتباط با پایگاه خبری نیرا نیوز — آدرس، ایمیل و فرم تماس.',
  openGraph: {
    locale: 'fa_IR',
    type: 'website',
    title: 'تماس با ما | نیرا نیوز',
    description:
      'راه‌های ارتباط با پایگاه خبری نیرا نیوز — آدرس، ایمیل و فرم تماس.',
  },
};

const CONTACT = {
  email: 'info@niranews.ir',
  address: 'تهران، جردن، عاطفی شرقی، پلاک ۱۹',
  addressEn: 'Tehran, Jordan, East Atefi Street, No. 19',
} as const;

function IconMail() {
  return (
    <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden fill="none" stroke="currentColor" strokeWidth="1.75">
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <path d="M3 7l9 6 9-6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function IconLocation() {
  return (
    <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden fill="none" stroke="currentColor" strokeWidth="1.75">
      <path d="M12 21s7-4.5 7-11a7 7 0 1 0-14 0c0 6.5 7 11 7 11z" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="12" cy="10" r="2.5" />
    </svg>
  );
}

export default function ContactPage() {
  return (
    <div className="site-container-fluid blog-page">
      <Breadcrumbs
        items={[
          { label: 'خانه', href: '/' },
          { label: 'تماس با ما' },
        ]}
      />

      <SectionHeader title="تماس با ما" />

      <div className="contact-page">
        <aside className="contact-page__info blog-detail-inner" aria-label="اطلاعات تماس">
          <div className="article-body">
            <p className="contact-page__lead">
              برای ارسال خبر، پیشنهاد موضوع، همکاری تحریریه یا هرگونه پرسش، از راه‌های زیر با
              تیم <strong>نیرا نیوز</strong> در ارتباط باشید. در اسرع وقت پاسخگوی شما خواهیم بود.
            </p>
          </div>

          <ul className="contact-page__cards">
            <li className="contact-page__card">
              <span className="contact-page__card-icon" aria-hidden>
                <IconMail />
              </span>
              <div>
                <h3>ایمیل</h3>
                <a
                  href={`mailto:${CONTACT.email}`}
                  className="contact-page__link contact-page__link--ltr"
                >
                  {CONTACT.email}
                </a>
              </div>
            </li>

            <li className="contact-page__card">
              <span className="contact-page__card-icon" aria-hidden>
                <IconLocation />
              </span>
              <div>
                <h3>آدرس</h3>
                <p className="contact-page__address" dir="rtl">{CONTACT.address}</p>
                <p className="contact-page__address-en" lang="en" dir="ltr">
                  {CONTACT.addressEn}
                </p>
              </div>
            </li>
          </ul>

          <div className="contact-page__aside-links">
            <Link href="/about" className="contact-page__aside-link">
              درباره نیرا نیوز
            </Link>
            <Link href="/" className="contact-page__aside-link">
              بازگشت به صفحه اصلی
            </Link>
          </div>
        </aside>

        <section className="contact-page__form-panel blog-detail-inner" aria-label="فرم تماس">
          <ContactForm />
        </section>
      </div>
    </div>
  );
}
