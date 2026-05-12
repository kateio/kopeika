import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { TransactionList } from '../TransactionList';
import type { Transaction, Category } from '@/types';

const categories: Category[] = [
  { id: 'cat_food', name: 'Еда', icon: '🍕', color: '#D4F26A', type: 'expense' },
  { id: 'cat_salary', name: 'Зарплата', icon: '💰', color: '#9EE5C5', type: 'income' },
];

const transactions: Transaction[] = [
  { id: 'tx1', amount: 500, currency: 'RUB', categoryId: 'cat_food', date: '2026-04-20', comment: 'Кофе', type: 'expense' },
  { id: 'tx2', amount: 1000, currency: 'RUB', categoryId: 'cat_food', date: '2026-04-19', comment: 'Обед', type: 'expense' },
];

describe('TransactionList', () => {
  it('рендерит транзакции', () => {
    render(
      <TransactionList
        transactions={transactions}
        categories={categories}
        onTap={vi.fn()}
        onDelete={vi.fn()}
        onEdit={vi.fn()}
      />,
    );
    expect(screen.getByText('Кофе')).toBeTruthy();
    expect(screen.getByText('Обед')).toBeTruthy();
  });

  it('показывает категорию', () => {
    render(
      <TransactionList
        transactions={transactions}
        categories={categories}
        onTap={vi.fn()}
        onDelete={vi.fn()}
        onEdit={vi.fn()}
      />,
    );
    expect(screen.getAllByText('Еда').length).toBeGreaterThan(0);
  });

  it('показывает пустое состояние', () => {
    render(
      <TransactionList
        transactions={[]}
        categories={categories}
        onTap={vi.fn()}
        onDelete={vi.fn()}
        onEdit={vi.fn()}
      />,
    );
    expect(screen.getByText('Нет операций')).toBeTruthy();
  });
});
