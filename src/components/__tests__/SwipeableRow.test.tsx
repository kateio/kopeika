import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { SwipeableRow, getSwipePhase } from '../SwipeableRow';

describe('SwipeableRow', () => {
  const defaultProps = {
    rowId: 'row-1',
    openRowId: null as string | null,
    onOpenChange: vi.fn(),
    onSwipeLeft: vi.fn(),
    onSwipeRight: vi.fn(),
  };

  it('рендерит children', () => {
    render(
      <SwipeableRow {...defaultProps}>
        <span>Тестовый контент</span>
      </SwipeableRow>
    );
    expect(screen.getByText('Тестовый контент')).toBeDefined();
  });

  it('закрывается когда другая строка открывается', () => {
    const { rerender } = render(
      <SwipeableRow {...defaultProps} openRowId="row-1">
        <span>Контент</span>
      </SwipeableRow>
    );
    rerender(
      <SwipeableRow {...defaultProps} openRowId="row-2">
        <span>Контент</span>
      </SwipeableRow>
    );
  });
});

describe('getSwipePhase', () => {
  const width = 400;

  it('idle при малом смещении', () => {
    expect(getSwipePhase(0, width)).toBe('idle');
    expect(getSwipePhase(50, width)).toBe('idle');
    expect(getSwipePhase(-100, width)).toBe('idle');
  });

  it('reveal при 30-70% смещении', () => {
    expect(getSwipePhase(120, width)).toBe('reveal');
    expect(getSwipePhase(-150, width)).toBe('reveal');
    expect(getSwipePhase(200, width)).toBe('reveal');
    expect(getSwipePhase(-270, width)).toBe('reveal');
  });

  it('commit при >=70% смещении', () => {
    expect(getSwipePhase(280, width)).toBe('commit');
    expect(getSwipePhase(-300, width)).toBe('commit');
    expect(getSwipePhase(400, width)).toBe('commit');
  });

  it('учитывает знак (абсолютное значение)', () => {
    expect(getSwipePhase(-120, width)).toBe(getSwipePhase(120, width));
    expect(getSwipePhase(-300, width)).toBe(getSwipePhase(300, width));
  });
});
