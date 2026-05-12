import type { Money, CurrencyCode } from '@/types';

export function formatMoney(money: Money, locale = 'ru-RU'): string {
  return formatAmount(money.value, money.currency, locale);
}

export function formatAmount(value: number, currency: CurrencyCode, locale = 'ru-RU'): string {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    minimumFractionDigits: currency === 'USD' ? 2 : 0,
    maximumFractionDigits: currency === 'USD' ? 2 : 0,
  }).format(value);
}

export function formatDate(date: Date | string, format: 'short' | 'long' = 'short'): string {
  const d = typeof date === 'string' ? new Date(date + 'T00:00:00') : date;

  if (format === 'long') {
    return new Intl.DateTimeFormat('ru-RU', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    }).format(d);
  }

  // short: "12 апр"
  return new Intl.DateTimeFormat('ru-RU', {
    day: 'numeric',
    month: 'short',
  }).format(d);
}
