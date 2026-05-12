import { describe, it, expect } from 'vitest';
import { render, screen, act } from '@testing-library/react';
import { AppProvider, useApp } from '../AppContext';

function TestComponent() {
  const { state, addTransaction, deleteTransaction, addCategory } = useApp();
  return (
    <div>
      <span data-testid="tx-count">{state.transactions.length}</span>
      <span data-testid="cat-count">{state.categories.length}</span>
      <button
        onClick={() =>
          addTransaction({
            amount: 100,
            currency: 'RUB',
            categoryId: 'cat_food',
            date: '2026-04-20',
            comment: 'Тест',
            type: 'expense',
          })
        }
      >
        add-tx
      </button>
      <button onClick={() => deleteTransaction(state.transactions[0]?.id ?? '')}>
        del-tx
      </button>
      <button
        onClick={() =>
          addCategory({ name: 'Тест', icon: '🧪', color: '#FF0000', type: 'expense' })
        }
      >
        add-cat
      </button>
    </div>
  );
}

describe('AppContext', () => {
  it('содержит начальные моки', () => {
    render(
      <AppProvider>
        <TestComponent />
      </AppProvider>,
    );
    const txCount = Number(screen.getByTestId('tx-count').textContent);
    expect(txCount).toBeGreaterThan(0);
    const catCount = Number(screen.getByTestId('cat-count').textContent);
    expect(catCount).toBeGreaterThan(0);
  });

  it('добавляет транзакцию', () => {
    render(
      <AppProvider>
        <TestComponent />
      </AppProvider>,
    );
    const before = Number(screen.getByTestId('tx-count').textContent);
    act(() => {
      screen.getByText('add-tx').click();
    });
    const after = Number(screen.getByTestId('tx-count').textContent);
    expect(after).toBe(before + 1);
  });

  it('удаляет транзакцию', () => {
    render(
      <AppProvider>
        <TestComponent />
      </AppProvider>,
    );
    const before = Number(screen.getByTestId('tx-count').textContent);
    act(() => {
      screen.getByText('del-tx').click();
    });
    const after = Number(screen.getByTestId('tx-count').textContent);
    expect(after).toBe(before - 1);
  });

  it('добавляет категорию', () => {
    render(
      <AppProvider>
        <TestComponent />
      </AppProvider>,
    );
    const before = Number(screen.getByTestId('cat-count').textContent);
    act(() => {
      screen.getByText('add-cat').click();
    });
    const after = Number(screen.getByTestId('cat-count').textContent);
    expect(after).toBe(before + 1);
  });
});
