import { IconChevronDown, IconChevronUp } from '@/components/icons/site-icons';
import {
  formatMarketChange,
  formatMarketPrice,
  formatTgjuDisplayDigits,
} from '@/lib/api/public-market-rates';
import { MARKET_RATE_LABELS, MARKET_RATE_ORDER } from '@/lib/market-labels';
import type { PublicMarketRate } from '@/lib/types/public-api';

const FALLBACK_MARKET: PublicMarketRate[] = MARKET_RATE_ORDER.map((key) => ({
  key,
  title: MARKET_RATE_LABELS[key],
  currentPrice: '—',
  changeValue: '—',
  changePercent: '—',
  changeDisplay: '—',
  trend: 'up' as const,
  lastUpdated: new Date(0).toISOString(),
}));

type MarketTickerProps = {
  rates?: PublicMarketRate[];
};

export function MarketTicker({ rates }: MarketTickerProps) {
  const items = rates?.length ? rates : FALLBACK_MARKET;

  return (
    <div className="items-fee" aria-label="بازار">
      <div className="items-fee-track">
        {items.map((item) => {
          const up = item.trend === 'up';

          return (
            <div key={item.key} className="item">
              <label>
                <span className={`market-trend-icon${up ? ' market-trend-icon--up' : ' market-trend-icon--down'}`}>
                  {up ? <IconChevronUp /> : <IconChevronDown />}
                </span>
                {item.title}
              </label>
              <p className={`price border-bot ${up ? 'green' : 'red'}`} dir="ltr">
                {formatMarketPrice(item.currentPrice)}
              </p>
              <p className="price white" dir="ltr">
                {formatTgjuDisplayDigits(formatMarketChange(item))}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
