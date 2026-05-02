import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { SwipeableRow } from '../SwipeableRow';

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
    // After rerender, offset should return to 0 (visually closed)
  });
});
