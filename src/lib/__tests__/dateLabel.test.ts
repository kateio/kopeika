import { describe, it, expect } from 'vitest';
import { dayLabel } from '../dateLabel';

describe('dayLabel', () => {
  const now = new Date('2026-04-20T12:00:00');

  it('возвращает "Сегодня" для текущей даты', () => {
    expect(dayLabel('2026-04-20', now)).toBe('Сегодня');
  });

  it('возвращает "Вчера" для вчерашней даты', () => {
    expect(dayLabel('2026-04-19', now)).toBe('Вчера');
  });

  it('возвращает день недели для даты в текущей неделе', () => {
    const result = dayLabel('2026-04-15', now);
    expect(result).toBe('Среда');
  });

  it('возвращает число и месяц для старых дат', () => {
    const result = dayLabel('2026-03-10', now);
    expect(result).toContain('10');
    expect(result).toContain('март');
  });
});
