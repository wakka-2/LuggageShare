// Local-time date helpers (toISOString is UTC and can shift the calendar day
// for users east of Greenwich, so we format manually).

export const MONTHS_AR = [
  'يناير',
  'فبراير',
  'مارس',
  'أبريل',
  'مايو',
  'يونيو',
  'يوليو',
  'أغسطس',
  'سبتمبر',
  'أكتوبر',
  'نوفمبر',
  'ديسمبر',
] as const;

export const WEEKDAY_INITIALS_AR = ['ح', 'ن', 'ث', 'ر', 'خ', 'ج', 'س'] as const;

export type Flexibility = 0 | 1 | 3;

export const FLEX_OPTIONS: { value: Flexibility; label: string }[] = [
  { value: 0, label: 'التاريخ المحدد' },
  { value: 1, label: '± يوم' },
  { value: 3, label: '± ٣ أيام' },
];

export function startOfToday(): Date {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
}

export function addDays(date: Date, days: number): Date {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

export function toLocalISO(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function parseLocalISO(value: string): Date | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!match) return null;
  const d = new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]));
  return Number.isNaN(d.getTime()) ? null : d;
}

export function formatArabicShort(date: Date): string {
  return `${date.getDate()} ${MONTHS_AR[date.getMonth()]}`;
}

export function parseFlexibility(value: number | string | null | undefined): Flexibility {
  const n = Number(value);
  return n === 1 ? 1 : n === 3 ? 3 : 0;
}
