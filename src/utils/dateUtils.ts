
/**
 * Calculate days until next reset (for displaying to user)
 */
export const getDaysUntilReset = (): number => {
  const today = new Date();
  const nextMonth = new Date(today);
  nextMonth.setMonth(nextMonth.getMonth() + 1);
  nextMonth.setDate(1);
  nextMonth.setHours(0, 0, 0, 0);
  
  const timeDiff = nextMonth.getTime() - today.getTime();
  return Math.ceil(timeDiff / (1000 * 60 * 60 * 24));
};

/**
 * Calculate the next reset date (first day of next month)
 */
export const getNextResetDate = (): Date => {
  const now = new Date();
  const nextReset = new Date(now);
  nextReset.setMonth(nextReset.getMonth() + 1);
  nextReset.setDate(1);
  nextReset.setHours(0, 0, 0, 0);
  
  return nextReset;
};
