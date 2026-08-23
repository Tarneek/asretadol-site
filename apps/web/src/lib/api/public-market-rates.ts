import { apiFetch, ApiError, isApiNetworkError } from './client';
import { ApiConfigurationError } from '../config';
import type { PublicMarketRate } from '../types/public-api';

export async function fetchPublicMarketRates(): Promise<PublicMarketRate[]> {
  return apiFetch<PublicMarketRate[]>('/public/market-rates', {
    revalidate: 60,
  });
}

export async function safeFetchPublicMarketRates(): Promise<PublicMarketRate[]> {
  try {
    return await fetchPublicMarketRates();
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

const FA_DIGITS = '۰۱۲۳۴۵۶۷۸۹';

/** TGJU-style Persian digits while preserving commas and decimal separators. */
export function formatTgjuDisplayDigits(value: string): string {
  return value.replace(/\d/g, (digit) => FA_DIGITS[Number(digit)] ?? digit);
}

/** TGJU homepage ticker change line: `(percent) amount` */
export function formatMarketChange(rate: PublicMarketRate): string {
  if (rate.changeDisplay) {
    return rate.changeDisplay;
  }

  const percent = rate.changePercent.startsWith('(')
    ? rate.changePercent
    : `(${rate.changePercent})`;

  return `${percent} ${rate.changeValue}`;
}

export function formatMarketPrice(value: string): string {
  return formatTgjuDisplayDigits(value);
}
