import type { Metadata } from 'next';
import Link from 'next/link';
import { Breadcrumbs } from '@/components/site/listing';
import { SectionHeader } from '@/components/site/section-header';

export const metadata: Metadata = {
  title: 'درباره ما',
  description:
    'آشنایی با پایگاه خبری تحلیلی نیرا نیوز — مأموریت، ارزش‌های تحریریه و حوزه‌های پوشش خبری.',
  openGraph: {
    locale: 'fa_IR',
    type: 'website',
    title: 'درباره ما | نیرا نیوز',
    description:
      'آشنایی با پایگاه خبری تحلیلی نیرا نیوز — مأموریت، ارزش‌های تحریریه و حوزه‌های پوشش خبری.',
  },
};

const EDITORIAL_VALUES = [
  {
    title: 'دقت و صحت',
    text: 'انتشار اخبار بر پایه منابع معتبر، راستی‌آزمایی چندلایه و اصلاح شفاف خطاهای احتمالی.',
  },
  {
    title: 'استقلال تحریریه',
    text: 'تفکیک کامل میان بخش خبری و تبلیغات؛ اولویت با منافع عمومی و دسترسی آزاد مخاطب به اطلاعات.',
  },
  {
    title: 'تحلیل عمیق',
    text: 'فراتر از خبر فوری؛ ارائه بستر، زمینه و پیامدهای رویدادها برای درک بهتر تحولات اقتصادی.',
  },
  {
    title: 'مسئولیت اجتماعی',
    text: 'پوشش منصفانه، پرهیز از اغراق و احترام به حقوق مخاطبان در گزارش‌دهی و نگارش.',
  },
] as const;

const COVERAGE_AREAS = [
  { href: '/category/iranian-economy', label: 'اقتصاد ایران' },
  { href: '/category/world-economy', label: 'اقتصاد جهان' },
  { href: '/category/politics', label: 'سیاست' },
  { href: '/category/international', label: 'بین‌الملل' },
  { href: '/category/society-events', label: 'جامعه و حوادث' },
  { href: '/category/sport', label: 'ورزش' },
  { href: '/category/health-medicine', label: 'سلامت و پزشکی' },
  { href: '/category/it', label: 'فناوری اطلاعات' },
] as const;

export default function AboutPage() {
  return (
    <div className="site-container-fluid blog-page">
      <Breadcrumbs
        items={[
          { label: 'خانه', href: '/' },
          { label: 'درباره ما' },
        ]}
      />

      <SectionHeader title="درباره ما" />

      <article className="blog-detail-inner about-page">
        <div className="description">
          <div className="article-body">
            <p className="about-page__lead">
              <strong>نیرا نیوز</strong> یک پایگاه خبری تحلیلی است که با تمرکز بر اقتصاد، سیاست
              و تحولات ملی و بین‌المللی، تلاش می‌کند رویدادهای مهم را با نگاهی دقیق، به‌موقع و
              قابل‌اتکا به مخاطبان ارائه دهد. شعار ما «اقتصاد، میدان نبرد جدید» است — نگاهی که
              اقتصاد را نه صرفاً مجموعه‌ای از اعداد و نمودارها، بلکه میدانی از تصمیم‌ها، فرصت‌ها
              و چالش‌های زندگی روزمره می‌داند.
            </p>

            <h2>مأموریت ما</h2>
            <p>
              مأموریت نیرا نیوز تقویت آگاهی عمومی از طریق خبرنگاری مسئولانه، تحلیل روشن و
              دسترسی آسان به اطلاعات معتبر است. ما می‌کوشیم پلی میان رویدادهای پیچیده اقتصادی و
              نیاز مخاطبان به درک سریع و عمیق باشیم — بدون ساده‌انگاری افراطی و بدون پیچیدگی
              غیرضروری.
            </p>
            <p>
              {/* Placeholder — replace with your organization's official mission statement. */}
              تیم تحریریه ما هر روز بر پایش بازارها، سیاست‌های کلان، تحولات منطقه‌ای و روندهای
              جهانی متمرکز است تا مهم‌ترین خبرها را با زاویه‌ای تحلیلی و کاربردی منتشر کند.
            </p>

            <h2>ارزش‌های تحریریه</h2>
            <p>
              استانداردهای تحریریه ما چارچوبی است که کیفیت و اعتماد مخاطبان را تضمین می‌کند. این
              متن‌ها را می‌توانید با سیاست‌های رسمی سازمان خود جایگزین کنید.
            </p>
          </div>

          <ul className="about-page__highlights" aria-label="ارزش‌های تحریریه">
            {EDITORIAL_VALUES.map((item) => (
              <li key={item.title} className="about-page__highlight">
                <h3>{item.title}</h3>
                <p>{item.text}</p>
              </li>
            ))}
          </ul>

          <div className="article-body">
            <h2>حوزه‌های پوشش</h2>
            <p>
              نیرا نیوز طیف گسترده‌ای از موضوعات را پوشش می‌دهد. برای مشاهده آخرین مطالب هر
              بخش، روی دسته‌بندی مورد نظر کلیک کنید.
            </p>
          </div>

          <ul className="about-page__coverage" aria-label="حوزه‌های پوشش خبری">
            {COVERAGE_AREAS.map((item) => (
              <li key={item.href}>
                <Link href={item.href}>{item.label}</Link>
              </li>
            ))}
          </ul>

          <div className="article-body">
            <h2>تیم و همکاری</h2>
            <p>
              {/* Placeholder — replace with bios, org chart, or partnership details. */}
              تیم نیرا نیوز از خبرنگاران، تحلیل‌گران و ویراستاران با تجربه تشکیل شده است. اگر
              برای همکاری، ارسال خبر یا پیشنهاد موضوع تمایل دارید، از طریق بخش تماس با ما با
              ما در ارتباط باشید.
            </p>

            <div className="about-page__cta">
              <Link href="/contact" className="btn-danger">
                تماس با ما
              </Link>
              <Link href="/" className="about-page__cta-link">
                بازگشت به صفحه اصلی
              </Link>
            </div>
          </div>
        </div>
      </article>
    </div>
  );
}
