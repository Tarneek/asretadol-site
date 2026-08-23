import { MarketRateKey } from './enums/market-rate-key.enum';

/**
 * Exact item labels and order from the TGJU homepage ticker:
 * https://www.tgju.org/
 */
export const MARKET_RATE_LABELS: Record<MarketRateKey, string> = {
  [MarketRateKey.StockIndex]: 'بورس',
  [MarketRateKey.GoldOunce]: 'انس طلا',
  [MarketRateKey.GoldMithqal]: 'مثقال طلا',
  [MarketRateKey.Gold18k]: 'طلا ۱۸',
  [MarketRateKey.Coin]: 'سکه',
  [MarketRateKey.Usd]: 'دلار',
  [MarketRateKey.BrentOil]: 'نفت برنت',
  [MarketRateKey.Tether]: 'تتر',
  [MarketRateKey.Bitcoin]: 'بیت کوین',
};

export const MARKET_RATE_SORT_ORDER: MarketRateKey[] = [
  MarketRateKey.StockIndex,
  MarketRateKey.GoldOunce,
  MarketRateKey.GoldMithqal,
  MarketRateKey.Gold18k,
  MarketRateKey.Coin,
  MarketRateKey.Usd,
  MarketRateKey.BrentOil,
  MarketRateKey.Tether,
  MarketRateKey.Bitcoin,
];
