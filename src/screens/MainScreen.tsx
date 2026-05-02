import { useState, useMemo, useRef } from 'react';
import { useApp, useToast } from '@/store';
import { Icon } from '@/components/Icon';
import { CatDot } from '@/components/CatDot';
import { DonutChart } from '@/components/DonutChart';
import { SegmentedControl } from '@/components/SegmentedControl';
import { MonthPicker, MONTHS } from '@/components/MonthPicker';
import { InputBar } from '@/components/InputBar';
import { TransactionList } from '@/components/TransactionList';
import { TransactionEditor } from '@/components/TransactionEditor';
import { SummarySheet } from '@/components/SummarySheet';
import { SettingsScreen } from '@/screens/SettingsScreen';
import type { Transaction } from '@/types';

const fmt = (n: number) => new Intl.NumberFormat('ru-RU').format(Math.round(n));

interface MainScreenProps {
  onGoToStart: () => void;
}

export function MainScreen({ onGoToStart }: MainScreenProps) {
  const { state, addTransaction, updateTransaction, deleteTransaction, undoDeleteTransaction } = useApp();
  const { showToast } = useToast();

  const [mode, setMode] = useState<'expense' | 'income'>('expense');
  const [month, setMonth] = useState(3); // April (0-indexed)
  const [showMonths, setShowMonths] = useState(false);
  const [draft, setDraft] = useState('');
  const [filterCategoryId, setFilterCategoryId] = useState<string | null>(null);
  const [editingTx, setEditingTx] = useState<Transaction | null>(null);
  const [showSummary, setShowSummary] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const year = 2026;

  // Filter transactions for current month + mode
  const monthTx = useMemo(
    () =>
      state.transactions.filter((t) => {
        const d = new Date(t.date + 'T00:00:00');
        return d.getFullYear() === year && d.getMonth() === month && t.type === mode;
      }),
    [state.transactions, month, mode],
  );

  // All month transactions (for summary)
  const allMonthTx = useMemo(
    () =>
      state.transactions.filter((t) => {
        const d = new Date(t.date + 'T00:00:00');
        return d.getFullYear() === year && d.getMonth() === month;
      }),
    [state.transactions, month],
  );

  // Categories for current mode
  const modeCategories = useMemo(
    () => state.categories.filter((c) => c.type === mode),
    [state.categories, mode],
  );

  // Aggregate by category
  const byCat = useMemo(() => {
    const totals = new Map<string, number>();
    for (const t of monthTx) {
      totals.set(t.categoryId, (totals.get(t.categoryId) ?? 0) + t.amount);
    }
    return modeCategories
      .filter((c) => totals.has(c.id))
      .map((c) => ({ ...c, amount: totals.get(c.id)! }))
      .sort((a, b) => b.amount - a.amount);
  }, [monthTx, modeCategories]);

  const total = byCat.reduce((s, c) => s + c.amount, 0);

  // Filtered transactions for TransactionList
  const filteredTx = useMemo(() => {
    if (!filterCategoryId) return monthTx;
    return monthTx.filter((t) => t.categoryId === filterCategoryId);
  }, [monthTx, filterCategoryId]);

  const filterCategory = filterCategoryId
    ? state.categories.find((c) => c.id === filterCategoryId)
    : null;

  // Donut segments — highlight filtered category or show all
  const donutSegments = useMemo(() => {
    if (!filterCategoryId) {
      return byCat.map((c) => ({ name: c.name, amount: c.amount, color: c.color }));
    }
    return byCat.map((c) => ({
      name: c.name,
      amount: c.amount,
      color: c.id === filterCategoryId ? c.color : '#EDE9E1',
    }));
  }, [byCat, filterCategoryId]);

  // Handle category tap for drill-down filter
  const handleCategoryTap = (catId: string) => {
    if (filterCategoryId === catId) {
      setFilterCategoryId(null);
    } else {
      setFilterCategoryId(catId);
      setTimeout(() => {
        scrollRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
      }, 50);
    }
  };

  // Handle mode change — reset filter if category doesn't exist in new mode
  const handleModeChange = (newMode: string) => {
    const m = newMode as 'expense' | 'income';
    if (filterCategoryId) {
      const cat = state.categories.find((c) => c.id === filterCategoryId);
      if (cat && cat.type !== m) {
        setFilterCategoryId(null);
      }
    }
    setMode(m);
  };

  // Handle send from InputBar
  const handleSend = () => {
    if (!draft.trim()) return;
    const text = draft.toLowerCase();
    const numMatch = text.match(/\d+/);
    const num = parseInt(numMatch?.[0] || '0', 10);
    if (num <= 0) return;

    let categoryId: string;
    if (filterCategoryId) {
      categoryId = filterCategoryId;
    } else {
      const matched = modeCategories.find(
        (c) => text.includes(c.name.toLowerCase().split(' ')[0]),
      );
      categoryId = matched?.id ?? modeCategories[0]?.id ?? '';
    }

    if (!categoryId) return;

    addTransaction({
      amount: num,
      currency: state.defaultCurrency,
      categoryId,
      date: new Date().toISOString().slice(0, 10),
      comment: draft,
      type: mode,
    });

    setDraft('');
    showToast({ message: 'Транзакция добавлена', icon: '✅' });
  };

  // Handle attach
  const handleAttach = () => {
    showToast({ message: 'Прикрепи выписку из банка — я разнесу всё по категориям', icon: '📎' });
  };

  // Handle delete with undo
  const handleDelete = (tx: Transaction) => {
    const deleted = deleteTransaction(tx.id);
    if (deleted) {
      showToast({
        message: 'Транзакция удалена',
        icon: '🗑️',
        action: {
          label: 'Отменить',
          onClick: () => undoDeleteTransaction(deleted),
        },
        duration: 5000,
      });
      if (editingTx?.id === tx.id) setEditingTx(null);
    }
  };

  // Handle save from editor
  const handleSaveTx = (updated: Transaction) => {
    updateTransaction(updated);
    setEditingTx(null);
    showToast({ message: 'Транзакция обновлена', icon: '✅' });
  };

  // InputBar placeholder
  const inputPlaceholder = filterCategory
    ? `Добавить в ${filterCategory.name} — 500 кофе`
    : mode === 'expense'
      ? '100₽ такси'
      : 'расскажи про доход...';

  return (
    <div className="relative flex h-full flex-col" style={{ background: '#FAF8F4', color: '#1A1A1E' }}>
      {/* Header */}
      <div className="flex items-center justify-between px-6" style={{ paddingTop: 56, paddingBottom: 12 }}>
        <button
          onClick={() => setShowMonths((s) => !s)}
          className="flex cursor-pointer items-center gap-1.5 border-none bg-transparent p-0 text-[28px] font-bold"
          style={{
            color: '#1A1A1E',
            fontFamily: '"Inter Tight", inherit',
            letterSpacing: -0.6,
          }}
        >
          {MONTHS[month]}
          <span className="mt-1.5">{Icon.chevDown('#7C7C82', 16)}</span>
        </button>

        <div className="flex items-center gap-2">
          {/* Summary button */}
          <button
            onClick={() => setShowSummary(true)}
            className="flex items-center justify-center border-none bg-transparent"
            style={{
              width: 38,
              height: 38,
              borderRadius: 12,
              background: '#FFFFFF',
              cursor: 'pointer',
            }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path d="M18 20V10M12 20V4M6 20v-6" stroke="#7C7C82" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>

          {/* Avatar / Settings */}
          <button
            onClick={() => setShowSettings(true)}
            className="flex items-center justify-center text-[14px] font-semibold border-none"
            style={{
              width: 38,
              height: 38,
              borderRadius: 12,
              background: '#FFFFFF',
              color: '#7C7C82',
              cursor: 'pointer',
            }}
          >
            К
          </button>
        </div>
      </div>

      {/* Month picker dropdown */}
      {showMonths && (
        <MonthPicker
          selectedMonth={month}
          onSelect={setMonth}
          isOpen={showMonths}
          onToggle={() => setShowMonths(false)}
        />
      )}

      {/* Mode toggle */}
      <div className="px-6 pb-4 pt-1">
        <SegmentedControl
          options={[
            { value: 'expense', label: 'траты' },
            { value: 'income', label: 'доходы' },
          ]}
          value={mode}
          onChange={handleModeChange}
        />
      </div>

      {/* Sticky filter chip */}
      {filterCategory && (
        <div className="shrink-0 flex items-center gap-2 px-6 py-2" style={{ background: '#FAF8F4' }}>
          <div
            className="flex items-center gap-2 rounded-full px-3.5 py-1.5 text-sm font-medium"
            style={{ background: '#1A1A1E', color: '#FAF8F4' }}
          >
            <span>{filterCategory.icon}</span>
            <span>{filterCategory.name}</span>
            <button
              onClick={() => setFilterCategoryId(null)}
              className="flex items-center border-none bg-transparent p-0"
              style={{ cursor: 'pointer' }}
            >
              {Icon.close('#FAF8F4', 12)}
            </button>
          </div>
        </div>
      )}

      {/* Scrollable content */}
      <div ref={scrollRef} className="flex-1 overflow-auto">
        {/* Donut chart */}
        <div className="flex justify-center px-6 pb-4 pt-2">
          <DonutChart total={total} segments={donutSegments} mode={mode} />
        </div>

        {/* Category list */}
        <div className="px-4 pt-2">
          <div
            className="flex items-center justify-between px-2 pb-2 text-[13px] font-medium uppercase"
            style={{ color: '#7C7C82', letterSpacing: 0.6 }}
          >
            <span>Категории</span>
            <span>{byCat.length}</span>
          </div>

          <div className="overflow-hidden rounded-card bg-card">
            {byCat.length === 0 && (
              <div className="px-5 py-10 text-center text-[14px] text-muted">
                {mode === 'expense' ? 'Пока нет трат за ' : 'Пока нет доходов за '}
                {MONTHS[month].toLowerCase()}
              </div>
            )}
            {byCat.map((c, i) => (
              <button
                key={c.id}
                onClick={() => handleCategoryTap(c.id)}
                className="flex w-full cursor-pointer items-center gap-3.5 bg-transparent px-4 py-3.5 text-left"
                style={{
                  border: 'none',
                  borderTop: i > 0 ? '1px solid #EDE9E1' : 'none',
                  fontFamily: 'inherit',
                  background: filterCategoryId === c.id ? '#D4F26A22' : 'transparent',
                }}
              >
                <CatDot color={c.color} size={36} radius={12} emoji={c.icon} />
                <div className="flex-1">
                  <div className="text-[16px] font-medium text-fg">{c.name}</div>
                  <div className="mt-0.5 text-[12px] text-muted">
                    {total > 0 ? Math.round((c.amount / total) * 100) : 0}%
                  </div>
                </div>
                <div
                  className="text-[16px] font-semibold text-fg"
                  style={{ fontVariantNumeric: 'tabular-nums' }}
                >
                  {fmt(c.amount)} ₽
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Transaction list */}
        <div className="pt-4 pb-2">
          <TransactionList
            transactions={filteredTx}
            categories={state.categories}
            onTap={(tx) => setEditingTx(tx)}
            onDelete={handleDelete}
            onEdit={(tx) => setEditingTx(tx)}
          />
        </div>
      </div>

      {/* Input bar */}
      <div className="shrink-0 px-4 pt-3" style={{ background: '#FAF8F4', paddingBottom: 'max(20px, env(safe-area-inset-bottom))' }}>
        <InputBar
          value={draft}
          onChange={setDraft}
          onSend={handleSend}
          onAttach={handleAttach}
          placeholder={inputPlaceholder}
        />
      </div>

      {/* Back to start */}
      <button
        onClick={onGoToStart}
        className="absolute right-[18px] top-[18px] z-[80] cursor-pointer border-none text-[11px]"
        style={{
          padding: '6px 12px',
          borderRadius: 12,
          background: 'rgba(0,0,0,0.06)',
          color: '#7C7C82',
          fontFamily: 'inherit',
          backdropFilter: 'blur(8px)',
        }}
      >
        ← старт
      </button>

      {/* Modals */}
      {editingTx && (
        <TransactionEditor
          transaction={editingTx}
          categories={state.categories}
          onSave={handleSaveTx}
          onDelete={(id) => {
            const tx = state.transactions.find((t) => t.id === id);
            if (tx) handleDelete(tx);
          }}
          onClose={() => setEditingTx(null)}
        />
      )}

      {showSummary && (
        <SummarySheet
          transactions={allMonthTx}
          categories={state.categories}
          monthName={MONTHS[month]}
          onClose={() => setShowSummary(false)}
        />
      )}

      {showSettings && <SettingsScreen onClose={() => setShowSettings(false)} />}
    </div>
  );
}
