
/**
 * Formats a currency value according to the specified locale and currency
 */
export const formatCurrency = (value: number, currency = 'BRL', locale = 'pt-BR') => {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(value);
};

/**
 * Formats a date to a human-readable string
 */
export const formatDate = (date: Date | null | undefined, locale = 'pt-BR') => {
  if (!date) return '';
  return new Date(date).toLocaleDateString(locale, {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });
};
