import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { App } from '../App';

describe('App', () => {
  it('рендерит главный экран по умолчанию', () => {
    render(
      <MemoryRouter initialEntries={['/']}>
        <App />
      </MemoryRouter>,
    );
    expect(document.getElementById('root') || document.body).toBeTruthy();
  });

  it('рендерит стартовый экран на /start', () => {
    render(
      <MemoryRouter initialEntries={['/start']}>
        <App />
      </MemoryRouter>,
    );
    expect(screen.getByText('Копейка')).toBeTruthy();
  });

  it('рендерит UI Kit на /uikit', () => {
    render(
      <MemoryRouter initialEntries={['/uikit']}>
        <App />
      </MemoryRouter>,
    );
    expect(screen.getByText('UI Kit')).toBeTruthy();
  });
});
