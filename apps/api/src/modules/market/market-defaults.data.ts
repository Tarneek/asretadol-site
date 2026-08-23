import { MarketRateKey } from './enums/market-rate-key.enum';
import type { MarketTrend } from './enums/market-rate-key.enum';
import { MARKET_RATE_LABELS, MARKET_RATE_SORT_ORDER } from './market-labels.data';

export type MarketRateSeed = {
  key: MarketRateKey;
  title: string;
  currentPrice: string;
  changeValue: string;
  changePercent: string;
  trend: MarketTrend;
  sortOrder: number;
};

const FALLBACK_QUOTES: Record<
  MarketRateKey,
  Pick<MarketRateSeed, 'currentPrice' | 'changeValue' | 'changePercent' | 'trend'>
> = {
  [MarketRateKey.StockIndex]: {
    currentPrice: '6,061,553',
    changeValue: '108,867',
    changePercent: '1.83%',
    trend: 'up',
  },
  [MarketRateKey.GoldOunce]: {
    currentPrice: '4,607.35',
    changeValue: '3.64',
    changePercent: '0.08%',
    trend: 'down',
  },
  [MarketRateKey.GoldMithqal]: {
    currentPrice: '913,020,000',
    changeValue: '53,030,000',
    changePercent: '6.17%',
    trend: 'up',
  },
  [MarketRateKey.Gold18k]: {
    currentPrice: '210,769,000',
    changeValue: '12,242,000',
    changePercent: '6.17%',
    trend: 'up',
  },
  [MarketRateKey.Coin]: {
    currentPrice: '2,090,250,000',
    changeValue: '94,850,000',
    changePercent: '4.75%',
    trend: 'up',
  },
  [MarketRateKey.Usd]: {
    currentPrice: '1,925,000',
    changeValue: '31,000',
    changePercent: '1.64%',
    trend: 'up',
  },
  [MarketRateKey.BrentOil]: {
    currentPrice: '94.39',
    changeValue: '0.25',
    changePercent: '0.27%',
    trend: 'up',
  },
  [MarketRateKey.Tether]: {
    currentPrice: '1,916,630',
    changeValue: '36,700',
    changePercent: '1.95%',
    trend: 'up',
  },
  [MarketRateKey.Bitcoin]: {
    currentPrice: '77,276.90',
    changeValue: '248.12',
    changePercent: '0.32%',
    trend: 'down',
  },
};

/** Fallback values when external providers are unavailable. */
export const DEFAULT_MARKET_RATES: MarketRateSeed[] = MARKET_RATE_SORT_ORDER.map((key, sortOrder) => ({
  key,
  title: MARKET_RATE_LABELS[key],
  sortOrder,
  ...FALLBACK_QUOTES[key],
}));
