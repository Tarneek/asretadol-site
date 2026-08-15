import { ArticleStatus } from '../../common/enums/article-status.enum';
import { StoryMediaType } from '../../common/enums/story-media-type.enum';
import { ARTICLE_PLACEHOLDER_IMAGE_PATH } from '../../modules/articles/article-media.constants';

/** Marker article — presence means demo seed already ran. */
export const DEMO_SEED_MARKER_SLUG = 'oil-prices-edge-higher-after-opec-guidance';

export type DemoCategorySeed = {
  slug: string;
  name: string;
  description: string;
  sortOrder: number;
};

export type DemoTagSeed = {
  slug: string;
  name: string;
};

export type DemoAuthorSeed = {
  email: string;
  mobile: string;
  displayName: string;
  role: 'editor' | 'author';
};

export type DemoArticleSeed = {
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  status: ArticleStatus;
  featured: boolean;
  hero: boolean;
  breaking: boolean;
  publishedDaysAgo?: number;
  categorySlugs: string[];
  tagSlugs: string[];
  authorEmail: string;
  seoTitle: string;
  seoDescription: string;
  featuredImage: string;
};

export type DemoStorySeed = {
  title: string;
  mediaUrl: string;
  mediaType: StoryMediaType;
  link?: string;
  isActive?: boolean;
};

const unsplash = (id: string) =>
  `https://images.unsplash.com/${id}?auto=format&fit=crop&w=1200&q=80`;

const AUTHORS = [
  'editor@news.local',
  'sara.author@news.local',
  'ali.author@news.local',
] as const;

/** Categories aligned with public nav / homepage section links. */
export const demoCategories: DemoCategorySeed[] = [
  {
    slug: 'iranian-economy',
    name: 'اقتصاد ایران',
    description: 'بازارها، سیاست پولی و شاخص‌های اقتصاد داخلی',
    sortOrder: 1,
  },
  {
    slug: 'world-economy',
    name: 'اقتصاد جهان',
    description: 'روندهای اقتصادی بین‌المللی، انرژی و تجارت',
    sortOrder: 2,
  },
  {
    slug: 'politics',
    name: 'سیاست',
    description: 'سیاست داخلی و تصمیم‌های کلان اقتصادی',
    sortOrder: 3,
  },
  {
    slug: 'international',
    name: 'بین‌الملل',
    description: 'رویدادهای بین‌المللی با اثر اقتصادی',
    sortOrder: 4,
  },
  {
    slug: 'it',
    name: 'فناوری اطلاعات',
    description: 'فناوری، دیجیتال و اقتصاد دانش‌بنیان',
    sortOrder: 5,
  },
  {
    slug: 'business',
    name: 'کسب‌وکار',
    description: 'شرکت‌ها، صنایع و کارآفرینی',
    sortOrder: 6,
  },
  {
    slug: 'society-events',
    name: 'جامعه و حوادث',
    description: 'رویدادهای اجتماعی و اخبار روز',
    sortOrder: 7,
  },
  {
    slug: 'sport',
    name: 'ورزش',
    description: 'ورزش و اقتصاد ورزش',
    sortOrder: 8,
  },
  {
    slug: 'health-medicine',
    name: 'سلامت و پزشکی',
    description: 'سلامت، پزشکی و صنعت دارو',
    sortOrder: 9,
  },
];

export const demoTags: DemoTagSeed[] = [
  { slug: 'inflation', name: 'تورم' },
  { slug: 'markets', name: 'بازار سرمایه' },
  { slug: 'oil', name: 'نفت' },
  { slug: 'central-bank', name: 'بانک مرکزی' },
  { slug: 'trade', name: 'تجارت' },
  { slug: 'energy', name: 'انرژی' },
  { slug: 'startup', name: 'استارتاپ' },
  { slug: 'europe', name: 'اروپا' },
  { slug: 'asia', name: 'آسیا' },
  { slug: 'budget', name: 'بودجه' },
  { slug: 'analysis', name: 'تحلیل' },
  { slug: 'gold', name: 'طلا' },
  { slug: 'forex', name: 'ارز' },
];

export const demoAuthors: DemoAuthorSeed[] = [
  { email: 'editor@news.local', mobile: '09121110001', displayName: 'مریم کاظمی', role: 'editor' },
  { email: 'sara.author@news.local', mobile: '09121110002', displayName: 'سارا موسوی', role: 'author' },
  { email: 'ali.author@news.local', mobile: '09121110003', displayName: 'علی رضایی', role: 'author' },
];

type ArticleBlueprint = {
  slug: string;
  title: string;
  excerpt: string;
  paragraphs: string[];
  status?: ArticleStatus;
  featured?: boolean;
  hero?: boolean;
  breaking?: boolean;
  publishedDaysAgo?: number;
  categorySlugs: string[];
  tagSlugs: string[];
  authorEmail?: string;
};

function buildArticle(bp: ArticleBlueprint, index: number): DemoArticleSeed {
  const content = bp.paragraphs.join('\n\n');
  const status = bp.status ?? ArticleStatus.Published;
  const authorEmail = bp.authorEmail ?? AUTHORS[index % AUTHORS.length];

  return {
    slug: bp.slug,
    title: bp.title,
    excerpt: bp.excerpt,
    content,
    status,
    featured: Boolean(bp.featured) && status === ArticleStatus.Published,
    hero: Boolean(bp.hero) && status === ArticleStatus.Published,
    breaking: Boolean(bp.breaking) && status === ArticleStatus.Published,
    publishedDaysAgo:
      status === ArticleStatus.Draft ? undefined : (bp.publishedDaysAgo ?? index),
    categorySlugs: bp.categorySlugs,
    tagSlugs: bp.tagSlugs,
    authorEmail,
    seoTitle: `${bp.title} | عصر تعادل`,
    seoDescription: bp.excerpt.slice(0, 160),
    featuredImage: ARTICLE_PLACEHOLDER_IMAGE_PATH,
  };
}

const blueprints: ArticleBlueprint[] = [
  // --- Iranian economy (4+) ---
  {
    slug: DEMO_SEED_MARKER_SLUG,
    title: 'قیمت نفت پس از اعلام سهمیه‌بندی جدید اوپک‌پلاس در آستانه ثبت رشد',
    excerpt:
      'معامله‌گران انرژی پس از نشست هفتگی اوپک‌پلاس، انتظار کاهش تدریجی عرضه را در محاسبات خود لحاظ کردند.',
    paragraphs: [
      'قیمت نفت در معاملات ابتدای هفته با بازگشت ریسک‌پذیری به بازارها، از سطح ۸۲ دلار عبور کرد. تحلیلگران می‌گویند ترکیب سیاست انقباضی عرضه و تقاضای فصل گرمایش در آسیا، فشار صعودی کوتاه‌مدت ایجاد کرده است.',
      'در گزارش هفتگی، اوپک‌پلاس اشاره کرد که کشورهای داوطلب می‌توانند سهمیه تولید را در سه ماه آینده به‌صورت تدریجی کاهش دهند.',
      'کارشناسان هشدار می‌دهند نوسانات ژئوپلیتیک در خاورمیانه همچنان می‌تواند هر برآورد بنیادی را به‌سرعت باطل کند.',
    ],
    featured: true,
    hero: true,
    breaking: true,
    publishedDaysAgo: 0,
    categorySlugs: ['iranian-economy', 'world-economy'],
    tagSlugs: ['oil', 'energy', 'markets'],
    authorEmail: 'editor@news.local',
  },
  {
    slug: 'central-bank-holds-policy-rate-steady',
    title: 'بانک مرکزی نرخ سیاست پولی را بدون تغییر نگه داشت',
    excerpt:
      'کمیته سیاست پولی با استناد به تثبیت تورم ماهانه، فعلاً از تغییر نرخ بهره خودداری کرد.',
    paragraphs: [
      'بانک مرکزی در بیانیه‌ای اعلام کرد نرخ هدف را در سطح فعلی حفظ می‌کند تا روند کاهشی تورم تثبیت شود.',
      'بانک‌ها انتظار دارند نقدینگی بازار بین‌بانکی در محدوده فعلی باقی بماند.',
      'گزارش‌ها از بهبود تدریجی سرمایه‌گذاری در زیرساخت‌های انرژی خبر می‌دهند، هرچند هزینه تأمین مالی همچنان چالش اصلی پروژه‌هاست.',
    ],
    featured: true,
    hero: true,
    publishedDaysAgo: 1,
    categorySlugs: ['iranian-economy', 'politics'],
    tagSlugs: ['central-bank', 'inflation'],
    authorEmail: 'editor@news.local',
  },
  {
    slug: 'stock-index-records-third-weekly-gain',
    title: 'شاخص بورس سومین هفته متوالی در مسیر صعود',
    excerpt: 'ورود پول حقیقی به گروه‌های صنعتی و فلزات اساسی، روند مثبت معاملات را تقویت کرد.',
    paragraphs: [
      'معامله‌گران خرد در هفته‌ای که گذشت، نقش پررنگ‌تری در حجم معاملات ایفا کردند.',
      'ارزش معاملات در بازار مشتقه افزایش یافت که برخی آن را نشانه مدیریت ریسک فعال می‌دانند.',
      'گزارش‌های فصلی شرکت‌های بزرگ در هفته آینده منتشر می‌شود.',
    ],
    publishedDaysAgo: 2,
    categorySlugs: ['iranian-economy', 'business'],
    tagSlugs: ['markets'],
  },
  {
    slug: 'gold-price-climbs-on-safe-haven-demand',
    title: 'قیمت طلا با افزایش تقاضای دارایی امن بالا رفت',
    excerpt: 'نوسان بازار ارز و انتظار برای داده تورم، خرید طلا را تقویت کرد.',
    paragraphs: [
      'در بازار داخلی، هر گرم طلای ۱۸ عیار رشد محدودی را ثبت کرد.',
      'تحلیلگران می‌گویند همبستگی طلا با نرخ ارز همچنان بالا مانده است.',
      'سرمایه‌گذاران خرد بخشی از نقدینگی خود را به صندوق‌های طلا منتقل کرده‌اند.',
    ],
    featured: true,
    breaking: true,
    publishedDaysAgo: 3,
    categorySlugs: ['iranian-economy'],
    tagSlugs: ['gold', 'forex', 'inflation'],
  },
  {
    slug: 'fx-market-volatility-narrows-after-intervention',
    title: 'نوسان بازار ارز پس از مداخله محدود کاهش یافت',
    excerpt: 'عرضه اسکناس در صرافی‌های منتخب، فاصله نرخ‌ها را کم کرد.',
    paragraphs: [
      'مقامات پولی اعلام کردند هدف، مدیریت انتظارات است نه تعیین دستوری نرخ.',
      'واردکنندگان مواد اولیه از بهبود نسبی دسترسی به ارز خبر دادند.',
    ],
    publishedDaysAgo: 4,
    categorySlugs: ['iranian-economy'],
    tagSlugs: ['forex', 'central-bank'],
  },

  // --- World economy (4+) ---
  {
    slug: 'eu-inflation-cools-more-than-forecast',
    title: 'تورم منطقه یورو بیش از پیش‌بینی کند شد',
    excerpt: 'کاهش قیمت انرژی و تعدیل تقاضای مصرفی، فشار تورمی اروپا را تخفیف داد.',
    paragraphs: [
      'آمار تازه اتحادیه اروپا نشان می‌دهد تورم سالانه برای دومین ماه متوالی از سقف خود فاصله گرفته است.',
      'بانک مرکزی اروپا تأکید کرد هنوز زود است درباره چرخش سیاست پولی تصمیم قطعی گرفته شود.',
    ],
    featured: true,
    publishedDaysAgo: 2,
    categorySlugs: ['world-economy', 'international'],
    tagSlugs: ['europe', 'inflation', 'central-bank', 'analysis'],
  },
  {
    slug: 'asia-manufacturing-pmi-expands',
    title: 'شاخص مدیران خرید صنعت آسیا وارد محدوده رشد شد',
    excerpt: 'بهبود سفارش‌های صادراتی چین و هند، امید به تثبیت تقاضای جهانی را زنده کرد.',
    paragraphs: [
      'شاخص PMI تولید در چند اقتصاد آسیا‌پسیفیک از مرز ۵۰ واحد عبور کرد.',
      'زنجیره تأمین الکترونیک گزارش داد زمان تحویل قطعات نیمه‌هادی کوتاه‌تر شده است.',
    ],
    publishedDaysAgo: 3,
    categorySlugs: ['world-economy', 'international'],
    tagSlugs: ['asia', 'trade'],
  },
  {
    slug: 'us-jobless-claims-edge-higher',
    title: 'درخواست‌های بیمه بیکاری در آمریکا اندکی افزایش یافت',
    excerpt: 'بازار کار همچنان مقاوم است اما نشانه‌های سرد شدن تقاضای نیروی کار دیده می‌شود.',
    paragraphs: [
      'اقتصاددانان می‌گویند این داده با سناریوی فرود نرم سازگار است.',
      'بازار اوراق خزانه واکنش محدودی نشان داد.',
    ],
    publishedDaysAgo: 5,
    categorySlugs: ['world-economy'],
    tagSlugs: ['markets', 'analysis'],
  },
  {
    slug: 'global-shipping-rates-ease',
    title: 'هزینه حمل دریایی جهانی کاهش یافت',
    excerpt: 'افزایش ظرفیت ناوگان و آرامش نسبی در مسیرهای اصلی، کرایه کانتینر را پایین آورد.',
    paragraphs: [
      'واردکنندگان کالاهای مصرفی از بهبود زمان تحویل خبر دادند.',
      'با این حال ریسک‌های ژئوپلیتیک در برخی کریدورها باقی است.',
    ],
    publishedDaysAgo: 6,
    categorySlugs: ['world-economy', 'business'],
    tagSlugs: ['trade', 'energy'],
  },

  // --- Politics (4) ---
  {
    slug: 'budget-bill-debate-enters-final-stage',
    title: 'لایحه بودجه وارد مرحله نهایی بررسی مجلس شد',
    excerpt: 'نمایندگان بر سر سقف هزینه‌کرد عمرانی و منابع درآمدی مالیاتی به توافق نزدیک شدند.',
    paragraphs: [
      'کمیسیون‌های تخصصی گزارش دادند رشد هزینه‌های جاری باید با محدودیت‌های برنامه پنج‌ساله هم‌راستا بماند.',
      'اقتصاددانان هشدار دادند اگر منابع درآمدی محقق نشود، فشار بر بازار بدهی افزایش می‌یابد.',
    ],
    featured: true,
    publishedDaysAgo: 1,
    categorySlugs: ['politics', 'iranian-economy'],
    tagSlugs: ['budget', 'inflation', 'analysis'],
  },
  {
    slug: 'interview-minister-on-trade-corridors',
    title: 'گفت‌وگو با وزیر: کریدورهای تجاری جدید فرصت صادرات غیرنفتی',
    excerpt: 'وزیر گفت تمرکز بر لجستیک هوشمند و یکپارچه‌سازی گمرکی می‌تواند هزینه صادرات را کاهش دهد.',
    paragraphs: [
      'توسعه کریدور شمال-جنوب بخشی از استراتژی کاهش وابستگی به یک بازار واحد است.',
      'دیجیتال‌سازی فرآیندهای گمرکی در ۱۲ مرز تجاری در حال اجراست.',
    ],
    publishedDaysAgo: 4,
    categorySlugs: ['politics', 'international'],
    tagSlugs: ['trade', 'asia'],
  },
  {
    slug: 'parliament-reviews-tax-incentive-bill',
    title: 'مجلس طرح مشوق مالیاتی تولید را بررسی می‌کند',
    excerpt: 'نمایندگان بر شفافیت معیارهای برخورداری از معافیت تأکید دارند.',
    paragraphs: [
      'اتاق بازرگانی خواستار تسریع در تصویب بندهای مرتبط با صادرات خدمات شد.',
      'کارشناسان بودجه نسبت به اثر کسری هشدار دادند.',
    ],
    publishedDaysAgo: 7,
    categorySlugs: ['politics', 'business'],
    tagSlugs: ['budget', 'trade'],
  },
  {
    slug: 'cabinet-approves-energy-efficiency-plan',
    title: 'هیئت دولت برنامه بهره‌وری انرژی را تصویب کرد',
    excerpt: 'هدف کاهش شدت مصرف انرژی در صنایع انرژی‌بر طی سه سال است.',
    paragraphs: [
      'وزارت نیرو از مشوق‌های تعرفه‌ای برای واحدهای کم‌مصرف خبر داد.',
      'صنایع فولاد و سیمان خواستار مهلت تطبیق طولانی‌تر شدند.',
    ],
    publishedDaysAgo: 8,
    categorySlugs: ['politics', 'iranian-economy'],
    tagSlugs: ['energy', 'budget'],
  },

  // --- International (3) ---
  {
    slug: 'g20-finance-chiefs-meet-on-debt',
    title: 'نشست وزرای دارایی گروه ۲۰ با محور بدهی کشورها',
    excerpt: 'بازسازی بدهی کشورهای کم‌درآمد و هماهنگی سیاست پولی در دستور کار است.',
    paragraphs: [
      'صندوق بین‌المللی پول خواستار شفافیت بیشتر در قراردادهای بدهی شد.',
      'بازارهای نوظهور به نتایج نشست حساس مانده‌اند.',
    ],
    publishedDaysAgo: 5,
    categorySlugs: ['international', 'world-economy'],
    tagSlugs: ['trade', 'analysis'],
  },
  {
    slug: 'middle-east-trade-pact-talks-advance',
    title: 'مذاکرات پیمان تجاری منطقه‌ای پیشرفت کرد',
    excerpt: 'کاهش تعرفه کالاهای صنعتی در پیش‌نویس جدید گنجانده شده است.',
    paragraphs: [
      'دیپلمات‌ها می‌گویند هنوز بندهای خدمات و سرمایه‌گذاری باز است.',
      'بخش خصوصی از فرصت دسترسی به بازارهای همسایه استقبال کرد.',
    ],
    publishedDaysAgo: 9,
    categorySlugs: ['international'],
    tagSlugs: ['trade', 'asia'],
  },
  {
    slug: 'global-climate-fund-pledges-update',
    title: 'تعهدات تازه صندوق اقلیم برای پروژه‌های سازگاری',
    excerpt: 'منابع بیشتری به پروژه‌های آب و انرژی تجدیدپذیر اختصاص می‌یابد.',
    paragraphs: [
      'کشورهای در حال توسعه خواستار تسریع در پرداخت تعهدات شدند.',
      'بانک‌های توسعه منطقه‌ای نقش واسطه تأمین مالی را پررنگ‌تر می‌کنند.',
    ],
    publishedDaysAgo: 10,
    categorySlugs: ['international', 'world-economy'],
    tagSlugs: ['energy', 'analysis'],
  },

  // --- IT / tech (4) ---
  {
    slug: 'fintech-round-raises-record-series-b',
    title: 'استارتاپ فین‌تک ایرانی رکورد جذب سرمایه سری B را شکست',
    excerpt: 'پلتفرم پرداخت B2B با تمرکز بر زنجیره تأمین، ۴۵ میلیون دلار سرمایه جذب کرد.',
    paragraphs: [
      'تمرکز بر سودآوری واحد اقتصادی، دلیل اصلی اعتماد سرمایه‌گذاران بوده است.',
      'شرکت قصد دارد در ۱۸ ماه آینده به سه بازار همسایه توسعه یابد.',
    ],
    featured: true,
    publishedDaysAgo: 2,
    categorySlugs: ['it', 'business'],
    tagSlugs: ['startup', 'markets'],
  },
  {
    slug: 'cloud-adoption-accelerates-in-banking',
    title: 'بانک‌ها مهاجرت به زیرساخت ابری را سرعت دادند',
    excerpt: 'هزینه نگهداری مراکز داده سنتی، مهاجرت تدریجی به ابر خصوصی را جذاب کرده است.',
    paragraphs: [
      'امنیت داده و الزامات رگولاتوری همچنان دغدغه اصلی است.',
      'تأمین‌کنندگان محلی از رشد تقاضا برای خدمات مدیریت‌شده خبر دادند.',
    ],
    publishedDaysAgo: 6,
    categorySlugs: ['it'],
    tagSlugs: ['startup', 'markets'],
  },
  {
    slug: 'ai-tools-boost-factory-productivity',
    title: 'ابزارهای هوش مصنوعی بهره‌وری خطوط تولید را بالا برد',
    excerpt: 'کارخانه‌های نمونه از کاهش توقف‌های برنامه‌ریزی‌نشده گزارش دادند.',
    paragraphs: [
      'پیاده‌سازی مدل‌های پیش‌بینی خرابی نیازمند داده باکیفیت است.',
      'کارشناسان نیروی کار بر آموزش مجدد اپراتورها تأکید دارند.',
    ],
    publishedDaysAgo: 11,
    categorySlugs: ['it', 'business'],
    tagSlugs: ['startup', 'analysis'],
  },
  {
    slug: 'cybersecurity-spend-hits-new-high',
    title: 'هزینه امنیت سایبری شرکت‌ها به سقف تازه‌ای رسید',
    excerpt: 'حملات باج‌افزاری و الزامات بیمه سایبری بودجه IT را جابه‌جا کرده است.',
    paragraphs: [
      'مدیران فناوری می‌گویند اولویت با پایش مستمر و پاسخ سریع است.',
      'بازار نیروی متخصص امنیت همچنان با کمبود مواجه است.',
    ],
    publishedDaysAgo: 12,
    categorySlugs: ['it'],
    tagSlugs: ['startup'],
  },

  // --- Business (3) ---
  {
    slug: 'renewable-capacity-additions-accelerate',
    title: 'ظرفیت نیروگاه‌های تجدیدپذیر با رکورد نیم‌سال افزایش یافت',
    excerpt: 'قراردادهای خرید تضمینی انرژی، سرعت احداث پروژه‌های خورشیدی را بالا برد.',
    paragraphs: [
      'بیش از ۲ گیگاوات ظرفیت خورشیدی در شش ماه نخست به شبکه اضافه شد.',
      'چالش اتصال به شبکه انتقال در برخی استان‌ها همچنان پابرجاست.',
    ],
    publishedDaysAgo: 4,
    categorySlugs: ['business', 'iranian-economy'],
    tagSlugs: ['energy'],
  },
  {
    slug: 'retail-sales-rebound-in-major-cities',
    title: 'فروش خرده‌فروشی در کلان‌شهرها بهبود یافت',
    excerpt: 'رشد فروش آنلاین و بازگشت ترافیک فروشگاه‌ها، شاخص مصرف را بالا برد.',
    paragraphs: [
      'برندهای پوشاک و لوازم خانگی بیشترین سهم رشد را داشتند.',
      'تورم همچنان قدرت خرید را تحت فشار نگه داشته است.',
    ],
    publishedDaysAgo: 8,
    categorySlugs: ['business', 'society-events'],
    tagSlugs: ['markets', 'inflation'],
  },
  {
    slug: 'sme-credit-guarantee-scheme-expands',
    title: 'طرح تضمین اعتبار بنگاه‌های کوچک گسترش یافت',
    excerpt: 'بانک‌ها سقف ضمانت را برای واحدهای صادرات‌محور افزایش دادند.',
    paragraphs: [
      'اتاق اصناف از تسریع در پرداخت تسهیلات استقبال کرد.',
      'کارشناسان نسبت به کیفیت اعتبارسنجی هشدار دادند.',
    ],
    publishedDaysAgo: 13,
    categorySlugs: ['business'],
    tagSlugs: ['markets', 'trade'],
  },

  // --- Society / sport / health (2 each) ---
  {
    slug: 'urban-transit-ridership-recovers',
    title: 'مسافرپذیری حمل‌ونقل عمومی شهری احیا شد',
    excerpt: 'افزایش ناوگان و بهبود زمان‌بندی، سهم سفرهای عمومی را بالا برد.',
    paragraphs: [
      'شهرداری‌ها از کاهش نسبی ترافیک در ساعات اوج خبر دادند.',
      'کارشناسان ترافیک خواستار سرمایه‌گذاری پایدار در خطوط مترو شدند.',
    ],
    publishedDaysAgo: 7,
    categorySlugs: ['society-events'],
    tagSlugs: ['budget'],
  },
  {
    slug: 'housing-starts-show-modest-rise',
    title: 'شروع پروژه‌های مسکن رشد ملایمی ثبت کرد',
    excerpt: 'کاهش جزئی هزینه مصالح، انگیزه سازندگان را تقویت کرد.',
    paragraphs: [
      'با این حال دسترسی به تسهیلات ساخت همچنان محدود است.',
      'قیمت زمین در حاشیه کلان‌شهرها همچنان عامل اصلی هزینه است.',
    ],
    publishedDaysAgo: 14,
    categorySlugs: ['society-events', 'iranian-economy'],
    tagSlugs: ['inflation', 'budget'],
  },
  {
    slug: 'sports-league-broadcast-rights-deal',
    title: 'قرارداد حق پخش لیگ ورزشی به توافق رسید',
    excerpt: 'باشگاه‌ها از شفافیت تقسیم درآمد استقبال کردند.',
    paragraphs: [
      'تحلیلگران اقتصاد ورزش می‌گویند ارزش‌گذاری مخاطب دیجیتال کلیدی است.',
      'اسپانسرها انتظار بسته تبلیغاتی یکپارچه دارند.',
    ],
    publishedDaysAgo: 9,
    categorySlugs: ['sport', 'business'],
    tagSlugs: ['markets'],
  },
  {
    slug: 'national-team-sponsorship-boosts-brands',
    title: 'اسپانسرشیپ تیم ملی برندهای ورزشی را تقویت کرد',
    excerpt: 'فروش پوشاک ورزشی پس از اعلام قرارداد رشد کرد.',
    paragraphs: [
      'بازار ثانویه بلیت و محصولات جانبی نیز رونق گرفت.',
      'اقتصاددانان به اثر کوتاه‌مدت کمپین‌های ورزشی اشاره دارند.',
    ],
    publishedDaysAgo: 15,
    categorySlugs: ['sport'],
    tagSlugs: ['markets'],
  },
  {
    slug: 'pharma-exports-rise-on-regional-demand',
    title: 'صادرات دارو با تقاضای منطقه‌ای افزایش یافت',
    excerpt: 'کارخانه‌های دارویی از رشد سفارش‌های صادراتی خبر دادند.',
    paragraphs: [
      'تأمین ماده اولیه همچنان وابسته به واردات است.',
      'وزارت بهداشت بر کنترل کیفیت محموله‌های صادراتی تأکید کرد.',
    ],
    publishedDaysAgo: 10,
    categorySlugs: ['health-medicine', 'business'],
    tagSlugs: ['trade', 'asia'],
  },
  {
    slug: 'hospital-digitization-pilot-expands',
    title: 'طرح پایلوت دیجیتال‌سازی بیمارستان‌ها گسترش یافت',
    excerpt: 'پرونده الکترونیک سلامت در چند استان دیگر فعال می‌شود.',
    paragraphs: [
      'پزشکان خواستار آموزش و پشتیبانی فنی پایدار شدند.',
      'صرفه‌جویی در هزینه اداری یکی از اهداف رسمی طرح است.',
    ],
    publishedDaysAgo: 16,
    categorySlugs: ['health-medicine', 'it'],
    tagSlugs: ['startup', 'analysis'],
  },

  // --- Analysis-tagged feature pieces ---
  {
    slug: 'analysis-global-growth-outlook-2026',
    title: 'تحلیل: چشم‌انداز رشد جهانی در سایه انتخابات و جنگ تجاری',
    excerpt: 'یادداشت تحلیلی درباره سناریوهای محتمل برای تجارت و سرمایه‌گذاری در ۱۸ ماه آینده.',
    paragraphs: [
      'بازارها همزمان با بهبود داده‌های تورم، نسبت به ریسک سیاسی حساس مانده‌اند.',
      'سه سناریو برای رشد جهانی در نظر گرفته شده: پایه، خوش‌بینانه و رکود ملایم.',
      'تنوع‌بخشی بین دارایی‌های واقعی و اوراق با کیفیت همچنان توصیه اصلی است.',
    ],
    featured: true,
    publishedDaysAgo: 3,
    categorySlugs: ['world-economy', 'international'],
    tagSlugs: ['analysis', 'trade', 'markets', 'inflation'],
    authorEmail: 'editor@news.local',
  },
  {
    slug: 'analysis-iran-inflation-path',
    title: 'تحلیل: مسیر تورم ایران در نیم‌سال دوم',
    excerpt: 'بررسی عوامل عرضه و تقاضا و نقش انتظارات در پایداری تورم.',
    paragraphs: [
      'تورم کالاهای بادوام حساسیت بیشتری به نرخ ارز نشان می‌دهد.',
      'سیاست پولی انقباضی بدون اصلاح ساختاری بودجه اثر محدودی دارد.',
    ],
    publishedDaysAgo: 5,
    categorySlugs: ['iranian-economy'],
    tagSlugs: ['analysis', 'inflation', 'central-bank'],
    authorEmail: 'editor@news.local',
  },
  {
    slug: 'analysis-energy-transition-costs',
    title: 'تحلیل: هزینه گذار انرژی برای صنایع سنگین',
    excerpt: 'برآورد سرمایه‌گذاری موردنیاز فولاد و سیمان برای کاهش انتشار.',
    paragraphs: [
      'قیمت کربن و دسترسی به فناوری، دو متغیر کلیدی سناریوها هستند.',
      'تأمین مالی ترکیبی دولتی-خصوصی می‌تواند ریسک پروژه را کاهش دهد.',
    ],
    publishedDaysAgo: 11,
    categorySlugs: ['business', 'world-economy'],
    tagSlugs: ['analysis', 'energy', 'budget'],
  },

  // --- Drafts ---
  {
    slug: 'draft-interview-green-transition-costs',
    title: 'پیش‌نویس: هزینه‌های گذار سبز برای صنایع سنگین چقدر است؟',
    excerpt: 'گزارش در حال تکمیل درباره برآورد سرمایه‌گذاری موردنیاز فولاد و سیمان.',
    paragraphs: [
      'این متن هنوز در مرحله ویراستاری است.',
      'نسخه نهایی شامل مصاحبه با مدیران توسعه پایدار خواهد بود.',
    ],
    status: ArticleStatus.Draft,
    categorySlugs: ['business', 'iranian-economy'],
    tagSlugs: ['energy', 'budget', 'analysis'],
    authorEmail: 'sara.author@news.local',
  },
  {
    slug: 'draft-local-elections-economic-agenda',
    title: 'پیش‌نویس: دستور کار اقتصادی نامزدها در انتخابات محلی',
    excerpt: 'مرور برنامه‌های منتشرشده کاندیداها درباره حمل‌ونقل شهری و مسکن.',
    paragraphs: [
      'این مقاله هنوز منتشر نشده است.',
      'تیم سیاست در حال مقایسه برنامه‌های اقتصادی نامزدهای شهری است.',
    ],
    status: ArticleStatus.Draft,
    categorySlugs: ['politics'],
    tagSlugs: ['budget'],
    authorEmail: 'ali.author@news.local',
  },
  {
    slug: 'draft-sme-digital-adoption-survey',
    title: 'پیش‌نویس: نتایج نظرسنجی دیجیتالی شدن بنگاه‌های کوچک',
    excerpt: 'داده‌ها در حال پالایش آماری است و هنوز برای انتشار تأیید نشده.',
    paragraphs: ['نسخه نهایی پس از بازبینی روش‌شناسی منتشر می‌شود.'],
    status: ArticleStatus.Draft,
    categorySlugs: ['it', 'business'],
    tagSlugs: ['startup'],
  },

  // --- Archived ---
  {
    slug: 'archived-legacy-tariff-framework-2024',
    title: 'بایگانی: چارچوب تعرفه‌ای ۲۰۲۴ دیگر اجرایی نیست',
    excerpt: 'نسخه قدیمی سیاست تجاری در پایان سال میلادی از سامانه‌ها حذف شد.',
    paragraphs: [
      'این گزارش بایگانی شده و فقط برای مرجع تاریخی نگهداری می‌شود.',
      'چارچوب تعرفه‌ای ۲۰۲۴ با اصلاحات سال ۲۰۲۵ جایگزین شده است.',
    ],
    status: ArticleStatus.Archived,
    publishedDaysAgo: 120,
    categorySlugs: ['international', 'politics'],
    tagSlugs: ['trade'],
    authorEmail: 'editor@news.local',
  },
];

/** Legacy article slugs from earlier demo seeds — removed on SEED_DEMO_FORCE=1. */
export const LEGACY_DEMO_ARTICLE_SLUGS: string[] = [];

export const demoArticles: DemoArticleSeed[] = blueprints.map((bp, index) =>
  buildArticle(bp, index),
);

export const demoArticleSlugs = [
  ...new Set([...demoArticles.map((article) => article.slug), ...LEGACY_DEMO_ARTICLE_SLUGS]),
];

export const demoStories: DemoStorySeed[] = [
  {
    title: 'Ads',
    mediaUrl:
      'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=1200&q=80',
    mediaType: StoryMediaType.Image,
    link: 'https://www.digikala.com/',
    isActive: true,
  },
  {
    title: 'اخبار مهم طلا',
    mediaUrl:
      'https://images.unsplash.com/photo-1610375461246-83df859d849d?auto=format&fit=crop&w=1200&q=80',
    mediaType: StoryMediaType.Image,
    link: 'http://localhost:3000/tag/gold',
    isActive: true,
  },
  {
    title: 'اخبار مهم نفت',
    mediaUrl:
      'https://images.unsplash.com/photo-1497436072909-60f360e1d4b1?auto=format&fit=crop&w=1200&q=80',
    mediaType: StoryMediaType.Image,
    link: 'http://localhost:3000/tag/oil',
    isActive: true,
  },
  {
    title: 'بازار سرمایه',
    mediaUrl:
      'https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4',
    mediaType: StoryMediaType.Video,
    link: 'http://localhost:3000/tag/markets',
    isActive: true,
  },
  {
    title: 'اخبار مهم دلار',
    mediaUrl:
      'https://images.unsplash.com/photo-1520607162513-77705c0f0d4a?auto=format&fit=crop&w=1200&q=80',
    mediaType: StoryMediaType.Image,
    link: 'http://localhost:3000/tag/forex',
    isActive: true,
  },
];
