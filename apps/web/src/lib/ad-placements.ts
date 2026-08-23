export const AD_PLACEMENT_HINTS = {
  'ad-slot': {
    label: 'زیر مهم‌ترین اخبار (ad-slot)',
    sizeHint: 'ارتفاع پیشنهادی: ۱۶۰px — نسبت تقریبی ۶:۱ (مثلاً ۹۷۰×۱۶۰)',
  },
  'ad-banner': {
    label: 'بنر پایین سایت (ad-banner)',
    sizeHint: 'ارتفاع پیشنهادی: ۹۰px — نسبت تقریبی ۸:۱ (مثلاً ۷۲۸×۹۰)',
  },
} as const;

export type AdPlacementKey = keyof typeof AD_PLACEMENT_HINTS;

export function getPlacementLabel(placement: string | null | undefined): string {
  if (placement && placement in AD_PLACEMENT_HINTS) {
    return AD_PLACEMENT_HINTS[placement as AdPlacementKey].label;
  }
  return placement ?? 'نامشخص';
}
