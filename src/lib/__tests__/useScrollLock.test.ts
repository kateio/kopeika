import { describe, it, expect } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useScrollLock } from '../useScrollLock';

describe('useScrollLock', () => {
  it('блокирует скролл при active=true', () => {
    const { unmount } = renderHook(() => useScrollLock(true));
    expect(document.body.style.overflow).toBe('hidden');
    unmount();
    expect(document.body.style.overflow).toBe('');
  });

  it('не блокирует скролл при active=false', () => {
    renderHook(() => useScrollLock(false));
    expect(document.body.style.overflow).not.toBe('hidden');
  });
});
