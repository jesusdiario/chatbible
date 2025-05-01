
/**
 * Utility functions for message count operations
 */

/**
 * Calculate days until a future date
 * @param futureDate The date to calculate days until
 * @returns Number of days until the date
 */
export function calculateDaysUntilDate(futureDate: Date): number {
  const now = new Date();
  const diffTime = futureDate.getTime() - now.getTime();
  return Math.max(0, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));
}

/**
 * Get the first day of next month
 * @param date Base date to calculate from
 * @returns Date object representing first day of next month
 */
export function getNextMonthDate(date: Date): Date {
  const nextMonth = new Date(date);
  nextMonth.setMonth(nextMonth.getMonth() + 1);
  nextMonth.setDate(1);
  nextMonth.setHours(0, 0, 0, 0);
  return nextMonth;
}
