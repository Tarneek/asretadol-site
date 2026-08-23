/**
 * Exact item labels from the TGJU homepage ticker (https://www.tgju.org/).
 * Keep in sync with apps/api/src/modules/market/market-labels.data.ts
 */
export const MARKET_RATE_LABELS = {
  stock_index: 'بورس',
  gold_ounce: 'انس طلا',
  gold_mithqal: 'مثقال طلا',
  gold_18k: 'طلا ۱۸',
  coin: 'سکه',
  usd: 'دلار',
  brent_oil: 'نفت برنت',
  tether: 'تتر',
  bitcoin: 'بیت کوین',
} as const;

export const MARKET_RATE_ORDER = [
  'stock_index',
  'gold_ounce',
  'gold_mithqal',
  'gold_18k',
  'coin',
  'usd',
  'brent_oil',
  'tether',
  'bitcoin',
] as const;
