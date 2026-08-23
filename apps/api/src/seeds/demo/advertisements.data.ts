import { AdPlacement } from '../../common/enums/ad-placement.enum';

/**
 * Homepage ad dimensions (from apps/web/src/styles/site.css):
 * - ad-slot:  height 160px, 2-column grid → ~970×160 recommended (≈6:1)
 * - ad-banner: height 90px, 2-column grid in 1500px container → 728×90 (≈8:1, leaderboard)
 *
 * Placeholder images: placehold.co (royalty-free placeholder service for demos).
 */
export const AD_SLOT_IMAGE_SIZE = { width: 970, height: 160 } as const;
export const AD_BANNER_IMAGE_SIZE = { width: 728, height: 90 } as const;

export type DemoAdvertisementSeed = {
  title: string;
  slug: string;
  linkUrl: string;
  placement: AdPlacement;
  slotIndex: 0 | 1;
  sortOrder: number;
  rotationEnabled: boolean;
  rotationIntervalSeconds: number;
  bannerText: string;
  /** Background / text colors for placehold.co */
  bgColor: string;
  textColor: string;
};

export const DEMO_ADVERTISEMENTS: DemoAdvertisementSeed[] = [
  {
    title: 'عضویت در خبرنامه نیرا نیوز',
    slug: 'newsletter-slot',
    linkUrl: 'https://example.com/newsletter',
    placement: AdPlacement.AdSlot,
    slotIndex: 0,
    sortOrder: 0,
    rotationEnabled: true,
    rotationIntervalSeconds: 7,
    bannerText: 'Newsletter Demo',
    bgColor: '9d0b0f',
    textColor: 'ffffff',
  },
  {
    title: 'دوره آنلاین تحلیل بازار',
    slug: 'market-course-slot',
    linkUrl: 'https://example.com/courses/market-analysis',
    placement: AdPlacement.AdSlot,
    slotIndex: 0,
    sortOrder: 1,
    rotationEnabled: true,
    rotationIntervalSeconds: 7,
    bannerText: 'Online Course Demo',
    bgColor: '1a1a1a',
    textColor: 'ffffff',
  },
  {
    title: 'خدمات طراحی وب — نمونه تبلیغ',
    slug: 'web-design-banner',
    linkUrl: 'https://example.com/services/web-design',
    placement: AdPlacement.AdBanner,
    slotIndex: 0,
    sortOrder: 0,
    rotationEnabled: true,
    rotationIntervalSeconds: 8,
    bannerText: 'Web Design Demo',
    bgColor: '9d0b0f',
    textColor: 'ffffff',
  },
  {
    title: 'فروشگاه نمونه محلی',
    slug: 'local-business-banner',
    linkUrl: 'https://example.com/local-business',
    placement: AdPlacement.AdBanner,
    slotIndex: 0,
    sortOrder: 1,
    rotationEnabled: true,
    rotationIntervalSeconds: 8,
    bannerText: 'Local Business Demo',
    bgColor: '262626',
    textColor: 'f5f5f5',
  },
  {
    title: 'پلتفرم آموزشی آنلاین',
    slug: 'education-banner',
    linkUrl: 'https://example.com/education-platform',
    placement: AdPlacement.AdBanner,
    slotIndex: 1,
    sortOrder: 0,
    rotationEnabled: true,
    rotationIntervalSeconds: 10,
    bannerText: 'Education Platform Demo',
    bgColor: '171717',
    textColor: 'ffffff',
  },
];
