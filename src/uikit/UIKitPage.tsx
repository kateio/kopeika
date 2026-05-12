import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Icon,
  CatDot,
  DonutChart,
  SegmentedControl,
  MonthPicker,
  CategoryList,
  InputBar,
  Toast,
} from '@/components';
import { categories, transactions } from '@/data/mocks';

/* ------------------------------------------------------------------ */
/*  Данные для страницы                                                */
/* ------------------------------------------------------------------ */

const NAV_SECTIONS = [
  { id: 'colors', label: 'Цвета' },
  { id: 'typography', label: 'Типографика' },
  { id: 'icons', label: 'Иконки' },
  { id: 'catdot', label: 'CatDot' },
  { id: 'segmented-control', label: 'SegmentedControl' },
  { id: 'month-picker', label: 'MonthPicker' },
  { id: 'input-bar', label: 'InputBar' },
  { id: 'toast', label: 'Toast' },
  { id: 'category-list', label: 'CategoryList' },
  { id: 'donut-chart', label: 'DonutChart' },
  { id: 'category-modal', label: 'CategoryModal' },
] as const;

const BASE_COLORS = [
  { name: 'bg', hex: '#FAF8F4' },
  { name: 'fg', hex: '#1A1A1E' },
  { name: 'card', hex: '#FFFFFF' },
  { name: 'muted', hex: '#7C7C82' },
  { name: 'border', hex: '#EDE9E1' },
];

const ACCENT_COLORS = [
  { name: 'accent', hex: '#D4F26A' },
  { name: 'coral', hex: '#FF8E72' },
  { name: 'lavender', hex: '#C7B8FF' },
  { name: 'mint', hex: '#9EE5C5' },
  { name: 'yellow', hex: '#FFD66B' },
  { name: 'pink', hex: '#FFB4D1' },
  { name: 'blue', hex: '#A0D8FF' },
  { name: 'peach', hex: '#FFCBA0' },
];

const TYPOGRAPHY_SAMPLES = [
  { size: 32, weight: 700, tracking: -0.8, text: 'Копейка', label: '32px / 700 / -0.8 tracking — заголовок' },
  { size: 28, weight: 700, tracking: -0.6, text: 'Апрель', label: '28px / 700 / -0.6 tracking — месяц' },
  { size: 30, weight: 700, tracking: -0.8, text: '55 590 ₽', label: '30px / 700 / -0.8 tracking — сумма в диаграмме' },
  { size: 17, weight: 600, tracking: 0, text: 'траты', label: '17px / 600 — навигация' },
  { size: 16, weight: 500, tracking: 0, text: 'еда', label: '16px / 500 — категория' },
  { size: 15, weight: 400, tracking: 0, text: 'Самокат, рынок', label: '15px / 400 — описание' },
  { size: 13, weight: 500, tracking: 0.6, text: 'КАТЕГОРИИ', label: '13px / 500 / uppercase / 0.6 tracking — метка', uppercase: true },
  { size: 12, weight: 400, tracking: 0, text: '33%', label: '12px / 400 — процент' },
  { size: 11, weight: 600, tracking: 1, text: 'TWEAKS', label: '11px / 600 / uppercase / 1 tracking — мелкие метки', uppercase: true },
];

const ICON_NAMES = ['plus', 'paperclip', 'send', 'close', 'chevDown', 'chevRight', 'check'] as const;

/* ------------------------------------------------------------------ */
/*  Вспомогательные компоненты                                         */
/* ------------------------------------------------------------------ */

function Section({ id, title, children }: { id: string; title: string; children: React.ReactNode }) {
  return (
    <section id={id} className="scroll-mt-28 rounded-[20px] bg-white p-6">
      <h2 className="mb-5 text-xl font-bold text-fg" style={{ fontFamily: '"Inter Tight", inherit' }}>
        {title}
      </h2>
      {children}
    </section>
  );
}

function ColorChip({ name, hex }: { name: string; hex: string }) {
  const isDark = hex === '#1A1A1E';
  return (
    <div className="flex items-center gap-3">
      <div
        className="shrink-0 rounded-lg"
        style={{
          width: 48,
          height: 48,
          background: hex,
          border: isDark ? 'none' : '1px solid #EDE9E1',
        }}
      />
      <div>
        <div className="text-sm font-medium text-fg">{name}</div>
        <div className="text-xs text-muted">{hex}</div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Подготовка данных для компонентов                                   */
/* ------------------------------------------------------------------ */

const expenseCategories = categories.filter((c) => c.type === 'expense');
const expenseTransactions = transactions.filter((t) => t.type === 'expense' && t.date.startsWith('2026-04'));

function buildCategoryListItems() {
  const totalExpenses = expenseTransactions.reduce((s, t) => s + (t.currency === 'RUB' ? t.amount : t.amount * 90), 0);
  const grouped = new Map<string, number>();
  for (const t of expenseTransactions) {
    const amount = t.currency === 'RUB' ? t.amount : t.amount * 90;
    grouped.set(t.categoryId, (grouped.get(t.categoryId) ?? 0) + amount);
  }
  return Array.from(grouped.entries())
    .map(([catId, amount]) => {
      const cat = categories.find((c) => c.id === catId);
      return {
        id: catId,
        name: cat?.name ?? catId,
        color: cat?.color ?? '#CCC',
        amount,
        percentage: totalExpenses > 0 ? Math.round((amount / totalExpenses) * 100) : 0,
      };
    })
    .sort((a, b) => b.amount - a.amount)
    .slice(0, 5);
}

function buildDonutSegments() {
  const items = buildCategoryListItems();
  return items.map((it) => ({ name: it.name, amount: it.amount, color: it.color }));
}

function buildModalTransactions(categoryId: string) {
  return expenseTransactions
    .filter((t) => t.categoryId === categoryId)
    .slice(0, 4)
    .map((t) => ({
      id: t.id,
      note: t.comment,
      date: new Intl.DateTimeFormat('ru-RU', { day: 'numeric', month: 'short' }).format(
        new Date(t.date + 'T00:00:00'),
      ),
      amount: t.amount,
      currency: t.currency,
    }));
}

/* ------------------------------------------------------------------ */
/*  Страница UI Kit                                                    */
/* ------------------------------------------------------------------ */

export function UIKitPage() {
  const navigate = useNavigate();

  // SegmentedControl state
  const [segType, setSegType] = useState('expense');
  const [segChart, setSegChart] = useState('ring');

  // MonthPicker state
  const [monthPickerOpen, setMonthPickerOpen] = useState(true);
  const [selectedMonth, setSelectedMonth] = useState(3); // Апрель (0-based)

  // InputBar state
  const [inputEmpty, setInputEmpty] = useState('');
  const [inputFilled, setInputFilled] = useState('еда 500');

  // Данные
  const categoryListItems = buildCategoryListItems();
  const donutSegments = buildDonutSegments();
  const donutTotal = donutSegments.reduce((s, seg) => s + seg.amount, 0);

  const modalCategory = expenseCategories[0]; // Еда
  const modalTransactions = buildModalTransactions(modalCategory.id);
  const modalCategoryAmount = categoryListItems.find((c) => c.id === modalCategory.id)?.amount ?? 0;

  return (
    <div className="min-h-screen bg-bg" style={{ fontFamily: '"Inter Tight", sans-serif' }}>
      {/* Шапка */}
      <header className="sticky top-0 z-50 bg-bg/95 backdrop-blur-sm">
        <div className="flex items-center px-5 pb-2 pt-4">
          <button
            onClick={() => navigate('/')}
            className="mr-3 flex items-center gap-1 border-none bg-transparent text-sm font-medium text-fg"
            style={{ cursor: 'pointer' }}
          >
            {Icon.chevRight('#1A1A1E', 14)}
            <span className="rotate-180 inline-block" style={{ transform: 'scaleX(-1)', marginLeft: -2 }}>
              {''}
            </span>
            Назад
          </button>
          <h1
            className="flex-1 text-center text-lg font-bold text-fg"
            style={{ fontFamily: '"Inter Tight", inherit' }}
          >
            UI Kit
          </h1>
          <div className="w-16" /> {/* Компенсация кнопки */}
        </div>

        {/* Навигация по якорям */}
        <nav className="flex gap-2 overflow-x-auto px-5 pb-3 pt-1" style={{ scrollbarWidth: 'none' }}>
          {NAV_SECTIONS.map((s) => (
            <a
              key={s.id}
              href={`#${s.id}`}
              className="shrink-0 rounded-full bg-card px-3.5 py-1.5 text-xs font-medium text-fg no-underline transition-colors hover:bg-border"
              style={{ border: '1px solid #EDE9E1' }}
            >
              {s.label}
            </a>
          ))}
        </nav>
      </header>

      {/* Секции */}
      <main className="flex flex-col gap-5 px-4 pb-20 pt-2">
        {/* 1. Цветовая палитра */}
        <Section id="colors" title="Цветовая палитра">
          <div className="mb-4">
            <div
              className="mb-3 text-[11px] font-semibold uppercase tracking-[1px] text-muted"
            >
              Основные
            </div>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
              {BASE_COLORS.map((c) => (
                <ColorChip key={c.name} name={c.name} hex={c.hex} />
              ))}
            </div>
          </div>
          <div>
            <div
              className="mb-3 text-[11px] font-semibold uppercase tracking-[1px] text-muted"
            >
              Акценты
            </div>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
              {ACCENT_COLORS.map((c) => (
                <ColorChip key={c.name} name={c.name} hex={c.hex} />
              ))}
            </div>
          </div>
        </Section>

        {/* 2. Типографика */}
        <Section id="typography" title="Типографика">
          <div className="flex flex-col gap-5">
            {TYPOGRAPHY_SAMPLES.map((t) => (
              <div key={t.label} className="border-b border-border pb-4 last:border-none last:pb-0">
                <div
                  className="text-fg"
                  style={{
                    fontSize: t.size,
                    fontWeight: t.weight,
                    letterSpacing: t.tracking,
                    textTransform: t.uppercase ? 'uppercase' : 'none',
                    fontFamily: '"Inter Tight", sans-serif',
                  }}
                >
                  {t.text}
                </div>
                <div className="mt-1.5 text-xs text-muted">{t.label}</div>
              </div>
            ))}
          </div>
        </Section>

        {/* 3. Иконки */}
        <Section id="icons" title="Иконки">
          <div className="grid grid-cols-4 gap-4 sm:grid-cols-7">
            {ICON_NAMES.map((name) => (
              <div key={name} className="flex flex-col items-center gap-2">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-bg">
                  {Icon[name]('#1A1A1E', 24)}
                </div>
                <div className="text-[11px] text-muted">{name}</div>
              </div>
            ))}
          </div>
        </Section>

        {/* 4. CatDot */}
        <Section id="catdot" title="CatDot">
          <div className="flex flex-col gap-5">
            {([24, 36, 44] as const).map((size) => (
              <div key={size}>
                <div className="mb-2 text-xs text-muted">Размер {size}px</div>
                <div className="flex gap-3">
                  {expenseCategories.slice(0, 8).map((cat) => (
                    <CatDot
                      key={`${cat.id}-${size}`}
                      color={cat.color}
                      size={size}
                      radius={size <= 24 ? 8 : size <= 36 ? 12 : 14}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </Section>

        {/* 5. SegmentedControl */}
        <Section id="segmented-control" title="SegmentedControl">
          <div className="flex flex-col gap-5">
            <div>
              <div className="mb-2 text-xs text-muted">Траты / Доходы</div>
              <SegmentedControl
                options={[
                  { value: 'expense', label: 'траты' },
                  { value: 'income', label: 'доходы' },
                ]}
                value={segType}
                onChange={setSegType}
                className="max-w-[300px]"
              />
            </div>
            <div>
              <div className="mb-2 text-xs text-muted">Стиль диаграммы</div>
              <SegmentedControl
                options={[
                  { value: 'ring', label: 'кольцо' },
                  { value: 'pie', label: 'пирог' },
                  { value: 'thin', label: 'тонко' },
                ]}
                value={segChart}
                onChange={setSegChart}
                className="max-w-[300px]"
              />
            </div>
          </div>
        </Section>

        {/* 6. MonthPicker */}
        <Section id="month-picker" title="MonthPicker">
          <div className="flex flex-col gap-5">
            <div>
              <div className="mb-2 text-xs text-muted">Закрытый (показывает текущий месяц)</div>
              <div className="flex items-center gap-2 rounded-xl bg-bg px-4 py-3">
                <span
                  className="text-[28px] font-bold text-fg"
                  style={{ fontFamily: '"Inter Tight", inherit', letterSpacing: -0.6 }}
                >
                  Апрель
                </span>
                <button
                  className="flex items-center border-none bg-transparent p-1"
                  style={{ cursor: 'pointer' }}
                  onClick={() => {}}
                >
                  {Icon.chevDown('#7C7C82', 14)}
                </button>
              </div>
            </div>
            <div>
              <div className="mb-2 text-xs text-muted">Открытый (дропдаун виден)</div>
              <div className="relative rounded-xl bg-bg px-4 py-3" style={{ minHeight: 340 }}>
                <div className="flex items-center gap-2">
                  <span
                    className="text-[28px] font-bold text-fg"
                    style={{ fontFamily: '"Inter Tight", inherit', letterSpacing: -0.6 }}
                  >
                    Апрель
                  </span>
                  <button
                    className="flex items-center border-none bg-transparent p-1"
                    style={{ cursor: 'pointer' }}
                    onClick={() => setMonthPickerOpen(!monthPickerOpen)}
                  >
                    {Icon.chevDown('#7C7C82', 14)}
                  </button>
                </div>
                <MonthPicker
                  selectedMonth={selectedMonth}
                  onSelect={setSelectedMonth}
                  isOpen={monthPickerOpen}
                  onToggle={() => setMonthPickerOpen(!monthPickerOpen)}
                />
              </div>
            </div>
          </div>
        </Section>

        {/* 7. InputBar */}
        <Section id="input-bar" title="InputBar">
          <div className="flex flex-col gap-5">
            <div>
              <div className="mb-2 text-xs text-muted">Пустой (placeholder видно)</div>
              <InputBar
                value={inputEmpty}
                onChange={setInputEmpty}
                onSend={() => {}}
                onAttach={() => {}}
              />
            </div>
            <div>
              <div className="mb-2 text-xs text-muted">С текстом &quot;еда 500&quot;</div>
              <InputBar
                value={inputFilled}
                onChange={setInputFilled}
                onSend={() => {}}
                onAttach={() => {}}
              />
            </div>
          </div>
        </Section>

        {/* 8. Toast */}
        <Section id="toast" title="Toast">
          <div className="mb-2 text-xs text-muted">Видимый тост</div>
          <div className="flex justify-center rounded-xl bg-bg p-6">
            <Toast message="Трата добавлена: еда 500 ₽" icon="✅" visible />
          </div>
        </Section>

        {/* 9. CategoryList */}
        <Section id="category-list" title="CategoryList">
          <div className="flex flex-col gap-5">
            <div>
              <div className="mb-2 text-xs text-muted">С данными (5 категорий)</div>
              <CategoryList items={categoryListItems} onSelect={() => {}} />
            </div>
            <div>
              <div className="mb-2 text-xs text-muted">Пустой список</div>
              <CategoryList items={[]} onSelect={() => {}} emptyText="Пока нет трат" />
            </div>
          </div>
        </Section>

        {/* 10. DonutChart */}
        <Section id="donut-chart" title="DonutChart">
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col items-center gap-2">
              <div className="text-xs text-muted">ring</div>
              <DonutChart total={donutTotal} segments={donutSegments} chartStyle="ring" />
            </div>
            <div className="flex flex-col items-center gap-2">
              <div className="text-xs text-muted">pie</div>
              <DonutChart total={donutTotal} segments={donutSegments} chartStyle="pie" />
            </div>
            <div className="flex flex-col items-center gap-2">
              <div className="text-xs text-muted">thin</div>
              <DonutChart total={donutTotal} segments={donutSegments} chartStyle="thin" />
            </div>
            <div className="flex flex-col items-center gap-2">
              <div className="text-xs text-muted">пустой</div>
              <DonutChart total={0} segments={[]} />
            </div>
          </div>
        </Section>

        {/* 11. CategoryModal */}
        <Section id="category-modal" title="CategoryModal">
          <div className="mb-2 text-xs text-muted">Статически видимая модалка (без overlay)</div>
          <div className="overflow-hidden rounded-[20px] bg-bg" style={{ minHeight: 360 }}>
            <div className="flex w-full flex-col rounded-t-[20px] bg-bg" style={{ padding: '12px 0 30px' }}>
              {/* Grabber */}
              <div
                className="mx-auto mb-4 rounded-full bg-border"
                style={{ width: 40, height: 5 }}
              />
              {/* Header */}
              <div className="flex items-center gap-3 px-6 pb-4">
                <CatDot color={modalCategory.color} size={44} radius={14} />
                <div className="flex-1">
                  <div
                    className="text-xl font-bold text-fg"
                    style={{ fontFamily: '"Inter Tight", inherit' }}
                  >
                    {modalCategory.name}
                  </div>
                  <div className="mt-0.5 text-[13px] text-muted">
                    {modalTransactions.length} операций
                  </div>
                </div>
                <button
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
                {new Intl.NumberFormat('ru-RU').format(Math.round(modalCategoryAmount))} ₽
              </div>
              {/* Transaction list */}
              <div className="px-4">
                {modalTransactions.map((t) => (
                  <div
                    key={t.id}
                    className="flex items-center justify-between border-b border-border px-3 py-3.5"
                  >
                    <div>
                      <div className="text-[15px] text-fg">{t.note}</div>
                      <div className="mt-0.5 text-xs text-muted">{t.date}</div>
                    </div>
                    <div
                      className="text-[15px] font-semibold text-fg"
                      style={{ fontVariantNumeric: 'tabular-nums' }}
                    >
                      {new Intl.NumberFormat('ru-RU').format(Math.round(t.amount))} ₽
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Section>
      </main>
    </div>
  );
}
