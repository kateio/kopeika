import type { Transaction, Category } from '@/types';
import { dayLabel } from '@/lib/dateLabel';
import { SwipeableRow } from './SwipeableRow';

interface TransactionListProps {
  transactions: Transaction[];
  categories: Category[];
  onTap: (tx: Transaction) => void;
  onDelete: (tx: Transaction) => void;
  onEdit: (tx: Transaction) => void;
}

const fmt = (n: number) => new Intl.NumberFormat('ru-RU').format(Math.round(n));

interface DayGroup {
  dateStr: string;
  label: string;
  items: Transaction[];
}

function groupByDay(txs: Transaction[]): DayGroup[] {
  const sorted = [...txs].sort((a, b) => (a.date > b.date ? -1 : a.date < b.date ? 1 : 0));
  const groups: DayGroup[] = [];
  const now = new Date();
  for (const tx of sorted) {
    const last = groups[groups.length - 1];
    if (last && last.dateStr === tx.date) {
      last.items.push(tx);
    } else {
      groups.push({ dateStr: tx.date, label: dayLabel(tx.date, now), items: [tx] });
    }
  }
  return groups;
}

export function TransactionList({
  transactions,
  categories,
  onTap,
  onDelete,
  onEdit,
}: TransactionListProps) {
  const groups = groupByDay(transactions);
  const catMap = new Map(categories.map((c) => [c.id, c]));

  if (transactions.length === 0) {
    return (
      <div className="px-5 py-10 text-center text-sm text-muted">
        Нет операций
      </div>
    );
  }

  return (
    <div>
      {groups.map((group) => (
        <div key={group.dateStr}>
          <div
            className="sticky top-0 z-10 px-4 py-2 text-[12px] font-semibold uppercase"
            style={{
              color: '#7C7C82',
              background: '#FAF8F4',
              letterSpacing: 0.5,
            }}
          >
            {group.label}
          </div>
          <div className="mx-4 overflow-hidden rounded-card bg-card">
            {group.items.map((tx, i) => {
              const cat = catMap.get(tx.categoryId);
              const isIncome = tx.type === 'income';
              return (
                <SwipeableRow
                  key={tx.id}
                  onSwipeLeft={() => onDelete(tx)}
                  onSwipeRight={() => onEdit(tx)}
                >
                  <button
                    onClick={() => onTap(tx)}
                    className="flex w-full items-center gap-3 bg-transparent px-4 py-3 text-left"
                    style={{
                      border: 'none',
                      borderTop: i > 0 ? '1px solid #EDE9E1' : 'none',
                      cursor: 'pointer',
                      fontFamily: 'inherit',
                    }}
                  >
                    <div
                      className="flex shrink-0 items-center justify-center"
                      style={{
                        width: 36,
                        height: 36,
                        borderRadius: 12,
                        background: cat?.color ?? '#EDE9E1',
                        fontSize: 18,
                      }}
                    >
                      {cat?.icon ?? '📝'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-[15px] font-medium text-fg truncate">
                        {cat?.name ?? 'Без категории'}
                      </div>
                      {tx.comment && (
                        <div className="mt-0.5 text-[12px] text-muted truncate">
                          {tx.comment}
                        </div>
                      )}
                    </div>
                    <div
                      className="text-[15px] font-semibold shrink-0"
                      style={{
                        color: isIncome ? '#22C55E' : '#1A1A1E',
                        fontVariantNumeric: 'tabular-nums',
                      }}
                    >
                      {isIncome ? '+' : ''}{fmt(tx.amount)}{' '}
                      {tx.currency === 'RUB' ? '₽' : '$'}
                    </div>
                  </button>
                </SwipeableRow>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
