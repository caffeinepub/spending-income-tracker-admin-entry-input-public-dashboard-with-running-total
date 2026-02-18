import type { Time } from '../backend';

/**
 * Validates day, month, and year inputs
 */
export function validateDateInputs(
  day: number,
  month: number,
  year: number
): { valid: boolean; error?: string } {
  if (isNaN(day) || isNaN(month) || isNaN(year)) {
    return { valid: false, error: 'All date fields are required' };
  }

  if (day < 1 || day > 31) {
    return { valid: false, error: 'Day must be between 1 and 31' };
  }

  if (month < 1 || month > 12) {
    return { valid: false, error: 'Month must be between 1 and 12' };
  }

  if (year < 1000 || year > 9999) {
    return { valid: false, error: 'Year must be a 4-digit number' };
  }

  // Check if the date is valid (e.g., not Feb 30)
  const date = new Date(year, month - 1, day);
  if (
    date.getFullYear() !== year ||
    date.getMonth() !== month - 1 ||
    date.getDate() !== day
  ) {
    return { valid: false, error: 'Invalid date (e.g., Feb 30 does not exist)' };
  }

  return { valid: true };
}

/**
 * Converts day, month, year to backend Time format (nanoseconds since epoch)
 */
export function convertDateToTime(day: number, month: number, year: number): Time {
  // Create date at midnight UTC
  const date = new Date(Date.UTC(year, month - 1, day, 0, 0, 0, 0));
  const milliseconds = date.getTime();
  // Convert to nanoseconds (bigint)
  return BigInt(milliseconds) * BigInt(1_000_000);
}
