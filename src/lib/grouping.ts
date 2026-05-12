import type { Transaction, Category } from '@/types';

export interface CategoryTotal {
  category: Category;
  total: number;
  count: number;
  percentage: number;
}

export function groupByCategory(
  transactions: Transaction[],
  categories: Category[],
): CategoryTotal[] {
  const totalsMap = new Map<string, { total: number; count: number }>();

  for (const tx of transactions) {
    const entry = totalsMap.get(tx.categoryId);
    if (entry) {
      entry.total += tx.amount;
      entry.count += 1;
    } else {
      totalsMap.set(tx.categoryId, { total: tx.amount, count: 1 });
    }
  }

  const grandTotal = Array.from(totalsMap.values()).reduce((sum, e) => sum + e.total, 0);

  const result: CategoryTotal[] = [];

  for (const cat of categories) {
    const entry = totalsMap.get(cat.id);
    if (entry) {
      result.push({
        category: cat,
        total: entry.total,
        count: entry.count,
        percentage: grandTotal > 0 ? (entry.total / grandTotal) * 100 : 0,
      });
    }
  }

  result.sort((a, b) => b.total - a.total);

  return result;
}

export interface DayGroup {
  date: string;
  transactions: Transaction[];
  total: number;
}

export function groupByDay(transactions: Transaction[]): DayGroup[] {
  const map = new Map<string, Transaction[]>();

  for (const tx of transactions) {
    const existing = map.get(tx.date);
    if (existing) {
      existing.push(tx);
    } else {
      map.set(tx.date, [tx]);
    }
  }

  const groups: DayGroup[] = Array.from(map.entries()).map(([date, txs]) => ({
    date,
    transactions: txs,
    total: txs.reduce((sum, tx) => sum + tx.amount, 0),
  }));

  groups.sort((a, b) => (a.date > b.date ? -1 : a.date < b.date ? 1 : 0));

  return groups;
}

export function filterByMonth(
  transactions: Transaction[],
  year: number,
  month: number,
): Transaction[] {
  return transactions.filter((tx) => {
    const d = new Date(tx.date + 'T00:00:00');
    return d.getFullYear() === year && d.getMonth() === month;
  });
}

export function filterByType(
  transactions: Transaction[],
  type: 'expense' | 'income',
): Transaction[] {
  return transactions.filter((tx) => tx.type === type);
}
