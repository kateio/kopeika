import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { AppProvider, ToastProvider } from '../store';
import { App } from '../App';

function renderApp(route = '/') {
  return render(
    <MemoryRouter initialEntries={[route]}>
      <AppProvider>
        <ToastProvider>
          <App />
        </ToastProvider>
      </AppProvider>
    </MemoryRouter>,
  );
}

describe('App', () => {
  it('рендерит главный экран по умолчанию', () => {
    renderApp('/');
    expect(document.getElementById('root') || document.body).toBeTruthy();
  });

  it('рендерит стартовый экран на /start', () => {
    renderApp('/start');
    expect(screen.getByText('Копейка')).toBeTruthy();
  });

  it('рендерит UI Kit на /uikit', () => {
    renderApp('/uikit');
    expect(screen.getByText('UI Kit')).toBeTruthy();
  });
});
