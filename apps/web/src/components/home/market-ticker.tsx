import { IconChevronDown, IconChevronUp } from '@/components/icons/site-icons';

const MARKET = [
  { name: 'بورس', value: '3,865,543', change: '9.342(10.5%)', up: false },
  { name: 'انس طلا', value: '3,865,543', change: '9.342(10.5%)', up: true },
  { name: 'مثقال طلا', value: '3,865,543', change: '9.342(10.5%)', up: false },
  { name: 'طلا', value: '3,865,543', change: '9.342(10.5%)', up: true },
  { name: 'سکه', value: '3,865,543', change: '9.342(10.5%)', up: true },
  { name: 'دلار', value: '3,865,543', change: '9.342(10.5%)', up: false },
  { name: 'نفت برنت', value: '3,865,543', change: '9.342(10.5%)', up: true },
  { name: 'تتر', value: '3,865,543', change: '9.342(10.5%)', up: false },
  { name: 'بیت‌کوین', value: '3,865,543', change: '9.342(10.5%)', up: true },
];

/** Static market strip matching the design until a market API exists. */
export function MarketTicker() {
  return (
    <div className="items-fee" aria-label="بازار">
      <div className="items-fee-track">
        {MARKET.map((item) => (
          <div key={item.name} className="item">
            <label>
              <span className={`market-trend-icon${item.up ? ' market-trend-icon--up' : ' market-trend-icon--down'}`}>
                {item.up ? <IconChevronUp /> : <IconChevronDown />}
              </span>
              {item.name}
            </label>
            <p className={`price border-bot ${item.up ? 'green' : 'red'}`}>{item.value}</p>
            <p className="price white">{item.change}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
