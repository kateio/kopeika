import { describe, it, expect } from 'vitest';
import { formatMoney, formatAmount, formatDate } from '../format';

describe('formatMoney', () => {
  it('форматирует рубли', () => {
    const result = formatMoney({ value: 1250, currency: 'RUB' });
    expect(result).toContain('1');
    expect(result).toContain('250');
    expect(result).toContain('₽');
  });

  it('форматирует доллары', () => {
    const result = formatMoney({ value: 15.5, currency: 'USD' });
    expect(result).toContain('15');
    expect(result).toContain('$');
  });

  it('форматирует ноль', () => {
    const result = formatMoney({ value: 0, currency: 'RUB' });
    expect(result).toContain('0');
    expect(result).toContain('₽');
  });
});

describe('formatAmount', () => {
  it('форматирует рубли через отдельные аргументы', () => {
    const result = formatAmount(55590, 'RUB');
    expect(result).toContain('55');
    expect(result).toContain('590');
    expect(result).toContain('₽');
  });

  it('форматирует доллары через отдельные аргументы', () => {
    const result = formatAmount(42.99, 'USD');
    expect(result).toContain('$');
  });
});

describe('formatDate', () => {
  it('форматирует дату в коротком формате', () => {
    const result = formatDate('2026-04-12', 'short');
    expect(result).toContain('12');
    expect(result).toContain('апр');
  });

  it('форматирует дату в длинном формате', () => {
    const result = formatDate('2026-04-12', 'long');
    expect(result).toContain('12');
    expect(result).toContain('апрел');
    expect(result).toContain('2026');
  });

  it('принимает объект Date', () => {
    const result = formatDate(new Date(2026, 3, 12), 'short');
    expect(result).toContain('12');
  });
});
