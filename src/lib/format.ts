const MINUTE = 60;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;
const WEEK = 7 * DAY;
const MONTH = 30 * DAY;
const YEAR = 365 * DAY;

/**
 * Short Indonesian relative time, e.g. "5 mnt", "3 jam", "2 hr", "1 minggu".
 */
export function timeAgo(date: string | Date) {
  const seconds = Math.max(
    0,
    Math.floor((Date.now() - new Date(date).getTime()) / 1000),
  );

  if (seconds < MINUTE) return 'baru saja';
  if (seconds < HOUR) return `${Math.floor(seconds / MINUTE)} mnt`;
  if (seconds < DAY) return `${Math.floor(seconds / HOUR)} jam`;
  if (seconds < WEEK) return `${Math.floor(seconds / DAY)} hr`;
  if (seconds < MONTH) return `${Math.floor(seconds / WEEK)} minggu`;
  if (seconds < YEAR) return `${Math.floor(seconds / MONTH)} bln`;

  return `${Math.floor(seconds / YEAR)} thn`;
}

export function isRecent(date: string | Date, withinDays = 7) {
  return Date.now() - new Date(date).getTime() < withinDays * DAY * 1000;
}

export function formatCompact(value: number) {
  return new Intl.NumberFormat('en-US', {
    notation: 'compact',
    maximumFractionDigits: 1,
  }).format(value);
}

export function formatNumber(value: number) {
  return value.toLocaleString('id-ID');
}

/**
 * Convert an ISO country code ("KR") into its flag emoji.
 */
export function countryFlag(code?: string | null) {
  if (!code || code.length !== 2) return null;

  return String.fromCodePoint(
    ...code
      .toUpperCase()
      .split('')
      .map((char) => 0x1f1e6 + char.charCodeAt(0) - 65),
  );
}

export function proxyImage(url?: string | null) {
  if (!url) return '';

  return `/api/proxy/image/${url.split('/').pop()}`;
}

/** The API uses 9999 as a sentinel for "not ranked". */
export const UNRANKED = 9999;

export function hasRank(rank?: number | null): rank is number {
  return !!rank && rank < UNRANKED;
}
