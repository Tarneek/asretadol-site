/**
 * TGJU indicator slugs used by the homepage ticker on https://www.tgju.org/
 * API base: https://api.tgju.org/v1/market/indicator/summary-table-data/{slug}
 */
import { MarketRateKey } from './enums/market-rate-key.enum';

export const TGJU_MARKET_INDICATORS: Record<string, MarketRateKey> = {
  bourse: MarketRateKey.StockIndex,
  ons: MarketRateKey.GoldOunce,
  mesghal: MarketRateKey.GoldMithqal,
  geram18: MarketRateKey.Gold18k,
  sekee: MarketRateKey.Coin,
  price_dollar_rl: MarketRateKey.Usd,
  oil_brent: MarketRateKey.BrentOil,
  'crypto-bitcoin': MarketRateKey.Bitcoin,
  /** IRR price for homepage تتر card — not crypto-tether (USD peg). */
  'crypto-tether-irr': MarketRateKey.Tether,
};

export const TGJU_MARKET_API_BASE =
  'https://api.tgju.org/v1/market/indicator/summary-table-data';
