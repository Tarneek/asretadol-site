import { describe, expect, it } from 'vitest';
import {
  getAdRotationIntervalMs,
  resolveAdPlacementDisplay,
} from './ad-placement-display';
import {
  distributeAdSlotPair,
  getSlotAdvertisements,
  groupAdvertisementsBySlot,
} from './api/public-advertisements';
import type { PublicAdvertisement } from './types/public-api';

function makeAd(
  overrides: Partial<PublicAdvertisement> & Pick<PublicAdvertisement, 'id'>,
): PublicAdvertisement {
  return {
    title: `Ad ${overrides.id}`,
    imageUrl: `/uploads/news/ad-${overrides.id}.jpg`,
    linkUrl: 'https://example.com',
    placement: 'ad-slot',
    slotIndex: 0,
    rotationEnabled: true,
    rotationIntervalSeconds: 8,
    ...overrides,
  };
}

describe('resolveAdPlacementDisplay', () => {
  it('returns empty mode when a placement has no active ads', () => {
    expect(resolveAdPlacementDisplay([])).toEqual({ mode: 'empty', ads: [] });
  });

  it('returns static mode for a single active ad (no carousel)', () => {
    const ad = makeAd({ id: 'solo' });
    const result = resolveAdPlacementDisplay([ad]);
    expect(result.mode).toBe('static');
    expect(result.ads).toEqual([ad]);
  });

  it('returns rotate mode when a placement has two or more active ads', () => {
    const ads = [makeAd({ id: 'a' }), makeAd({ id: 'b' }), makeAd({ id: 'c' })];
    const result = resolveAdPlacementDisplay(ads);
    expect(result.mode).toBe('rotate');
    expect(result.ads).toEqual(ads);
  });

  it('uses the first ad interval for rotation timing', () => {
    const ads = [
      makeAd({ id: 'a', rotationIntervalSeconds: 5 }),
      makeAd({ id: 'b', rotationIntervalSeconds: 12 }),
    ];
    expect(getAdRotationIntervalMs(ads)).toBe(5000);
  });
});

describe('groupAdvertisementsBySlot + banners', () => {
  it('groups ads by placement and slotIndex independently', () => {
    const ads = [
      makeAd({ id: 's0a', placement: 'ad-slot', slotIndex: 0 }),
      makeAd({ id: 's0b', placement: 'ad-slot', slotIndex: 0 }),
      makeAd({ id: 's1', placement: 'ad-slot', slotIndex: 1 }),
      makeAd({ id: 'b0', placement: 'ad-banner', slotIndex: 0 }),
    ];
    const groups = groupAdvertisementsBySlot(ads);

    expect(getSlotAdvertisements(groups, 'ad-slot', 0)).toHaveLength(2);
    expect(resolveAdPlacementDisplay(getSlotAdvertisements(groups, 'ad-slot', 0)).mode).toBe(
      'rotate',
    );
    expect(resolveAdPlacementDisplay(getSlotAdvertisements(groups, 'ad-slot', 1)).mode).toBe(
      'static',
    );
    expect(resolveAdPlacementDisplay(getSlotAdvertisements(groups, 'ad-banner', 0)).mode).toBe(
      'static',
    );
    expect(resolveAdPlacementDisplay(getSlotAdvertisements(groups, 'ad-banner', 1)).mode).toBe(
      'empty',
    );
  });
});

describe('distributeAdSlotPair', () => {
  it('returns empty pair when there are no ad-slot ads', () => {
    expect(distributeAdSlotPair([])).toEqual([[], []]);
    expect(
      distributeAdSlotPair([makeAd({ id: 'b', placement: 'ad-banner', slotIndex: 0 })]),
    ).toEqual([[], []]);
  });

  it('keeps a single ad in its slot as a static placement', () => {
    const [left, right] = distributeAdSlotPair([
      makeAd({ id: 'only', placement: 'ad-slot', slotIndex: 0 }),
    ]);
    expect(resolveAdPlacementDisplay(left).mode).toBe('static');
    expect(resolveAdPlacementDisplay(right).mode).toBe('empty');
  });

  it('respects both slots when each has ads', () => {
    const [left, right] = distributeAdSlotPair([
      makeAd({ id: 'l1', placement: 'ad-slot', slotIndex: 0 }),
      makeAd({ id: 'l2', placement: 'ad-slot', slotIndex: 0 }),
      makeAd({ id: 'r1', placement: 'ad-slot', slotIndex: 1 }),
    ]);
    expect(resolveAdPlacementDisplay(left).mode).toBe('rotate');
    expect(resolveAdPlacementDisplay(right).mode).toBe('static');
  });
});
