import { CatDot } from './CatDot';
import { Icon } from './Icon';

interface CategoryModalCategory {
  id: string;
  name: string;
  color: string;
  amount: number;
}

interface CategoryModalTransaction {
  id: string;
  note: string;
  date: string;
  amount: number;
  currency: string;
}

interface CategoryModalProps {
  category: CategoryModalCategory | null;
  transactions: CategoryModalTransaction[];
  onClose: () => void;
}

const fmt = (n: number) => new Intl.NumberFormat('ru-RU').format(Math.round(n));

export function CategoryModal({ category, transactions, onClose }: CategoryModalProps) {
  if (!category) return null;

  return (
    <div
      onClick={onClose}
      className="absolute inset-0 z-[100] flex items-end"
      style={{
        background: 'rgba(0,0,0,0.4)',
        animation: 'fadeIn 0.2s ease',
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="flex w-full flex-col rounded-t-modal bg-bg"
        style={{
          padding: '12px 0 30px',
          maxHeight: '78%',
          animation: 'slideUp 0.25s ease',
        }}
      >
        {/* Grabber */}
        <div
          className="mx-auto mb-4 rounded-full bg-border"
          style={{ width: 40, height: 5 }}
        />

        {/* Header */}
        <div className="flex items-center gap-3 px-6 pb-4">
          <CatDot color={category.color} size={44} radius={14} />
          <div className="flex-1">
            <div
              className="text-xl font-bold text-fg"
              style={{ fontFamily: '"Inter Tight", inherit' }}
            >
              {category.name}
            </div>
            <div className="mt-0.5 text-[13px] text-muted">
              {transactions.length} операций
            </div>
          </div>
          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-full border-none bg-card"
            style={{ cursor: 'pointer' }}
          >
            {Icon.close('#7C7C82', 16)}
          </button>
        </div>

        {/* Total */}
        <div
          className="px-6 pb-4 pt-2 text-[28px] font-bold text-fg"
          style={{
            fontFamily: '"Inter Tight", inherit',
            letterSpacing: -0.6,
            fontVariantNumeric: 'tabular-nums',
          }}
        >
          {fmt(category.amount)} ₽
        </div>

        {/* Transaction list */}
        <div className="flex-1 overflow-auto px-4">
          {transactions.map((t) => (
            <div
              key={t.id}
              className="flex items-center justify-between border-b border-border px-3 py-3.5"
            >
              <div>
                <div className="text-[15px] text-fg">{t.note || category.name}</div>
                <div className="mt-0.5 text-xs text-muted">{t.date}</div>
              </div>
              <div
                className="text-[15px] font-semibold text-fg"
                style={{ fontVariantNumeric: 'tabular-nums' }}
              >
                {fmt(t.amount)} ₽
              </div>
            </div>
          ))}
          {transactions.length === 0 && (
            <div className="py-8 text-center text-sm text-muted">
              Пока нет операций
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
