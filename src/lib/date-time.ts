/* Days are walked through a UTC `Date` so the host's time zone and its DST
 * gaps never enter the arithmetic. */

export interface CalendarDate {
  year: number;
  month: number;
  day: number;
}

const DATE_TEXT = /^(\d{4})-(\d{2})-(\d{2})$/;
const CLOCK_TEXT = /^\d{1,2}$/;

const pad = (n: number, width: number) => String(n).padStart(width, "0");

export function toUtc({ year, month, day }: CalendarDate): Date {
  /* `Date.UTC` maps years 0–99 to 1900–1999; `setUTCFullYear` does not. */
  const date = new Date(0);
  date.setUTCFullYear(year, month - 1, day);
  return date;
}

function fromUtc(date: Date): CalendarDate {
  return {
    year: date.getUTCFullYear(),
    month: date.getUTCMonth() + 1,
    day: date.getUTCDate(),
  };
}

export function formatDate({ year, month, day }: CalendarDate): string {
  return `${pad(year, 4)}-${pad(month, 2)}-${pad(day, 2)}`;
}

function daysInMonth(year: number, month: number): number {
  return fromUtc(toUtc({ year, month: month + 1, day: 0 })).day;
}

export function parseDate(text: string): CalendarDate | null {
  const match = DATE_TEXT.exec(text);
  if (match === null) return null;
  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  if (year < 1 || month < 1 || month > 12 || day < 1) return null;
  if (day > daysInMonth(year, month)) return null;
  return { year, month, day };
}

function parseClock(text: string, max: number): number | null {
  if (!CLOCK_TEXT.test(text)) return null;
  const n = Number(text);
  return n <= max ? n : null;
}

export function parseHour(text: string): number | null {
  return parseClock(text, 23);
}

export function parseMinute(text: string): number | null {
  return parseClock(text, 59);
}

export function buildDateTime(
  dateText: string,
  hourText: string,
  minuteText: string,
): string | null {
  const date = parseDate(dateText);
  const hour = parseHour(hourText);
  const minute = parseMinute(minuteText);
  if (date === null || hour === null || minute === null) return null;
  return `${formatDate(date)}T${pad(hour, 2)}:${pad(minute, 2)}`;
}

export function splitDateTime(
  value: string,
): { date: string; hour: string; minute: string } | null {
  const [date = "", time = ""] = value.split("T");
  const hour = time.slice(0, 2);
  const minute = time.slice(3);
  if (time.length !== 5 || time[2] !== ":") return null;
  return buildDateTime(date, hour, minute) === value
    ? { date, hour, minute }
    : null;
}

export function isBeforeMin(candidate: string, min: string | undefined) {
  return min !== undefined && candidate < min;
}

export function isDayBeforeMin(day: CalendarDate, min: string | undefined) {
  return isBeforeMin(`${formatDate(day)}T23:59`, min);
}

export function addDays(date: CalendarDate, days: number): CalendarDate | null {
  const next = toUtc(date);
  next.setUTCDate(next.getUTCDate() + days);
  const result = fromUtc(next);
  return result.year >= 1 && result.year <= 9999 ? result : null;
}

export function addMonths(
  date: CalendarDate,
  months: number,
): CalendarDate | null {
  const index = date.year * 12 + (date.month - 1) + months;
  const year = Math.floor(index / 12);
  const month = (index % 12) + 1;
  if (year < 1 || year > 9999) return null;
  return { year, month, day: Math.min(date.day, daysInMonth(year, month)) };
}

export function weekday(date: CalendarDate): number {
  return toUtc(date).getUTCDay();
}

export function monthWeeks(
  year: number,
  month: number,
): (CalendarDate | null)[][] {
  const cells: (CalendarDate | null)[] = Array.from(
    { length: weekday({ year, month, day: 1 }) },
    () => null,
  );
  for (let day = 1; day <= daysInMonth(year, month); day += 1) {
    cells.push({ year, month, day });
  }
  while (cells.length % 7 !== 0) cells.push(null);
  return Array.from({ length: cells.length / 7 }, (_, row) =>
    cells.slice(row * 7, row * 7 + 7),
  );
}
