import type { Dayjs } from 'dayjs';

import dayjs from 'dayjs';
import duration from 'dayjs/plugin/duration';
import relativeTime from 'dayjs/plugin/relativeTime';

// ----------------------------------------------------------------------

/**
 * @Docs
 * https://day.js.org/docs/en/display/format
 */

/**
 * Default timezones
 * https://day.js.org/docs/en/timezone/set-default-timezone#docsNav
 *
 */

/**
 * UTC
 * https://day.js.org/docs/en/plugin/utc
 * @install
 * import utc from 'dayjs/plugin/utc';
 * dayjs.extend(utc);
 * @usage
 * dayjs().utc().format()
 *
 */

dayjs.extend(duration);
dayjs.extend(relativeTime);

// ----------------------------------------------------------------------

export type DatePickerFormat = Dayjs | Date | string | number | null | undefined;

export const formatPatterns = {
  dateTime: 'DD MMM YYYY h:mm a', // 17 Apr 2022 12:00 am
  date: 'DD MMM YYYY', // 17 Apr 2022
  time: 'h:mm a', // 12:00 am
  split: {
    dateTime: 'DD/MM/YYYY h:mm a', // 17/04/2022 12:00 am
    date: 'DD/MM/YYYY', // 17/04/2022
  },
  paramCase: {
    dateTime: 'DD-MM-YYYY h:mm a', // 17-04-2022 12:00 am
    date: 'DD-MM-YYYY', // 17-04-2022
  },
};

const isValidDate = (date: DatePickerFormat) =>
  date !== null && date !== undefined && dayjs(date).isValid();

// ----------------------------------------------------------------------

/**
 * @output 17 Apr 2022 12:00 am
 */
export function fDateTime(date: DatePickerFormat, template?: string): string {
  if (!isValidDate(date)) {
    return 'Invalid date';
  }

  return dayjs(date).format(template ?? formatPatterns.dateTime);
}

// ----------------------------------------------------------------------

/**
 * @output 17 Apr 2022
 */
export function fDate(date: DatePickerFormat, template?: string): string {
  if (!isValidDate(date)) {
    return 'Invalid date';
  }

  return dayjs(date).format(template ?? formatPatterns.date);
}

// ----------------------------------------------------------------------

/**
 * @output a few seconds, 2 years
 */
export function fToNow(date: DatePickerFormat): string {
  if (!isValidDate(date)) {
    return 'Invalid date';
  }

  return dayjs(date).toNow(true);
}

// ----------------------------------------------------------------------

/**
 * @output 3 m, 2 h, 1 w, 1 M, 1 y
 */
export function fTimeDist(date: DatePickerFormat): string {
  if (!isValidDate(date)) {
    return 'Invalid date';
  }

  const now = dayjs();
  const d = dayjs(date);

  const diffInSeconds = now.diff(d, 'second');
  if (diffInSeconds < 60) return `now`;

  const diffInMinutes = now.diff(d, 'minute');
  if (diffInMinutes < 60) return `${diffInMinutes} m`;

  const diffInHours = now.diff(d, 'hour');
  if (diffInHours < 24) return `${diffInHours} h`;

  const diffInDays = now.diff(d, 'day');
  if (diffInDays < 7) return `${diffInDays} d`;

  const diffInWeeks = now.diff(d, 'week');
  if (diffInWeeks < 4) return `${diffInWeeks} w`;

  const diffInMonths = now.diff(d, 'month');
  if (diffInMonths < 12) return `${diffInMonths} M`;

  const diffInYears = now.diff(d, 'year');
  return `${diffInYears} y`;
}
// ----------------------------------------------------------------------

/**
 * @output Today, Yesterday, 17 Apr 2022
 */
export function fDateSeparator(date: DatePickerFormat): string {
  if (!isValidDate(date)) {
    return 'Invalid date';
  }

  const d = dayjs(date);
  const now = dayjs();

  if (d.isSame(now, 'day')) {
    return 'Today';
  }
  if (d.isSame(now.subtract(1, 'day'), 'day')) {
    return 'Yesterday';
  }

  return fDate(date);
}

// ----------------------------------------------------------------------

/**
 * @output 12:00 am (if today), 17/04/2022 (otherwise)
 */
export function fToChatTime(date: DatePickerFormat): string {
  if (!isValidDate(date)) {
    return 'Invalid date';
  }

  const d = dayjs(date);
  const now = dayjs();

  if (d.isSame(now, 'day')) {
    return d.format('h:mm A');
  }

  return d.format(formatPatterns.split.date);
}
