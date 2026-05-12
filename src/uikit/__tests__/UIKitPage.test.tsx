import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { UIKitPage } from '../UIKitPage';

describe('UIKitPage', () => {
  it('рендерится без ошибок', () => {
    render(
      <MemoryRouter>
        <UIKitPage />
      </MemoryRouter>,
    );
    expect(screen.getByText('UI Kit')).toBeTruthy();
  });

  it('содержит раздел цветовой палитры', () => {
    render(
      <MemoryRouter>
        <UIKitPage />
      </MemoryRouter>,
    );
    expect(screen.getByText('Цветовая палитра')).toBeTruthy();
  });

  it('содержит раздел типографики', () => {
    render(
      <MemoryRouter>
        <UIKitPage />
      </MemoryRouter>,
    );
    expect(screen.getAllByText('Типографика').length).toBeGreaterThan(0);
  });
});
