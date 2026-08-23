import { MarketRateKey } from './enums/market-rate-key.enum';
import type { ParsedMarketQuote } from './market-format.util';
import { normalizeNumberToken } from './market-format.util';

function numericPrice(quote: ParsedMarketQuote): number | null {
  const parsed = Number(normalizeNumberToken(quote.currentPrice));
  return Number.isFinite(parsed) ? parsed : null;
}

/**
 * Reject provider payloads that do not match TGJU homepage ticker scales.
 * e.g. crypto-tether returns USD peg (~1) instead of IRR (~1.9M).
 */
export function isValidMarketQuote(key: MarketRateKey, quote: ParsedMarketQuote): boolean {
  const price = numericPrice(quote);
  if (price === null || quote.currentPrice === '-') {
    return false;
  }

  switch (key) {
    case MarketRateKey.StockIndex:
      return price >= 1_000_000;
    case MarketRateKey.GoldOunce:
      return price >= 100 && price <= 20_000;
    case MarketRateKey.GoldMithqal:
    case MarketRateKey.Gold18k:
    case MarketRateKey.Coin:
      return price >= 1_000_000;
    case MarketRateKey.Usd:
    case MarketRateKey.Tether:
      return price >= 100_000;
    case MarketRateKey.BrentOil:
      return price >= 1 && price <= 500;
    case MarketRateKey.Bitcoin:
      return price >= 1_000 && price <= 500_000;
    default:
      return true;
  }
}
