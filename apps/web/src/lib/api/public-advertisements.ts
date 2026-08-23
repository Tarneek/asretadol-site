import { apiFetch, ApiError, isApiNetworkError } from './client';
import { ApiConfigurationError } from '../config';
import type { PublicAdvertisement } from '../types/public-api';

export async function fetchPublicAdvertisements(): Promise<PublicAdvertisement[]> {
  return apiFetch<PublicAdvertisement[]>('/public/advertisements', {
    revalidate: 60,
  });
}

export async function safeFetchPublicAdvertisements(): Promise<PublicAdvertisement[]> {
  try {
    return await fetchPublicAdvertisements();
  } catch (error) {
    if (error instanceof ApiConfigurationError || isApiNetworkError(error)) {
      throw error;
    }
    if (error instanceof ApiError) {
      return [];
    }
    throw error;
  }
}

export function groupAdvertisementsBySlot(ads: PublicAdvertisement[]) {
  const groups = new Map<string, PublicAdvertisement[]>();

  for (const ad of ads) {
    const key = `${ad.placement}:${ad.slotIndex}`;
    const list = groups.get(key) ?? [];
    list.push(ad);
    groups.set(key, list);
  }

  return groups;
}

export function getSlotAdvertisements(
  groups: Map<string, PublicAdvertisement[]>,
  placement: PublicAdvertisement['placement'],
  slotIndex: number,
): PublicAdvertisement[] {
  return groups.get(`${placement}:${slotIndex}`) ?? [];
}

/** Split ads evenly across two homepage rotators (stable by original order). */
function splitAdsAcrossPair(ads: PublicAdvertisement[]): [PublicAdvertisement[], PublicAdvertisement[]] {
  if (ads.length <= 1) {
    return [ads, []];
  }

  const left: PublicAdvertisement[] = [];
  const right: PublicAdvertisement[] = [];

  for (let index = 0; index < ads.length; index += 1) {
    if (index % 2 === 0) {
      left.push(ads[index]!);
    } else {
      right.push(ads[index]!);
    }
  }

  if (right.length === 0 && left.length > 1) {
    right.push(left.pop()!);
  }

  return [left, right];
}

/**
 * Build the two side-by-side `ad-slot` rotators under "Most Important News".
 * Respects admin slotIndex when both slots have ads; otherwise splits a single
 * slot's ads across both rotators so two equal blocks always appear on desktop.
 */
export function distributeAdSlotPair(
  ads: PublicAdvertisement[],
): [PublicAdvertisement[], PublicAdvertisement[]] {
  const adSlotAds = ads.filter((ad) => ad.placement === 'ad-slot');
  if (adSlotAds.length === 0) {
    return [[], []];
  }

  const groups = groupAdvertisementsBySlot(adSlotAds);
  const slot0 = getSlotAdvertisements(groups, 'ad-slot', 0);
  const slot1 = getSlotAdvertisements(groups, 'ad-slot', 1);

  if (slot0.length > 0 && slot1.length > 0) {
    return [slot0, slot1];
  }

  if (slot0.length > 1 && slot1.length === 0) {
    return splitAdsAcrossPair(slot0);
  }

  if (slot1.length > 1 && slot0.length === 0) {
    const [left, right] = splitAdsAcrossPair(slot1);
    return [left, right];
  }

  return [slot0, slot1];
}
