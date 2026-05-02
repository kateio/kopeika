import type { Transaction, Category } from '@/types';
import { Icon } from './Icon';
import { useScrollLock } from '@/lib/useScrollLock';

interface SummarySheetProps {
  transactions: Transaction[];
  categories: Category[];
  monthName: string;
  onClose: () => void;
}

const fmt = (n: number) => new Intl.NumberFormat('ru-RU').format(Math.round(n));

export function SummarySheet({
  transactions,
  categories,
  monthName,
  onClose,
}: SummarySheetProps) {
  useScrollLock(true);

  const income = transactions
    .filter((t) => t.type === 'income')
    .reduce((s, t) => s + (t.currency === 'RUB' ? t.amount : t.amount * 90), 0);

  const expenses = transactions
    .filter((t) => t.type === 'expense')
    .reduce((s, t) => s + (t.currency === 'RUB' ? t.amount : t.amount * 90), 0);

  const balance = income - expenses;

  // Top-3 expense categories
  const expenseTxs = transactions.filter((t) => t.type === 'expense');
  const catTotals = new Map<string, number>();
  for (const tx of expenseTxs) {
    const amt = tx.currency === 'RUB' ? tx.amount : tx.amount * 90;
    catTotals.set(tx.categoryId, (catTotals.get(tx.categoryId) ?? 0) + amt);
  }
  const top3 = Array.from(catTotals.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([catId, total]) => {
      const cat = categories.find((c) => c.id === catId);
      return {
        name: cat?.name ?? 'Неизвестно',
        icon: cat?.icon ?? '📝',
        total,
        percent: expenses > 0 ? Math.round((total / expenses) * 100) : 0,
      };
    });

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-[100] flex items-end"
      style={{ background: 'rgba(0,0,0,0.4)', animation: 'fadeIn 0.2s ease', overscrollBehavior: 'contain' }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="flex w-full flex-col bg-bg"
        style={{
          borderTopLeftRadius: 24,
          borderTopRightRadius: 24,
          padding: '12px 0 30px',
          animation: 'slideUp 0.25s ease',
        }}
      >
        {/* Grabber */}
        <div
          className="mx-auto mb-4 rounded-full bg-border"
          style={{ width: 40, height: 5 }}
        />

        {/* Header */}
        <div className="flex items-center justify-between px-6 pb-6">
          <h2
            className="text-xl font-bold text-fg"
            style={{ fontFamily: '"Inter Tight", inherit' }}
          >
            Сводка за {monthName.toLowerCase()}
          </h2>
          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-full border-none bg-card"
            style={{ cursor: 'pointer' }}
          >
            {Icon.close('#7C7C82', 16)}
          </button>
        </div>

        {/* Summary rows */}
        <div className="px-6 space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-[15px] text-muted">Доходы</span>
            <span
              className="text-[20px] font-bold"
              style={{
                color: '#22C55E',
                fontFamily: '"Inter Tight", inherit',
                fontVariantNumeric: 'tabular-nums',
              }}
            >
              +{fmt(income)} ₽
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-[15px] text-muted">Расходы</span>
            <span
              className="text-[20px] font-bold text-fg"
              style={{
                fontFamily: '"Inter Tight", inherit',
                fontVariantNumeric: 'tabular-nums',
              }}
            >
              −{fmt(expenses)} ₽
            </span>
          </div>
          <div
            className="border-t border-border pt-4 flex items-center justify-between"
          >
            <span className="text-[15px] font-medium text-fg">Остаток</span>
            <span
              className="text-[22px] font-bold"
              style={{
                color: balance >= 0 ? '#22C55E' : '#DC2626',
                fontFamily: '"Inter Tight", inherit',
                fontVariantNumeric: 'tabular-nums',
              }}
            >
              {balance >= 0 ? '+' : '−'}{fmt(Math.abs(balance))} ₽
            </span>
          </div>
        </div>

        {/* Top-3 categories */}
        {top3.length > 0 && (
          <div className="mt-6 px-6">
            <div
              className="mb-3 text-[11px] font-semibold uppercase text-muted"
              style={{ letterSpacing: 1 }}
            >
              Топ категорий трат
            </div>
            <div className="space-y-3">
              {top3.map((cat) => (
                <div key={cat.name} className="flex items-center gap-3">
                  <span className="text-lg">{cat.icon}</span>
                  <span className="flex-1 text-[15px] text-fg">{cat.name}</span>
                  <span className="text-xs text-muted mr-2">{cat.percent}%</span>
                  <span
                    className="text-[15px] font-semibold text-fg"
                    style={{ fontVariantNumeric: 'tabular-nums' }}
                  >
                    {fmt(cat.total)} ₽
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
