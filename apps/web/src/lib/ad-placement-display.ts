import type { PublicAdvertisement } from '@/lib/types/public-api';

export type AdPlacementDisplay =
  | { mode: 'empty'; ads: [] }
  | { mode: 'static'; ads: [PublicAdvertisement] }
  | { mode: 'rotate'; ads: PublicAdvertisement[] };

/**
 * Decide how a single placement/slot should render based on its active ads.
 * - 0 → empty placeholder behavior
 * - 1 → static (no carousel / timer)
 * - 2+ → rotating carousel
 */
export function resolveAdPlacementDisplay(
  ads: PublicAdvertisement[],
): AdPlacementDisplay {
  if (ads.length === 0) {
    return { mode: 'empty', ads: [] };
  }

  if (ads.length === 1) {
    return { mode: 'static', ads: [ads[0]!] };
  }

  return { mode: 'rotate', ads: [...ads] };
}

/** Interval for a rotating placement (seconds → ms). */
export function getAdRotationIntervalMs(ads: PublicAdvertisement[]): number {
  const seconds = ads[0]?.rotationIntervalSeconds ?? 8;
  return Math.max(1, seconds) * 1000;
}
