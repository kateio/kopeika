import { useState, useMemo, useRef } from 'react';

// ── Theme constants ─────────────────────────────────────────
const BG = '#FAF8F4';
const FG = '#1A1A1E';
const ACCENT = '#D4F26A';
const MUTED = '#7C7C82';
const CARD = '#FFFFFF';
const BORDER = '#EDE9E1';
const RADIUS = 16;

// ── Formatter ───────────────────────────────────────────────
const fmt = (n: number): string =>
  new Intl.NumberFormat('ru-RU').format(Math.round(n));

// ── Months ──────────────────────────────────────────────────
const MONTHS = [
  'Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь',
  'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь',
];

// ── Inline Icon helpers ─────────────────────────────────────
const IconChevDown = ({ color = 'currentColor', size = 16 }: { color?: string; size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <path d="M6 9l6 6 6-6" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const IconPaperclip = ({ color = 'currentColor', size = 20 }: { color?: string; size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <path
      d="M21 11.5l-8.5 8.5a5.5 5.5 0 01-7.78-7.78L13.5 4a3.85 3.85 0 015.45 5.45l-8.5 8.5a2.2 2.2 0 11-3.11-3.11L14.5 7.5"
      stroke={color} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"
    />
  </svg>
);

const IconSend = ({ color = 'currentColor', size = 18 }: { color?: string; size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <path d="M5 12l14-7-5 16-3-7-6-2z" stroke={color} strokeWidth="1.6" strokeLinejoin="round" fill={color} fillOpacity="0.15" />
  </svg>
);

const IconClose = ({ color = 'currentColor', size = 16 }: { color?: string; size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <path d="M6 6l12 12M18 6L6 18" stroke={color} strokeWidth="1.8" strokeLinecap="round" />
  </svg>
);

// ── Inline CatDot ───────────────────────────────────────────
function CatDot({ color, size = 36, radius = 12 }: { color: string; size?: number; radius?: number }) {
  return (
    <div
      className="shrink-0"
      style={{ width: size, height: size, borderRadius: radius, background: color }}
    />
  );
}

// ── Local data types ────────────────────────────────────────
interface LocalCategory {
  id: string;
  name: string;
  on: boolean;
  color: string;
}

interface LocalTransaction {
  id: string;
  cat: string;
  amount: number;
  type: 'expense' | 'income';
  month: number;
  note: string;
  date: string;
}

interface CatWithAmount extends LocalCategory {
  amount: number;
}

// ── Seed data (mirrors app.jsx) ─────────────────────────────
const DEFAULT_CATS: LocalCategory[] = [
  { id: 'food',   name: 'еда',            on: true,  color: '#D4F26A' },
  { id: 'transp', name: 'транспорт',      on: true,  color: '#FFB4D1' },
  { id: 'care',   name: 'уход за собой',  on: true,  color: '#9EE5C5' },
  { id: 'subs',   name: 'подписки',       on: true,  color: '#C7B8FF' },
  { id: 'unexp',  name: 'непредвиденные', on: true,  color: '#FF8E72' },
  { id: 'home',   name: 'дом',            on: false, color: '#FFD66B' },
  { id: 'fun',    name: 'развлечения',    on: false, color: '#A0D8FF' },
  { id: 'health', name: 'здоровье',       on: false, color: '#FFCBA0' },
];

const INCOME_CATS: LocalCategory[] = [
  { id: 'salary',   name: 'зарплата', on: true, color: '#9EE5C5' },
  { id: 'freelance', name: 'фриланс', on: true, color: '#D4F26A' },
];

const ALL_CATS: LocalCategory[] = [
  ...DEFAULT_CATS,
  ...INCOME_CATS,
];

const SEED_TX: LocalTransaction[] = [
  // April expenses
  { id: 't1',  cat: 'food',   amount: 18400, type: 'expense', month: 3, note: 'Самокат, рынок',  date: '2026-04-12' },
  { id: 't2',  cat: 'food',   amount: 4200,  type: 'expense', month: 3, note: 'Кофейня',         date: '2026-04-15' },
  { id: 't3',  cat: 'transp', amount: 9800,  type: 'expense', month: 3, note: 'Метро + такси',   date: '2026-04-08' },
  { id: 't4',  cat: 'transp', amount: 5200,  type: 'expense', month: 3, note: 'Каршеринг',       date: '2026-04-16' },
  { id: 't5',  cat: 'care',   amount: 7500,  type: 'expense', month: 3, note: 'Парикмахер',      date: '2026-04-05' },
  { id: 't6',  cat: 'care',   amount: 2800,  type: 'expense', month: 3, note: 'Косметика',       date: '2026-04-14' },
  { id: 't7',  cat: 'subs',   amount: 1290,  type: 'expense', month: 3, note: 'Музыка + кино',   date: '2026-04-01' },
  { id: 't8',  cat: 'unexp',  amount: 6400,  type: 'expense', month: 3, note: 'Подарок',         date: '2026-04-11' },
  // April income
  { id: 'in1', cat: 'salary',   amount: 165000, type: 'income', month: 3, note: 'Основная работа',  date: '2026-04-05' },
  { id: 'in2', cat: 'freelance', amount: 42000,  type: 'income', month: 3, note: 'Дизайн-проект',   date: '2026-04-18' },
  // March expenses
  { id: 't9',  cat: 'food',   amount: 14000, type: 'expense', month: 2, note: '',                date: '2026-03-10' },
  { id: 't10', cat: 'transp', amount: 8200,  type: 'expense', month: 2, note: '',                date: '2026-03-15' },
  { id: 't11', cat: 'subs',   amount: 1290,  type: 'expense', month: 2, note: '',                date: '2026-03-01' },
  // March income
  { id: 'in3', cat: 'salary', amount: 165000, type: 'income', month: 2, note: '',                date: '2026-03-05' },
];

// ── hexToHue for donut palette ──────────────────────────────
function hexToHue(hex: string): number {
  if (!hex || hex[0] !== '#') return 90;
  const h = hex.slice(1);
  const r = parseInt(h.slice(0, 2), 16) / 255;
  const g = parseInt(h.slice(2, 4), 16) / 255;
  const b = parseInt(h.slice(4, 6), 16) / 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const d = max - min;
  let hue: number;
  if (d === 0) {
    return 0;
  } else if (max === r) {
    hue = ((g - b) / d) % 6;
  } else if (max === g) {
    hue = (b - r) / d + 2;
  } else {
    hue = (r - g) / d + 4;
  }
  hue = Math.round(hue * 60);
  if (hue < 0) hue += 360;
  return hue;
}

// ── Donut Chart (inline, mirrors screens.jsx) ───────────────
interface DonutChartProps {
  total: number;
  segments: CatWithAmount[];
  mode: 'expense' | 'income';
}

function DonutChart({ total, segments, mode }: DonutChartProps) {
  const size = 240;
  const cx = size / 2;
  const cy = size / 2;
  const r = 92;
  const stroke = 18;
  const C = 2 * Math.PI * r;

  const palette = useMemo(() => {
    const baseHue = hexToHue(ACCENT);
    return segments.map((_, i) => {
      const hue = (baseHue + i * 37) % 360;
      return `oklch(0.75 0.16 ${hue})`;
    });
  }, [segments]);

  const arcs = useMemo(() => {
    const result: Array<{ color: string; dasharray: string; offset: number }> = [];
    const prefixSums = segments.reduce<number[]>((sums, s) => {
      sums.push((sums[sums.length - 1] ?? 0) + s.amount);
      return sums;
    }, []);
    segments.forEach((s, i) => {
      const acc = i === 0 ? 0 : prefixSums[i - 1];
      const frac = s.amount / total;
      const len = C * frac;
      const dashOffset = -C * (acc / total);
      result.push({
        color: palette[i],
        dasharray: `${Math.max(0, len - 3)} ${C}`,
        offset: dashOffset,
      });
    });
    return result;
  }, [segments, total, palette, C]);

  if (segments.length === 0) {
    return (
      <div
        className="flex flex-col items-center justify-center"
        style={{
          width: size,
          height: size,
          borderRadius: '50%',
          border: `${stroke}px solid ${CARD}`,
        }}
      >
        <div className="text-[13px]" style={{ color: MUTED }}>пусто</div>
      </div>
    );
  }

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
        {arcs.map((a, i) => (
          <circle
            key={i}
            cx={cx}
            cy={cy}
            r={r}
            fill="none"
            stroke={a.color}
            strokeWidth={stroke}
            strokeDasharray={a.dasharray}
            strokeDashoffset={a.offset}
            strokeLinecap="butt"
          />
        ))}
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
        <div
          className="text-[12px] font-medium uppercase"
          style={{ color: MUTED, letterSpacing: 0.6 }}
        >
          всего {mode === 'expense' ? 'трат' : 'дохода'}
        </div>
        <div
          className="mt-1 text-[30px] font-bold tabular-nums"
          style={{
            color: FG,
            fontFamily: '"Inter Tight", inherit',
            letterSpacing: -0.8,
          }}
        >
          {fmt(total)} ₽
        </div>
      </div>
    </div>
  );
}

// ── Category Detail Modal ───────────────────────────────────
interface CategoryModalProps {
  cat: CatWithAmount;
  transactions: LocalTransaction[];
  month: number;
  onClose: () => void;
}

function CategoryModal({ cat, transactions, month, onClose }: CategoryModalProps) {
  const items = transactions.filter((t) => t.cat === cat.id && t.month === month);

  return (
    <div
      onClick={onClose}
      className="absolute inset-0 z-[100] flex items-end animate-[fadeIn_0.2s_ease]"
      style={{ background: 'rgba(0,0,0,0.4)' }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="flex w-full flex-col animate-[slideUp_0.25s_ease]"
        style={{
          background: BG,
          borderTopLeftRadius: 28,
          borderTopRightRadius: 28,
          padding: '12px 0 30px',
          maxHeight: '78%',
        }}
      >
        {/* grabber */}
        <div
          className="mx-auto mb-4"
          style={{ width: 40, height: 5, borderRadius: 5, background: BORDER }}
        />

        <div className="flex items-center gap-3 px-6 pb-4">
          <CatDot color={cat.color} size={44} radius={14} />
          <div className="flex-1">
            <div
              className="text-[20px] font-bold"
              style={{ color: FG, fontFamily: '"Inter Tight", inherit' }}
            >
              {cat.name}
            </div>
            <div className="mt-0.5 text-[13px]" style={{ color: MUTED }}>
              {items.length} операций
            </div>
          </div>
          <button
            onClick={onClose}
            className="flex h-8 w-8 cursor-pointer items-center justify-center border-none"
            style={{ borderRadius: 16, background: CARD, color: MUTED }}
          >
            <IconClose color={MUTED} size={16} />
          </button>
        </div>

        <div
          className="px-6 pb-4 pt-2 text-[28px] font-bold tabular-nums"
          style={{ color: FG, fontFamily: '"Inter Tight", inherit', letterSpacing: -0.6 }}
        >
          {fmt(cat.amount)} ₽
        </div>

        <div className="flex-1 overflow-auto px-4">
          {items.map((t) => (
            <div
              key={t.id}
              className="flex items-center justify-between px-3 py-3.5"
              style={{ borderBottom: `1px solid ${BORDER}` }}
            >
              <div>
                <div className="text-[15px]" style={{ color: FG }}>{t.note || cat.name}</div>
                <div className="mt-0.5 text-[12px]" style={{ color: MUTED }}>{t.date}</div>
              </div>
              <div className="text-[15px] font-semibold tabular-nums" style={{ color: FG }}>
                {fmt(t.amount)} ₽
              </div>
            </div>
          ))}
          {items.length === 0 && (
            <div className="p-8 text-center text-[14px]" style={{ color: MUTED }}>
              Пока нет операций
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Props ───────────────────────────────────────────────────
interface MainScreenProps {
  onGoToStart: () => void;
}

// ── Main Screen ─────────────────────────────────────────────
export function MainScreen({ onGoToStart }: MainScreenProps) {
  const [mode, setMode] = useState<'expense' | 'income'>('expense');
  const [month, setMonth] = useState(3); // April (0-indexed)
  const [showMonths, setShowMonths] = useState(false);
  const [draft, setDraft] = useState('');
  const [attachToast, setAttachToast] = useState(false);
  const [submitFlash, setSubmitFlash] = useState(false);
  const [transactions, setTransactions] = useState<LocalTransaction[]>(SEED_TX);
  const [openCat, setOpenCat] = useState<CatWithAmount | null>(null);

  const categories = ALL_CATS;
  const inputRef = useRef<HTMLInputElement>(null);

  // Filter for current month + mode
  const monthTx = useMemo(
    () =>
      transactions.filter(
        (t) => t.month === month && t.type === mode,
      ),
    [transactions, month, mode],
  );

  // Aggregate by category
  const byCat = useMemo(() => {
    const totals: Record<string, number> = {};
    monthTx.forEach((t) => {
      totals[t.cat] = (totals[t.cat] || 0) + t.amount;
    });
    return categories
      .filter((c) => c.on && totals[c.id])
      .map((c) => ({ ...c, amount: totals[c.id] }))
      .sort((a, b) => b.amount - a.amount);
  }, [monthTx, categories]);

  const total = byCat.reduce((s, c) => s + c.amount, 0);

  const handleSend = () => {
    if (!draft.trim()) return;
    const text = draft.toLowerCase();
    const numMatch = text.match(/\d+/);
    const num = parseInt(numMatch?.[0] || '0', 10);
    const matched = categories.find(
      (c) => c.on && text.includes(c.name.toLowerCase().split(' ')[0]),
    );
    const cat = matched?.id || categories.find((c) => c.on)?.id;
    if (cat && num > 0) {
      setTransactions((ts) => [
        ...ts,
        {
          id: 't_' + Date.now(),
          cat,
          amount: num,
          type: mode,
          month,
          note: draft,
          date: new Date().toISOString().slice(0, 10),
        },
      ]);
    }
    setDraft('');
    setSubmitFlash(true);
    setTimeout(() => setSubmitFlash(false), 400);
  };

  const handleAttach = () => {
    setAttachToast(true);
    setTimeout(() => setAttachToast(false), 2200);
  };

  return (
    <div
      className="relative flex h-full flex-col"
      style={{ background: BG, color: FG }}
    >
      {/* ── Header ────────────────────────────────────── */}
      <div className="flex items-center justify-between px-6" style={{ paddingTop: 60, paddingBottom: 12 }}>
        <button
          onClick={() => setShowMonths((s) => !s)}
          className="flex cursor-pointer items-center gap-1.5 border-none bg-transparent p-0 text-[28px] font-bold"
          style={{
            color: FG,
            fontFamily: '"Inter Tight", inherit',
            letterSpacing: -0.6,
          }}
        >
          {MONTHS[month]}
          <span className="mt-1.5">
            <IconChevDown color={MUTED} size={16} />
          </span>
        </button>

        <div
          className="flex items-center justify-center text-[14px] font-semibold"
          style={{
            width: 38,
            height: 38,
            borderRadius: 12,
            background: CARD,
            color: MUTED,
          }}
        >
          К
        </div>
      </div>

      {/* ── Month picker dropdown ─────────────────────── */}
      {showMonths && (
        <div
          className="absolute z-30 overflow-auto"
          style={{
            top: 110,
            left: 24,
            background: CARD,
            borderRadius: RADIUS + 4,
            boxShadow: '0 12px 40px rgba(0,0,0,0.18)',
            padding: 8,
            width: 180,
            maxHeight: 280,
          }}
        >
          {MONTHS.map((m, i) => (
            <button
              key={m}
              onClick={() => {
                setMonth(i);
                setShowMonths(false);
              }}
              className="w-full cursor-pointer border-none text-left text-[15px]"
              style={{
                padding: '10px 12px',
                borderRadius: RADIUS - 4,
                background: i === month ? ACCENT + '33' : 'transparent',
                color: FG,
                fontWeight: i === month ? 600 : 400,
                fontFamily: 'inherit',
              }}
            >
              {m}
            </button>
          ))}
        </div>
      )}

      {/* ── Mode toggle (траты / доходы) ──────────────── */}
      <div className="px-6 pb-4 pt-1">
        <div
          className="flex gap-1 p-1"
          style={{ background: CARD, borderRadius: RADIUS }}
        >
          {([['expense', 'траты'], ['income', 'доходы']] as const).map(([k, label]) => (
            <button
              key={k}
              onClick={() => setMode(k)}
              className="flex-1 cursor-pointer border-none text-[14px] font-semibold transition-all duration-150"
              style={{
                padding: 10,
                borderRadius: RADIUS - 4,
                background: mode === k ? BG : 'transparent',
                color: FG,
                fontFamily: 'inherit',
                boxShadow: mode === k ? '0 2px 8px rgba(0,0,0,0.06)' : 'none',
              }}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* ── Donut chart ───────────────────────────────── */}
      <div className="flex justify-center px-6 pb-4 pt-2">
        <DonutChart total={total} segments={byCat} mode={mode} />
      </div>

      {/* ── Category list ─────────────────────────────── */}
      <div className="flex-1 overflow-auto px-4 pt-2">
        <div
          className="flex items-center justify-between px-2 pb-2 text-[13px] font-medium uppercase"
          style={{ color: MUTED, letterSpacing: 0.6 }}
        >
          <span>Категории</span>
          <span>{byCat.length}</span>
        </div>

        <div
          className="overflow-hidden"
          style={{ background: CARD, borderRadius: RADIUS + 4 }}
        >
          {byCat.length === 0 && (
            <div className="px-5 py-10 text-center text-[14px]" style={{ color: MUTED }}>
              {mode === 'expense' ? 'Пока нет трат за ' : 'Пока нет доходов за '}
              {MONTHS[month].toLowerCase()}
            </div>
          )}
          {byCat.map((c, i) => (
            <button
              key={c.id}
              onClick={() => setOpenCat(c)}
              className="flex w-full cursor-pointer items-center gap-3.5 border-none bg-transparent px-4 py-3.5 text-left"
              style={{
                borderTop: i > 0 ? `1px solid ${BORDER}` : 'none',
                fontFamily: 'inherit',
              }}
            >
              <CatDot color={c.color} size={36} radius={RADIUS - 4} />
              <div className="flex-1">
                <div className="text-[16px] font-medium" style={{ color: FG }}>{c.name}</div>
                <div className="mt-0.5 text-[12px]" style={{ color: MUTED }}>
                  {total > 0 ? Math.round((c.amount / total) * 100) : 0}%
                </div>
              </div>
              <div
                className="text-[16px] font-semibold tabular-nums"
                style={{ color: FG }}
              >
                {fmt(c.amount)} ₽
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* ── Input bar ─────────────────────────────────── */}
      <div className="relative px-4 pb-5 pt-3">
        {attachToast && (
          <div
            className="absolute left-4 right-4 flex items-center gap-2.5 animate-[slideUp_0.3s_ease]"
            style={{
              bottom: 84,
              background: FG,
              color: BG,
              padding: '12px 16px',
              borderRadius: RADIUS,
              fontSize: 14,
            }}
          >
            <span className="text-[18px]">📎</span>
            Прикрепи выписку из банка — я разнесу всё по категориям
          </div>
        )}

        <div
          className="flex items-center gap-2 transition-[border] duration-200"
          style={{
            background: CARD,
            borderRadius: RADIUS + 8,
            padding: '8px 8px 8px 14px',
            border: submitFlash ? `1.5px solid ${ACCENT}` : `1px solid ${BORDER}`,
          }}
        >
          <button
            onClick={handleAttach}
            className="flex cursor-pointer border-none bg-transparent p-1.5"
            style={{ color: MUTED }}
          >
            <IconPaperclip color={MUTED} size={20} />
          </button>

          <input
            ref={inputRef}
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder={mode === 'expense' ? 'расскажи что потратил...' : 'расскажи про доход...'}
            className="flex-1 border-none bg-transparent py-2 text-[15px] outline-none"
            style={{ color: FG, fontFamily: 'inherit' }}
          />

          <button
            onClick={handleSend}
            className="flex items-center justify-center border-none"
            style={{
              background: draft.trim() ? ACCENT : BORDER,
              cursor: draft.trim() ? 'pointer' : 'default',
              width: 36,
              height: 36,
              borderRadius: 12,
              transition: 'background 0.15s',
            }}
          >
            <IconSend color={FG} size={18} />
          </button>
        </div>
      </div>

      {/* ── Back to start (floating) ──────────────────── */}
      <button
        onClick={onGoToStart}
        className="absolute right-[18px] top-[18px] z-[80] cursor-pointer border-none text-[11px]"
        style={{
          padding: '6px 12px',
          borderRadius: 12,
          background: 'rgba(0,0,0,0.06)',
          color: MUTED,
          fontFamily: 'inherit',
          backdropFilter: 'blur(8px)',
        }}
      >
        ← старт
      </button>

      {/* ── Category modal ────────────────────────────── */}
      {openCat && (
        <CategoryModal
          cat={openCat}
          transactions={transactions}
          month={month}
          onClose={() => setOpenCat(null)}
        />
      )}

      {/* ── Keyframe animations ───────────────────────── */}
      <style>{`
        @keyframes fadeIn { from { opacity: 0 } to { opacity: 1 } }
        @keyframes slideUp { from { transform: translateY(20px); opacity: 0 } to { transform: translateY(0); opacity: 1 } }
      `}</style>
    </div>
  );
}
