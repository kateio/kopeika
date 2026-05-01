import { useState } from 'react';
import type { Transaction, Category, CurrencyCode } from '@/types';
import { Icon } from './Icon';

interface TransactionEditorProps {
  transaction: Transaction;
  categories: Category[];
  onSave: (updated: Transaction) => void;
  onDelete: (id: string) => void;
  onClose: () => void;
}

export function TransactionEditor({
  transaction,
  categories,
  onSave,
  onDelete,
  onClose,
}: TransactionEditorProps) {
  const [amount, setAmount] = useState(String(transaction.amount));
  const [currency, setCurrency] = useState<CurrencyCode>(transaction.currency);
  const [categoryId, setCategoryId] = useState(transaction.categoryId);
  const [date, setDate] = useState(transaction.date);
  const [comment, setComment] = useState(transaction.comment);

  const relevantCats = categories.filter((c) => c.type === transaction.type);

  const handleSave = () => {
    const num = parseFloat(amount);
    if (isNaN(num) || num <= 0) return;
    onSave({
      ...transaction,
      amount: num,
      currency,
      categoryId,
      date,
      comment,
    });
  };

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-[100] flex items-end"
      style={{ background: 'rgba(0,0,0,0.4)', animation: 'fadeIn 0.2s ease' }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="flex w-full flex-col bg-bg"
        style={{
          borderTopLeftRadius: 28,
          borderTopRightRadius: 28,
          padding: '12px 0 30px',
          maxHeight: '85vh',
          animation: 'slideUp 0.25s ease',
        }}
      >
        {/* Grabber */}
        <div
          className="mx-auto mb-4 rounded-full bg-border"
          style={{ width: 40, height: 5 }}
        />

        {/* Header */}
        <div className="flex items-center justify-between px-6 pb-4">
          <h2
            className="text-xl font-bold text-fg"
            style={{ fontFamily: '"Inter Tight", inherit' }}
          >
            Редактирование
          </h2>
          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-full border-none bg-card"
            style={{ cursor: 'pointer' }}
          >
            {Icon.close('#7C7C82', 16)}
          </button>
        </div>

        <div className="flex-1 overflow-auto px-6">
          {/* Amount + Currency */}
          <div className="mb-4">
            <label className="mb-1.5 block text-xs font-medium uppercase text-muted" style={{ letterSpacing: 0.5 }}>
              Сумма
            </label>
            <div className="flex gap-2">
              <input
                type="number"
                inputMode="decimal"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="flex-1 rounded-DEFAULT border border-border bg-card px-4 py-3 text-[16px] text-fg outline-none"
                style={{ fontFamily: 'inherit' }}
              />
              <div className="flex gap-1 rounded-DEFAULT bg-card p-1">
                {(['RUB', 'USD'] as CurrencyCode[]).map((c) => (
                  <button
                    key={c}
                    onClick={() => setCurrency(c)}
                    className="rounded-[12px] border-none px-3 py-2 text-sm font-semibold transition-all"
                    style={{
                      background: currency === c ? '#FAF8F4' : 'transparent',
                      color: currency === c ? '#1A1A1E' : '#7C7C82',
                      cursor: 'pointer',
                      boxShadow: currency === c ? '0 2px 8px rgba(0,0,0,0.06)' : 'none',
                    }}
                  >
                    {c === 'RUB' ? '₽' : '$'}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Category */}
          <div className="mb-4">
            <label className="mb-1.5 block text-xs font-medium uppercase text-muted" style={{ letterSpacing: 0.5 }}>
              Категория
            </label>
            <div className="flex flex-wrap gap-2">
              {relevantCats.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setCategoryId(cat.id)}
                  className="flex items-center gap-1.5 rounded-DEFAULT border-none px-3 py-2 text-sm font-medium transition-all"
                  style={{
                    background: categoryId === cat.id ? '#1A1A1E' : '#FFFFFF',
                    color: categoryId === cat.id ? '#FAF8F4' : '#1A1A1E',
                    cursor: 'pointer',
                  }}
                >
                  <span>{cat.icon}</span>
                  {cat.name}
                </button>
              ))}
            </div>
          </div>

          {/* Date */}
          <div className="mb-4">
            <label className="mb-1.5 block text-xs font-medium uppercase text-muted" style={{ letterSpacing: 0.5 }}>
              Дата
            </label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full rounded-DEFAULT border border-border bg-card px-4 py-3 text-[16px] text-fg outline-none"
              style={{ fontFamily: 'inherit' }}
            />
          </div>

          {/* Comment */}
          <div className="mb-6">
            <label className="mb-1.5 block text-xs font-medium uppercase text-muted" style={{ letterSpacing: 0.5 }}>
              Комментарий
            </label>
            <input
              type="text"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Добавить описание..."
              className="w-full rounded-DEFAULT border border-border bg-card px-4 py-3 text-[16px] text-fg outline-none"
              style={{ fontFamily: 'inherit' }}
            />
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3 px-6">
          <button
            onClick={() => onDelete(transaction.id)}
            className="flex-1 rounded-DEFAULT border-none py-3.5 text-[15px] font-semibold"
            style={{ background: '#FEE2E2', color: '#DC2626', cursor: 'pointer' }}
          >
            Удалить
          </button>
          <button
            onClick={handleSave}
            className="flex-[2] rounded-DEFAULT border-none py-3.5 text-[15px] font-semibold"
            style={{ background: '#D4F26A', color: '#000', cursor: 'pointer' }}
          >
            Сохранить
          </button>
        </div>
      </div>
    </div>
  );
}
