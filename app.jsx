// app.jsx — App shell: theme, screen routing, tweaks panel

const { useState: useState_, useEffect: useEffect_, useMemo: useMemo_ } = React;

const TWEAKS_DEFAULTS = /*EDITMODE-BEGIN*/{
  "dark": false,
  "accent": "#D4F26A",
  "chartStyle": "ring",
  "radius": 16
}/*EDITMODE-END*/;

const ACCENT_OPTIONS = [
  { name: 'Лайм',    value: '#D4F26A' },
  { name: 'Коралл',  value: '#FF8E72' },
  { name: 'Лаванда', value: '#C7B8FF' },
  { name: 'Мята',    value: '#9EE5C5' },
  { name: 'Жёлтый',  value: '#FFD66B' },
  { name: 'Розовый', value: '#FFB4D1' },
];

const CHART_OPTIONS = [
  { value: 'ring', label: 'Кольцо' },
  { value: 'pie',  label: 'Пирог' },
  { value: 'thin', label: 'Тонко' },
];

function makeTheme(t) {
  if (t.dark) {
    return {
      bg: '#121214', fg: '#F5F5F5', card: '#1F1F22',
      muted: '#8A8A92', border: '#2A2A2E',
      accent: t.accent, radius: t.radius, chartStyle: t.chartStyle,
    };
  }
  return {
    bg: '#FAF8F4', fg: '#1A1A1E', card: '#FFFFFF',
    muted: '#7C7C82', border: '#EDE9E1',
    accent: t.accent, radius: t.radius, chartStyle: t.chartStyle,
  };
}

const DEFAULT_CATS = [
  { id: 'food',     name: 'еда',                on: true,  color: '#D4F26A' },
  { id: 'transp',   name: 'транспорт',          on: true,  color: '#FFB4D1' },
  { id: 'care',     name: 'уход за собой',      on: true,  color: '#9EE5C5' },
  { id: 'subs',     name: 'подписки',           on: true,  color: '#C7B8FF' },
  { id: 'unexp',    name: 'непредвиденные',     on: true,  color: '#FF8E72' },
  { id: 'home',     name: 'дом',                on: false, color: '#FFD66B' },
  { id: 'fun',      name: 'развлечения',        on: false, color: '#A0D8FF' },
  { id: 'health',   name: 'здоровье',           on: false, color: '#FFCBA0' },
];

const SEED_TX = [
  // April expenses
  { id: 't1', cat: 'food',   amount: 18400, type: 'expense', month: 3, note: 'Самокат, рынок', date: '2026-04-12' },
  { id: 't2', cat: 'food',   amount: 4200,  type: 'expense', month: 3, note: 'Кофейня', date: '2026-04-15' },
  { id: 't3', cat: 'transp', amount: 9800,  type: 'expense', month: 3, note: 'Метро + такси', date: '2026-04-08' },
  { id: 't4', cat: 'transp', amount: 5200,  type: 'expense', month: 3, note: 'Каршеринг', date: '2026-04-16' },
  { id: 't5', cat: 'care',   amount: 7500,  type: 'expense', month: 3, note: 'Парикмахер', date: '2026-04-05' },
  { id: 't6', cat: 'care',   amount: 2800,  type: 'expense', month: 3, note: 'Косметика', date: '2026-04-14' },
  { id: 't7', cat: 'subs',   amount: 1290,  type: 'expense', month: 3, note: 'Музыка + кино', date: '2026-04-01' },
  { id: 't8', cat: 'unexp',  amount: 6400,  type: 'expense', month: 3, note: 'Подарок', date: '2026-04-11' },
  // April income
  { id: 'i1', cat: 'food',   amount: 165000, type: 'income', month: 3, note: 'Зарплата',   date: '2026-04-05' },
  // March expenses (so month switcher shows something)
  { id: 't9', cat: 'food',   amount: 14000, type: 'expense', month: 2, note: '', date: '2026-03-10' },
  { id: 't10', cat: 'transp', amount: 8200, type: 'expense', month: 2, note: '', date: '2026-03-15' },
  { id: 't11', cat: 'subs',   amount: 1290, type: 'expense', month: 2, note: '', date: '2026-03-01' },
];

// Income transactions: route them to a dedicated "Зарплата" virtual cat
const INCOME_CATS = [
  { id: 'salary',   name: 'зарплата',  on: true, color: '#9EE5C5' },
  { id: 'freelance',name: 'фриланс',   on: true, color: '#D4F26A' },
];
const SEED_INCOME = [
  { id: 'in1', cat: 'salary',    amount: 165000, type: 'income', month: 3, note: 'Основная работа', date: '2026-04-05' },
  { id: 'in2', cat: 'freelance', amount: 42000,  type: 'income', month: 3, note: 'Дизайн-проект',   date: '2026-04-18' },
  { id: 'in3', cat: 'salary',    amount: 165000, type: 'income', month: 2, note: '', date: '2026-03-05' },
];

function App() {
  const [tweaks, setTweaks] = useState_(() => {
    try {
      const saved = localStorage.getItem('kopeika_tweaks');
      return saved ? { ...TWEAKS_DEFAULTS, ...JSON.parse(saved) } : TWEAKS_DEFAULTS;
    } catch { return TWEAKS_DEFAULTS; }
  });
  const [editMode, setEditMode] = useState_(false);
  const [screen, setScreen] = useState_(() => localStorage.getItem('kopeika_screen') || 'start');
  const [categories, setCategories] = useState_(() => {
    try {
      const saved = localStorage.getItem('kopeika_cats');
      return saved ? JSON.parse(saved) : DEFAULT_CATS;
    } catch { return DEFAULT_CATS; }
  });
  const [transactions, setTransactions] = useState_(() => {
    try {
      const saved = localStorage.getItem('kopeika_tx');
      return saved ? JSON.parse(saved) : [...SEED_TX.filter(t => t.type === 'expense'), ...SEED_INCOME];
    } catch { return [...SEED_TX.filter(t => t.type === 'expense'), ...SEED_INCOME]; }
  });
  const [openCat, setOpenCat] = useState_(null);

  // Persist
  useEffect_(() => { localStorage.setItem('kopeika_screen', screen); }, [screen]);
  useEffect_(() => { localStorage.setItem('kopeika_cats', JSON.stringify(categories)); }, [categories]);
  useEffect_(() => { localStorage.setItem('kopeika_tx', JSON.stringify(transactions)); }, [transactions]);
  useEffect_(() => { localStorage.setItem('kopeika_tweaks', JSON.stringify(tweaks)); }, [tweaks]);

  // Edit mode wiring
  useEffect_(() => {
    const handler = (ev) => {
      if (ev.data?.type === '__activate_edit_mode')   setEditMode(true);
      if (ev.data?.type === '__deactivate_edit_mode') setEditMode(false);
    };
    window.addEventListener('message', handler);
    window.parent.postMessage({ type: '__edit_mode_available' }, '*');
    return () => window.removeEventListener('message', handler);
  }, []);

  const updateTweak = (k, v) => {
    setTweaks(t => {
      const next = { ...t, [k]: v };
      window.parent.postMessage({ type: '__edit_mode_set_keys', edits: { [k]: v } }, '*');
      return next;
    });
  };

  const theme = useMemo_(() => makeTheme(tweaks), [tweaks]);

  // For income screen — use INCOME_CATS instead of expense categories.
  // Combined cat list passed to MainScreen is full list; main screen filters by `on`.
  // We'll merge income cats into categories so detail/list works for both modes.
  const allCats = useMemo_(() => {
    const incomeIds = INCOME_CATS.map(c => c.id);
    const merged = [...categories];
    INCOME_CATS.forEach(ic => {
      if (!merged.find(c => c.id === ic.id)) merged.push(ic);
    });
    return merged;
  }, [categories]);

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: 24, boxSizing: 'border-box',
      background: 'radial-gradient(ellipse at top, #ECE7DD 0%, #DDD7CB 60%, #C9C3B6 100%)',
    }}>
      <style>{`
        @keyframes fadeIn { from { opacity: 0 } to { opacity: 1 } }
        @keyframes slideUp { from { transform: translateY(20px); opacity: 0 } to { transform: translateY(0); opacity: 1 } }
        body { font-family: 'Inter Tight', -apple-system, system-ui, sans-serif; margin: 0; }
        * { box-sizing: border-box; }
      `}</style>

      <IOSDevice width={402} height={874} dark={tweaks.dark}>
        <div data-screen-label={screen === 'start' ? '01 Start' : '02 Main'}
             style={{ height: '100%', position: 'relative' }}>
          {screen === 'start' ? (
            <StartScreen
              theme={theme}
              categories={categories}
              setCategories={setCategories}
              onContinue={() => setScreen('main')}
            />
          ) : (
            <MainScreen
              theme={theme}
              categories={allCats}
              transactions={transactions}
              setTransactions={setTransactions}
              onCategory={setOpenCat}
            />
          )}
          {openCat && (
            <CategoryModal
              cat={openCat}
              theme={theme}
              transactions={transactions}
              month={3}
              onClose={() => setOpenCat(null)}
            />
          )}

          {/* Floating prev-screen helper (only on main → can return to start) */}
          {screen === 'main' && (
            <button onClick={() => setScreen('start')} style={{
              position: 'absolute', top: 18, right: 18, zIndex: 80,
              padding: '6px 12px', borderRadius: 12,
              background: 'rgba(0,0,0,0.06)', border: 'none', cursor: 'pointer',
              fontSize: 11, color: theme.muted, fontFamily: 'inherit',
              backdropFilter: 'blur(8px)',
            }}>← старт</button>
          )}
        </div>
      </IOSDevice>

      {editMode && (
        <TweaksPanel tweaks={tweaks} update={updateTweak} />
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// TWEAKS PANEL
// ─────────────────────────────────────────────────────────────
function TweaksPanel({ tweaks, update }) {
  return (
    <div style={{
      position: 'fixed', bottom: 20, right: 20, zIndex: 200,
      width: 280, padding: 18, borderRadius: 18,
      background: 'rgba(20,20,22,0.94)', color: '#fff',
      backdropFilter: 'blur(20px)',
      boxShadow: '0 20px 60px rgba(0,0,0,0.35)',
      fontFamily: '"Inter Tight", system-ui',
      fontSize: 13,
    }}>
      <div style={{
        fontSize: 11, fontWeight: 600, opacity: 0.55,
        textTransform: 'uppercase', letterSpacing: 1,
        marginBottom: 14,
      }}>Tweaks</div>

      {/* Theme */}
      <Block label="Тема">
        <Seg options={[['false','Светлая'],['true','Тёмная']]}
             value={String(tweaks.dark)}
             onChange={v => update('dark', v === 'true')} />
      </Block>

      {/* Accent */}
      <Block label="Акцент">
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {ACCENT_OPTIONS.map(c => (
            <button key={c.value} onClick={() => update('accent', c.value)} style={{
              width: 30, height: 30, borderRadius: 10,
              background: c.value, border: tweaks.accent === c.value ? '2px solid #fff' : '2px solid transparent',
              cursor: 'pointer', padding: 0,
              boxShadow: tweaks.accent === c.value ? '0 0 0 2px rgba(255,255,255,0.3)' : 'none',
            }} title={c.name} />
          ))}
        </div>
      </Block>

      {/* Chart style */}
      <Block label="Диаграмма">
        <Seg options={CHART_OPTIONS.map(o => [o.value, o.label])}
             value={tweaks.chartStyle}
             onChange={v => update('chartStyle', v)} />
      </Block>

      {/* Radius */}
      <Block label={`Скругления — ${tweaks.radius}px`}>
        <input type="range" min={4} max={28} value={tweaks.radius}
               onChange={e => update('radius', parseInt(e.target.value, 10))}
               style={{ width: '100%', accentColor: tweaks.accent }} />
      </Block>
    </div>
  );
}

function Block({ label, children }) {
  return (
    <div style={{ marginBottom: 14 }}>
      <div style={{ fontSize: 11, opacity: 0.6, marginBottom: 8 }}>{label}</div>
      {children}
    </div>
  );
}

function Seg({ options, value, onChange }) {
  return (
    <div style={{
      display: 'flex', background: 'rgba(255,255,255,0.08)',
      borderRadius: 10, padding: 3, gap: 2,
    }}>
      {options.map(([v, l]) => (
        <button key={v} onClick={() => onChange(v)} style={{
          flex: 1, padding: '7px 10px', borderRadius: 8,
          background: value === v ? '#fff' : 'transparent',
          color: value === v ? '#000' : '#fff',
          border: 'none', cursor: 'pointer',
          fontSize: 12, fontWeight: 500, fontFamily: 'inherit',
        }}>{l}</button>
      ))}
    </div>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<App />);
