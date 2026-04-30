import { CatDot } from './CatDot';

interface CategoryListItem {
  id: string;
  name: string;
  color: string;
  amount: number;
  percentage: number;
}

interface CategoryListProps {
  items: CategoryListItem[];
  onSelect: (id: string) => void;
  emptyText?: string;
}

const fmt = (n: number) => new Intl.NumberFormat('ru-RU').format(Math.round(n));

export function CategoryList({
  items,
  onSelect,
  emptyText = 'Пока нет данных',
}: CategoryListProps) {
  return (
    <div className="overflow-hidden rounded-card bg-card">
      {items.length === 0 && (
        <div className="px-5 py-10 text-center text-sm text-muted">{emptyText}</div>
      )}
      {items.map((item, i) => (
        <button
          key={item.id}
          onClick={() => onSelect(item.id)}
          className="flex w-full items-center gap-3.5 bg-transparent px-4 py-3.5 text-left"
          style={{
            border: 'none',
            borderTop: i > 0 ? '1px solid var(--color-border, #EDE9E1)' : 'none',
            cursor: 'pointer',
          }}
        >
          <CatDot color={item.color} size={36} radius={12} />
          <div className="flex-1">
            <div className="text-base font-medium text-fg">{item.name}</div>
            <div className="mt-0.5 text-xs text-muted">{item.percentage}%</div>
          </div>
          <div
            className="text-base font-semibold text-fg"
            style={{ fontVariantNumeric: 'tabular-nums' }}
          >
            {fmt(item.amount)} ₽
          </div>
        </button>
      ))}
    </div>
  );
}
