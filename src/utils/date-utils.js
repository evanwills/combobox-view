import dayjs from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat';
import utc from 'dayjs/plugin/utc';
import { isNum } from './data-utils';

dayjs.extend(customParseFormat);
dayjs.extend(utc);
const months = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];

/**
 * Get the maximum number of days in a given month in a given year.
 *
 * @param {number} month Month of the year to be tested
 * @param {number} year Year to be tested
 *
 * @returns {number} Maximum number of days for the supplied month
 */
export const daysInMonth = (month, year) => new Date(year, month, 0).getDate();

/**
 * @param {string} date   Date string for Dayjs
 * @param {string} format String describing the dayjs format the
 *                        passing date is in. Default: 'D/MM/YYYY'
 * @param {string} output String describing the dayjs output the
 *                        passing date will return as.
 *                        Default: 'D MMMM YYYY'
 * @returns
 */
export const formatDate = (
  date,
  format = 'YYYY-MM-DD',
  output = 'D MMMM YYYY',
) => dayjs.utc(date, format).format(output);

export const getMonths = () => months;

/**
 * Get an ISO 8601 date string offset by a given amount.
 *
 * > __Note:__ By default this function is not "pure" because it
 * >           calls Date.now() to get the current timestamp,
 * >           however, for testing purposes, you can pass in a
 * >           predefined "now" value which will cause the function
 * >           to be "pure" and give a predictable result.
 *
 * @param {number}      offset Offset from now
 * @param {string}      unit   Unit offset represents
 * @param {null|number} now    JS Timestamp for current time
 *
 * @returns {string}
 */
export const getRelativeIsoDate = (offset, unit = 'year', now = null) => {
  if (typeof offset !== 'number') {
    throw new Error(
      'getRelativeIsoDate() expects first parameter `offset` to '
      + `be a number. "${typeof offset}" given`,
    );
  }
  if (typeof unit !== 'string') {
    throw new Error(
      'getRelativeIsoDate() expects second parameter `unit` to be '
      + `a string. "${typeof offset}" given`,
    );
  }

  const _now = (typeof now !== 'number')
    ? Date.now()
    : now;

  let multiplyer = 1;

  switch (unit.trim().toLowerCase().replace(/s$/i, '')) {
    case 'year':
      multiplyer = 31557600000;
      break;
    case 'month':
      multiplyer = 2629800000;
      break;
    case 'week':
      multiplyer = 604800000;
      break;
    case 'day':
      multiplyer = 86400000;
      break;
    default:
      throw new Error('getRelativeIsoDate() expects unit to be a string matching: "year", "month", "week" or "day"');
  }

  const when = new Date(_now + (multiplyer * offset));

  return when.toISOString().replace(/T.*$/, '');
};

export const mapMonth = (month) => months[parseInt(month, 10) - 1];

export const getIsoDate = (timestamp) => {
  const d = new Date(timestamp);

  return d.toISOString();
};

export const getDateParts = (input, defaultVal = false) => {
  if (isNum(input) || typeof input === 'string') {
    const tmp = new Date(input);

    if (tmp.toString() !== 'Invalid Date') {
      return {
        day: tmp.getDate(),
        month: (tmp.getMonth() + 1),
        year: tmp.getFullYear(),
      };
    }
  }

  return defaultVal;
};

export const localDate = (date) => date.toLocaleDateString(
  'en-AU',
  {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  },
);

export const auDate = (date) => date.toLocaleDateString('en-AU');

export const dateFromParts = (parts) => new Date(`${parts.year}-${parts.month}-${parts.day}`);

/**
 * Get an error message if date is outside allowed range
 *
 * @param {object}      parts day, month, year parts of a date
 * @param {number|null} min   timestamp for minimum date allowable
 * @param {number|null} max   timestamp for maximum date allowable
 *
 * @returns {string|boolean} If there's an error the Error message
 *                           string will be returned.
 *                           If any of the date parts are not numbers,
 *                           TRUE will be returned to indicate the
 *                           date is invalid but that we don't have
 *                           enough value to validate.
 *                           FALSE if the date is valid (i.e. no error)
 */
export const getDateError = (parts, min, max) => {
  const keys = ['day', 'month', 'year'];

  for (const key of keys) {
    if (typeof parts[key] !== 'number') {
      // we don't have all the info yet
      return true;
    }
  }

  if (parts.day < 1) {
    return 'UDay value must be greater than or equal to 1';
  }

  const dim = daysInMonth(parts.month, parts.year);

  if (parts.day > dim) {
    return `ODay value must be less than or equal to ${dim}`;
  }

  if (parts.month < 1) {
    return 'UMonth value must be greater than or equal to 1';
  }
  if (parts.month > 12) {
    return 'OMonth value must be less than or equal to 12';
  }

  const tmp = dateFromParts(parts);
  const timestamp = tmp.getTime();
  const msg = localDate(tmp);

  if (min !== null && timestamp < min) {
    return `UDate (${msg} is earlier than the minimum allowed `
      + `(${localDate(new Date(min))}.`;
  }

  if (max !== null && timestamp > max) {
    return `ODate (${msg} is later than the minimum allowed `
      + `(${localDate(new Date(max))}.`;
  }

  return false;
};
