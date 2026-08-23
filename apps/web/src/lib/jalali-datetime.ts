import DateObject from 'react-date-object';
import persian from 'react-date-object/calendars/persian';
import persian_fa from 'react-date-object/locales/persian_fa';

const TEHRAN_TZ = 'Asia/Tehran';

const jalaliDateTimeFormatter = new Intl.DateTimeFormat('fa-IR-u-ca-persian', {
  year: 'numeric',
  month: 'long',
  day: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
  hour12: false,
  timeZone: TEHRAN_TZ,
});

/** Parse stored UTC/Gregorian ISO timestamp into a Jalali DateObject for the picker. */
export function isoToJalaliDateObject(value: string | null | undefined): DateObject | null {
  const trimmed = value?.trim() ?? '';
  if (!trimmed) {
    return null;
  }

  const date = new Date(trimmed);
  if (Number.isNaN(date.getTime())) {
    return null;
  }

  return new DateObject({
    date,
    calendar: persian,
    locale: persian_fa,
  });
}

/** Convert picker value to ISO UTC string for API/database storage. */
export function jalaliDateObjectToIso(value: DateObject | Date | string | null | undefined): string | null {
  if (!value) {
    return null;
  }

  const object =
    value instanceof DateObject
      ? value
      : new DateObject({ date: value, calendar: persian, locale: persian_fa });

  const jsDate = object.toDate();
  if (Number.isNaN(jsDate.getTime())) {
    return null;
  }

  return jsDate.toISOString();
}

/** Display stored timestamp in Persian Jalali with Persian digits. */
export function formatFaJalaliDateTime(value: string | Date | null | undefined): string {
  if (!value) {
    return '—';
  }

  const date = typeof value === 'string' ? new Date(value) : value;
  if (Number.isNaN(date.getTime())) {
    return '—';
  }

  return jalaliDateTimeFormatter.format(date);
}

export { persian, persian_fa, TEHRAN_TZ };
