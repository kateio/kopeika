import { useState, useEffect, useRef } from 'react';

// ── Inline Icons (self-contained, no external deps) ─────────
const IconCheck = ({ color = 'currentColor', size = 14 }: { color?: string; size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <path d="M5 12l5 5L20 7" stroke={color} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const IconPlus = ({ color = 'currentColor', size = 16 }: { color?: string; size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <path d="M12 5v14M5 12h14" stroke={color} strokeWidth="1.8" strokeLinecap="round" />
  </svg>
);

// ── Theme constants ─────────────────────────────────────────
const BG = '#FAF8F4';
const FG = '#1A1A1E';
const ACCENT = '#D4F26A';
const MUTED = '#7C7C82';
const CARD = '#FFFFFF';
const BORDER = '#EDE9E1';
const RADIUS = 16;

// ── Category type (local, matches original app.jsx DEFAULT_CATS) ─
interface LocalCategory {
  id: string;
  name: string;
  on: boolean;
  color: string;
}

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

// ── Props ───────────────────────────────────────────────────
interface StartScreenProps {
  onContinue: () => void;
}

// ── Component ───────────────────────────────────────────────
export function StartScreen({ onContinue }: StartScreenProps) {
  const [categories, setCategories] = useState<LocalCategory[]>(DEFAULT_CATS);
  const [newCat, setNewCat] = useState('');
  const [adding, setAdding] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (adding) inputRef.current?.focus();
  }, [adding]);

  const toggle = (id: string) => {
    setCategories((cs) => cs.map((c) => (c.id === id ? { ...c, on: !c.on } : c)));
  };

  const addCat = () => {
    const name = newCat.trim();
    if (!name) {
      setAdding(false);
      return;
    }
    const id = 'c_' + Date.now();
    setCategories((cs) => [...cs, { id, name, on: true, color: ACCENT + '22' }]);
    setNewCat('');
    setAdding(false);
  };

  return (
    <div
      className="flex h-full flex-col"
      style={{ background: BG, color: FG, paddingTop: 64 }}
    >
      {/* ── Logo + tagline ──────────────────────────────── */}
      <div className="flex flex-col items-center px-8 pb-6 pt-10">
        <div
          className="relative mb-7 flex items-center justify-center"
          style={{
            width: 104,
            height: 104,
            borderRadius: 32,
            background: ACCENT,
            boxShadow: `0 18px 44px ${ACCENT}66, inset 0 -6px 12px rgba(0,0,0,0.08)`,
          }}
        >
          <svg width="44" height="44" viewBox="0 0 44 44" fill="none">
            <path
              d="M10 32 L18 20 L24 26 L34 12"
              stroke="#000"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <circle cx="34" cy="12" r="3" fill="#000" />
          </svg>
        </div>

        <h1
          className="m-0 text-[32px] font-bold"
          style={{ letterSpacing: -0.8, fontFamily: '"Inter Tight", -apple-system, system-ui' }}
        >
          Копейка
        </h1>

        <p
          className="mx-0 mt-2.5 max-w-[300px] text-center text-[15px] leading-relaxed"
          style={{ color: MUTED }}
        >
          Помогает отслеживать финансы так, как удобно тебе: пиши, говори или прикрепляй выписки.
        </p>
      </div>

      {/* ── Category chooser ───────────────────────────── */}
      <div className="flex-1 overflow-auto px-6 pt-6">
        <div
          className="mb-3 pl-1 text-[13px] font-medium uppercase"
          style={{ color: MUTED, letterSpacing: 0.6 }}
        >
          Выбери категории трат
        </div>

        <div className="flex flex-wrap gap-2">
          {categories.map((c) => (
            <button
              key={c.id}
              onClick={() => toggle(c.id)}
              className="flex h-10 cursor-pointer items-center gap-2 border-none px-4 text-[15px] font-medium transition-all duration-150"
              style={{
                borderRadius: RADIUS,
                background: c.on ? FG : CARD,
                color: c.on ? BG : FG,
                fontFamily: 'inherit',
              }}
            >
              {c.on && <IconCheck color={BG} size={14} />}
              {c.name}
            </button>
          ))}

          {adding ? (
            <div
              className="flex h-10 items-center px-3.5"
              style={{
                borderRadius: RADIUS,
                background: CARD,
                border: `1.5px solid ${ACCENT}`,
              }}
            >
              <input
                ref={inputRef}
                value={newCat}
                onChange={(e) => setNewCat(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && addCat()}
                onBlur={addCat}
                placeholder="название"
                className="w-[110px] border-none bg-transparent p-0 text-[15px] font-medium outline-none"
                style={{ color: FG, fontFamily: 'inherit' }}
              />
            </div>
          ) : (
            <button
              onClick={() => setAdding(true)}
              className="flex h-10 cursor-pointer items-center gap-1.5 bg-transparent px-3.5 text-[15px] font-medium"
              style={{
                border: `1.5px dashed ${BORDER}`,
                borderRadius: RADIUS,
                color: MUTED,
                fontFamily: 'inherit',
              }}
            >
              <IconPlus color={MUTED} size={16} />
              добавить
            </button>
          )}
        </div>
      </div>

      {/* ── CTA ────────────────────────────────────────── */}
      <div className="px-6 pb-10 pt-4">
        <button
          onClick={onContinue}
          className="flex w-full cursor-pointer items-center justify-center gap-2 border-none text-[17px] font-semibold"
          style={{
            padding: 18,
            borderRadius: RADIUS + 6,
            background: ACCENT,
            color: '#000',
            fontFamily: 'inherit',
            boxShadow: `0 8px 24px ${ACCENT}66`,
          }}
        >
          Поехали
        </button>
        <div className="mt-3.5 text-center text-[13px]" style={{ color: MUTED }}>
          Можно изменить в любой момент
        </div>
      </div>
    </div>
  );
}
