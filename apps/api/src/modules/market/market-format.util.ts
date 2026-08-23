import type { MarketTrend } from './enums/market-rate-key.enum';

export type ParsedMarketQuote = {
  currentPrice: string;
  changeValue: string;
  changePercent: string;
  changeDisplay: string;
  trend: MarketTrend;
};

export function stripHtml(value: string): string {
  return value.replace(/<[^>]*>/g, '').replace(/&nbsp;/g, ' ').trim();
}

export function normalizeNumberToken(value: string): string {
  return stripHtml(value).replace(/,/g, '').replace(/[^\d.-]/g, '');
}

export function formatDisplayNumber(value: string | number, fractionDigits = 0): string {
  const raw = typeof value === 'number' ? value : normalizeNumberToken(value);
  const parsed = Number(raw);
  if (!Number.isFinite(parsed)) {
    return stripHtml(String(value));
  }

  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: fractionDigits,
    maximumFractionDigits: fractionDigits,
  }).format(parsed);
}

export function parsePercentToken(value: string): string {
  const cleaned = stripHtml(value);
  if (!cleaned || cleaned === '-') {
    return '-';
  }
  return cleaned.includes('%') ? cleaned : `${cleaned}%`;
}

export function inferTrend(changeHtml: string, changePercent: string): MarketTrend {
  const amount = stripHtml(changeHtml);
  const pct = stripHtml(changePercent);

  if ((!amount || amount === '-') && (!pct || pct === '-')) {
    return 'up';
  }

  if (changeHtml.includes('class="low"') || pct.startsWith('-')) {
    return 'down';
  }
  return 'up';
}

/** Format TGJU change amounts with comma separators and original decimal precision. */
export function formatTgjuAmount(value: string): string {
  const cleaned = stripHtml(value);
  if (!cleaned || cleaned === '-') {
    return '-';
  }

  if (cleaned.includes(',')) {
    return cleaned;
  }

  const numeric = Number(normalizeNumberToken(cleaned));
  if (!Number.isFinite(numeric)) {
    return cleaned;
  }

  const abs = Math.abs(numeric);
  const fractionDigits = cleaned.includes('.') ? (cleaned.split('.')[1]?.length ?? 0) : 0;
  return formatDisplayNumber(abs, fractionDigits);
}

/** TGJU homepage ticker change line: `(percent) amount` */
export function formatTgjuChangeDisplay(changeValue: string, changePercent: string): string {
  const percent = parsePercentToken(changePercent);
  const amount = formatTgjuAmount(changeValue);

  if (percent === '-' && amount === '-') {
    return '-';
  }

  if (percent === '-') {
    return amount;
  }

  const percentWrapped = percent.startsWith('(') ? percent : `(${percent})`;

  if (amount === '-') {
    return percentWrapped;
  }

  return `${percentWrapped} ${amount}`;
}

export function quoteFromTgjuRow(row: string[]): ParsedMarketQuote | null {
  if (!row?.length || row.length < 6) {
    return null;
  }

  const currentPrice = stripHtml(row[0] ?? '');
  const changeRaw = row[4] ?? '';
  const changePercentRaw = row[5] ?? '';

  if (!currentPrice) {
    return null;
  }

  const changeValue = formatTgjuAmount(changeRaw);
  const changePercent = parsePercentToken(changePercentRaw);

  return {
    currentPrice,
    changeValue,
    changePercent,
    changeDisplay: formatTgjuChangeDisplay(changeRaw, changePercentRaw),
    trend: inferTrend(changeRaw, changePercentRaw),
  };
}
