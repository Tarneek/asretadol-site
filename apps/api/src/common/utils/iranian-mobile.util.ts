/**
 * Normalize and validate Iranian mobile numbers to `09XXXXXXXXX` (11 digits).
 */

const PERSIAN_DIGITS = '۰۱۲۳۴۵۶۷۸۹';
const ARABIC_DIGITS = '٠١٢٣٤٥٦٧٨٩';

export function toAsciiDigits(value: string): string {
  return value.replace(/[۰-۹٠-٩]/g, (char) => {
    const persian = PERSIAN_DIGITS.indexOf(char);
    if (persian >= 0) return String(persian);
    const arabic = ARABIC_DIGITS.indexOf(char);
    if (arabic >= 0) return String(arabic);
    return char;
  });
}

/** Returns canonical `09xxxxxxxxx` or null if invalid. */
export function normalizeIranianMobile(raw: string): string | null {
  let value = toAsciiDigits(String(raw ?? '').trim());
  value = value.replace(/[\s\-()]/g, '');

  if (value.startsWith('+98')) {
    value = `0${value.slice(3)}`;
  } else if (value.startsWith('0098')) {
    value = `0${value.slice(4)}`;
  } else if (value.startsWith('98') && value.length === 12) {
    value = `0${value.slice(2)}`;
  } else if (value.startsWith('9') && value.length === 10) {
    value = `0${value}`;
  }

  if (!/^09\d{9}$/.test(value)) {
    return null;
  }

  return value;
}

export function assertIranianMobile(raw: string): string {
  const normalized = normalizeIranianMobile(raw);
  if (!normalized) {
    throw new Error('INVALID_IRANIAN_MOBILE');
  }
  return normalized;
}

export const IRANIAN_MOBILE_REGEX = /^09\d{9}$/;
