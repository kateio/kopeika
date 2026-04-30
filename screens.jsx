// screens.jsx — Start screen, Main screen, Category modal

const { useState, useEffect, useRef, useMemo } = React;

// ─── Forint formatter
const fmt = (n) => new Intl.NumberFormat('ru-RU').format(Math.round(n));

// ─── SVG Icons (minimal line glyphs)
const Icon = {
  plus: (c='currentColor', s=18) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none"><path d="M12 5v14M5 12h14" stroke={c} strokeWidth="1.8" strokeLinecap="round"/></svg>,
  paperclip: (c='currentColor', s=20) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none"><path d="M21 11.5l-8.5 8.5a5.5 5.5 0 01-7.78-7.78L13.5 4a3.85 3.85 0 015.45 5.45l-8.5 8.5a2.2 2.2 0 11-3.11-3.11L14.5 7.5" stroke={c} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/></svg>,
  send: (c='currentColor', s=20) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none"><path d="M5 12l14-7-5 16-3-7-6-2z" stroke={c} strokeWidth="1.6" strokeLinejoin="round" fill={c} fillOpacity="0.15"/></svg>,
  close: (c='currentColor', s=18) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none"><path d="M6 6l12 12M18 6L6 18" stroke={c} strokeWidth="1.8" strokeLinecap="round"/></svg>,
  chevDown: (c='currentColor', s=14) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none"><path d="M6 9l6 6 6-6" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>,
  chevR: (c='currentColor', s=14) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none"><path d="M9 6l6 6-6 6" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>,
  check: (c='currentColor', s=14) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none"><path d="M5 12l5 5L20 7" stroke={c} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/></svg>,
};

// Category dot — simple circle in accent shade
const CatDot = ({ color, size=36, radius=12 }) => (
  <div style={{
    width: size, height: size, borderRadius: radius,
    background: color, flexShrink: 0,
  }} />
);

// ─────────────────────────────────────────────────────────────
// START SCREEN
// ─────────────────────────────────────────────────────────────
function StartScreen({ theme, onContinue, categories, setCategories }) {
  const [newCat, setNewCat] = useState('');
  const [adding, setAdding] = useState(false);
  const inputRef = useRef(null);

  useEffect(() => { if (adding) inputRef.current?.focus(); }, [adding]);

  const toggle = (id) => {
    setCategories(cs => cs.map(c => c.id === id ? { ...c, on: !c.on } : c));
  };

  const addCat = () => {
    const name = newCat.trim();
    if (!name) { setAdding(false); return; }
    const id = 'c_' + Date.now();
    setCategories(cs => [...cs, { id, name, on: true, color: theme.accent + '22' }]);
    setNewCat('');
    setAdding(false);
  };

  return (
    <div style={{
      height: '100%', display: 'flex', flexDirection: 'column',
      background: theme.bg, color: theme.fg,
      paddingTop: 64,
    }}>
      {/* logo + tagline */}
      <div style={{
        display: 'flex', flexDirection: 'column', alignItems: 'center',
        padding: '40px 32px 24px',
      }}>
        <div style={{
          width: 104, height: 104, borderRadius: 32,
          background: theme.accent,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          marginBottom: 28, position: 'relative',
          boxShadow: `0 18px 44px ${theme.accent}66, inset 0 -6px 12px rgba(0,0,0,0.08)`,
        }}>
          <svg width="44" height="44" viewBox="0 0 44 44" fill="none">
            <path d="M10 32 L18 20 L24 26 L34 12" stroke="#000" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
            <circle cx="34" cy="12" r="3" fill="#000"/>
          </svg>
        </div>
        <h1 style={{
          margin: 0, fontSize: 32, fontWeight: 700, letterSpacing: -0.8,
          fontFamily: '"Inter Tight", -apple-system, system-ui',
        }}>Копейка</h1>
        <p style={{
          margin: '10px 0 0', fontSize: 15, color: theme.muted,
          textAlign: 'center', lineHeight: 1.5, maxWidth: 300,
          textWrap: 'pretty',
        }}>
          Помогает отслеживать финансы так, как удобно тебе: пиши, говори или прикрепляй выписки.
        </p>
      </div>

      {/* category chooser */}
      <div style={{ padding: '24px 24px 0', flex: 1, overflow: 'auto' }}>
        <div style={{
          fontSize: 13, fontWeight: 500, color: theme.muted,
          textTransform: 'uppercase', letterSpacing: 0.6, marginBottom: 12,
          paddingLeft: 4,
        }}>
          Выбери категории трат
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {categories.map(c => (
            <button key={c.id} onClick={() => toggle(c.id)} style={{
              height: 40, boxSizing: 'border-box',
              border: 'none', cursor: 'pointer',
              padding: '0 16px', borderRadius: theme.radius,
              fontSize: 15, fontWeight: 500,
              background: c.on ? theme.fg : theme.card,
              color: c.on ? theme.bg : theme.fg,
              display: 'flex', alignItems: 'center', gap: 8,
              transition: 'all 0.15s ease',
              fontFamily: 'inherit',
            }}>
              {c.on && Icon.check(c.on ? theme.bg : theme.fg, 14)}
              {c.name}
            </button>
          ))}
          {adding ? (
            <div style={{
              height: 40, boxSizing: 'border-box',
              padding: '0 14px', borderRadius: theme.radius,
              background: theme.card, display: 'flex', alignItems: 'center',
              border: `1.5px solid ${theme.accent}`,
            }}>
              <input
                ref={inputRef}
                value={newCat}
                onChange={e => setNewCat(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && addCat()}
                onBlur={addCat}
                placeholder="название"
                style={{
                  border: 'none', outline: 'none', background: 'transparent',
                  fontSize: 15, fontWeight: 500, color: theme.fg,
                  width: 110, fontFamily: 'inherit', padding: 0,
                }}
              />
            </div>
          ) : (
            <button onClick={() => setAdding(true)} style={{
              height: 40, boxSizing: 'border-box',
              border: `1.5px dashed ${theme.border}`, cursor: 'pointer',
              padding: '0 14px', borderRadius: theme.radius,
              fontSize: 15, fontWeight: 500, color: theme.muted,
              background: 'transparent',
              display: 'flex', alignItems: 'center', gap: 6,
              fontFamily: 'inherit',
            }}>
              {Icon.plus(theme.muted, 16)} добавить
            </button>
          )}
        </div>
      </div>

      {/* CTA */}
      <div style={{ padding: '16px 24px 40px' }}>
        <button onClick={onContinue} style={{
          width: '100%', padding: '18px', borderRadius: theme.radius + 6,
          background: theme.accent, color: '#000',
          border: 'none', cursor: 'pointer',
          fontSize: 17, fontWeight: 600, fontFamily: 'inherit',
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
          boxShadow: `0 8px 24px ${theme.accent}66`,
        }}>
          Поехали
        </button>
        <div style={{
          textAlign: 'center', marginTop: 14, fontSize: 13, color: theme.muted,
        }}>
          Можно изменить в любой момент
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// MAIN SCREEN
// ─────────────────────────────────────────────────────────────
const MONTHS = ['Январь','Февраль','Март','Апрель','Май','Июнь','Июль','Август','Сентябрь','Октябрь','Ноябрь','Декабрь'];

function MainScreen({ theme, categories, transactions, setTransactions, onCategory }) {
  const [mode, setMode] = useState('expense'); // 'expense' | 'income'
  const [month, setMonth] = useState(3); // April (0-idx)
  const [showMonths, setShowMonths] = useState(false);
  const [draft, setDraft] = useState('');
  const [attachToast, setAttachToast] = useState(false);
  const [submitFlash, setSubmitFlash] = useState(false);

  // Filter for current month
  const monthTx = useMemo(() => transactions.filter(t =>
    t.month === month && (mode === 'expense' ? t.type === 'expense' : t.type === 'income')
  ), [transactions, month, mode]);

  // Aggregate by category
  const byCat = useMemo(() => {
    const totals = {};
    monthTx.forEach(t => { totals[t.cat] = (totals[t.cat] || 0) + t.amount; });
    return categories
      .filter(c => c.on && totals[c.id])
      .map(c => ({ ...c, amount: totals[c.id] }))
      .sort((a, b) => b.amount - a.amount);
  }, [monthTx, categories]);

  const total = byCat.reduce((s, c) => s + c.amount, 0);

  const handleSend = () => {
    if (!draft.trim()) return;
    // Parse like "еда 500" — naive: pick first matched cat by substring
    const text = draft.toLowerCase();
    const num = parseInt(text.match(/\d+/)?.[0] || '0', 10);
    const matched = categories.find(c => c.on && text.includes(c.name.toLowerCase().split(' ')[0]));
    const cat = matched?.id || categories.find(c => c.on)?.id;
    if (cat && num > 0) {
      setTransactions(ts => [...ts, {
        id: 't_' + Date.now(),
        cat, amount: num, type: mode, month,
        note: draft, date: new Date().toISOString().slice(0,10),
      }]);
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
    <div style={{
      height: '100%', display: 'flex', flexDirection: 'column',
      background: theme.bg, color: theme.fg, position: 'relative',
    }}>
      {/* HEADER */}
      <div style={{
        padding: '60px 24px 12px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <button onClick={() => setShowMonths(s => !s)} style={{
          background: 'transparent', border: 'none', cursor: 'pointer',
          display: 'flex', alignItems: 'center', gap: 6,
          fontSize: 28, fontWeight: 700, color: theme.fg, padding: 0,
          fontFamily: '"Inter Tight", inherit', letterSpacing: -0.6,
        }}>
          {MONTHS[month]}
          <span style={{ marginTop: 6 }}>{Icon.chevDown(theme.muted, 16)}</span>
        </button>
        <div style={{
          width: 38, height: 38, borderRadius: 12,
          background: theme.card,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 14, fontWeight: 600, color: theme.muted,
        }}>К</div>
      </div>

      {/* MONTH PICKER (drop) */}
      {showMonths && (
        <div style={{
          position: 'absolute', top: 110, left: 24,
          background: theme.card, borderRadius: theme.radius + 4,
          boxShadow: '0 12px 40px rgba(0,0,0,0.18)',
          padding: 8, zIndex: 30, width: 180,
          maxHeight: 280, overflow: 'auto',
        }}>
          {MONTHS.map((m, i) => (
            <button key={m} onClick={() => { setMonth(i); setShowMonths(false); }} style={{
              width: '100%', padding: '10px 12px', borderRadius: theme.radius - 4,
              background: i === month ? theme.accent + '33' : 'transparent',
              color: theme.fg, border: 'none', textAlign: 'left',
              cursor: 'pointer', fontSize: 15, fontWeight: i === month ? 600 : 400,
              fontFamily: 'inherit',
            }}>{m}</button>
          ))}
        </div>
      )}

      {/* MODE TOGGLE */}
      <div style={{ padding: '4px 24px 16px' }}>
        <div style={{
          display: 'flex', background: theme.card, borderRadius: theme.radius,
          padding: 4, gap: 4,
        }}>
          {[['expense','траты'],['income','доходы']].map(([k, label]) => (
            <button key={k} onClick={() => setMode(k)} style={{
              flex: 1, padding: '10px', borderRadius: theme.radius - 4,
              background: mode === k ? theme.bg : 'transparent',
              border: 'none', cursor: 'pointer',
              fontSize: 14, fontWeight: 600, color: theme.fg,
              fontFamily: 'inherit',
              boxShadow: mode === k ? '0 2px 8px rgba(0,0,0,0.06)' : 'none',
              transition: 'all 0.15s',
            }}>{label}</button>
          ))}
        </div>
      </div>

      {/* CHART */}
      <div style={{ padding: '8px 24px 16px', display: 'flex', justifyContent: 'center' }}>
        <DonutChart total={total} segments={byCat} theme={theme} mode={mode} />
      </div>

      {/* CATEGORY LIST */}
      <div style={{
        flex: 1, overflow: 'auto', padding: '8px 16px 0',
      }}>
        <div style={{
          fontSize: 13, fontWeight: 500, color: theme.muted,
          textTransform: 'uppercase', letterSpacing: 0.6,
          padding: '0 8px 8px',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        }}>
          <span>Категории</span>
          <span>{byCat.length}</span>
        </div>
        <div style={{
          background: theme.card, borderRadius: theme.radius + 4,
          overflow: 'hidden',
        }}>
          {byCat.length === 0 && (
            <div style={{
              padding: '40px 20px', textAlign: 'center',
              color: theme.muted, fontSize: 14,
            }}>
              {mode === 'expense' ? 'Пока нет трат за ' : 'Пока нет доходов за '}
              {MONTHS[month].toLowerCase()}
            </div>
          )}
          {byCat.map((c, i) => (
            <button key={c.id} onClick={() => onCategory(c)} style={{
              width: '100%', display: 'flex', alignItems: 'center',
              padding: '14px 16px', gap: 14,
              background: 'transparent', border: 'none', cursor: 'pointer',
              borderTop: i > 0 ? `1px solid ${theme.border}` : 'none',
              fontFamily: 'inherit', textAlign: 'left',
            }}>
              <CatDot color={c.color} size={36} radius={theme.radius - 4} />
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 16, fontWeight: 500, color: theme.fg }}>{c.name}</div>
                <div style={{ fontSize: 12, color: theme.muted, marginTop: 2 }}>
                  {Math.round(c.amount / total * 100)}%
                </div>
              </div>
              <div style={{
                fontSize: 16, fontWeight: 600, color: theme.fg,
                fontVariantNumeric: 'tabular-nums',
              }}>{fmt(c.amount)} ₽</div>
            </button>
          ))}
        </div>
      </div>

      {/* INPUT BAR */}
      <div style={{
        padding: '12px 16px 20px', position: 'relative',
      }}>
        {attachToast && (
          <div style={{
            position: 'absolute', bottom: 84, left: 16, right: 16,
            background: theme.fg, color: theme.bg,
            padding: '12px 16px', borderRadius: theme.radius,
            fontSize: 14, display: 'flex', alignItems: 'center', gap: 10,
            animation: 'slideUp 0.3s ease',
          }}>
            <span style={{ fontSize: 18 }}>📎</span>
            Прикрепи выписку из банка — я разнесу всё по категориям
          </div>
        )}
        <div style={{
          background: theme.card, borderRadius: theme.radius + 8,
          padding: '8px 8px 8px 14px',
          display: 'flex', alignItems: 'center', gap: 8,
          border: submitFlash ? `1.5px solid ${theme.accent}` : `1px solid ${theme.border}`,
          transition: 'border 0.2s',
        }}>
          <button onClick={handleAttach} style={{
            background: 'transparent', border: 'none', cursor: 'pointer',
            padding: 6, color: theme.muted, display: 'flex',
          }}>{Icon.paperclip(theme.muted, 20)}</button>
          <input
            value={draft}
            onChange={e => setDraft(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSend()}
            placeholder={mode === 'expense' ? 'расскажи что потратил...' : 'расскажи про доход...'}
            style={{
              flex: 1, border: 'none', outline: 'none',
              background: 'transparent', fontSize: 15,
              color: theme.fg, fontFamily: 'inherit',
              padding: '8px 0',
            }}
          />
          <button onClick={handleSend} style={{
            background: draft.trim() ? theme.accent : theme.border,
            border: 'none', cursor: draft.trim() ? 'pointer' : 'default',
            width: 36, height: 36, borderRadius: 12,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            transition: 'background 0.15s',
          }}>
            {Icon.send(theme.fg, 18)}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// DONUT CHART
// ─────────────────────────────────────────────────────────────
function DonutChart({ total, segments, theme, mode }) {
  const size = 240;
  const cx = size / 2, cy = size / 2;
  const r = 92;
  const stroke = 18;
  const C = 2 * Math.PI * r;

  // Generate harmonious palette from accent hue
  const palette = useMemo(() => {
    const baseHue = hexToHue(theme.accent);
    return segments.map((_, i) => {
      const hue = (baseHue + i * 37) % 360;
      return `oklch(0.75 0.16 ${hue})`;
    });
  }, [segments, theme.accent]);

  const styleVariant = theme.chartStyle || 'ring';

  let acc = 0;
  const arcs = segments.map((s, i) => {
    const frac = s.amount / total;
    const len = C * frac;
    const dashOffset = -C * (acc / total);
    acc += s.amount;
    return {
      color: palette[i],
      dasharray: `${Math.max(0, len - 3)} ${C}`,
      offset: dashOffset,
    };
  });

  if (segments.length === 0) {
    return (
      <div style={{
        width: size, height: size, borderRadius: '50%',
        border: `${stroke}px solid ${theme.card}`,
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      }}>
        <div style={{ fontSize: 13, color: theme.muted }}>пусто</div>
      </div>
    );
  }

  return (
    <div style={{ position: 'relative', width: size, height: size }}>
      <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
        {styleVariant === 'ring' && arcs.map((a, i) => (
          <circle key={i} cx={cx} cy={cy} r={r} fill="none"
            stroke={a.color} strokeWidth={stroke}
            strokeDasharray={a.dasharray}
            strokeDashoffset={a.offset}
            strokeLinecap="butt"
          />
        ))}
        {styleVariant === 'pie' && arcs.map((a, i) => {
          // Use thicker stroke for filled-pie look
          return (
            <circle key={i} cx={cx} cy={cy} r={r-stroke/2+1} fill="none"
              stroke={a.color} strokeWidth={stroke*2-2}
              strokeDasharray={a.dasharray.split(' ').map((v,j) => j===0 ? (parseFloat(v) * (r-stroke/2+1) / r).toString() : v).join(' ')}
              strokeDashoffset={a.offset * (r-stroke/2+1) / r}
            />
          );
        })}
        {styleVariant === 'thin' && arcs.map((a, i) => (
          <circle key={i} cx={cx} cy={cy} r={r} fill="none"
            stroke={a.color} strokeWidth={6}
            strokeDasharray={a.dasharray}
            strokeDashoffset={a.offset}
          />
        ))}
      </svg>
      <div style={{
        position: 'absolute', inset: 0,
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        textAlign: 'center',
      }}>
        <div style={{
          fontSize: 12, color: theme.muted, fontWeight: 500,
          textTransform: 'uppercase', letterSpacing: 0.6,
        }}>
          всего {mode === 'expense' ? 'трат' : 'дохода'}
        </div>
        <div style={{
          fontSize: 30, fontWeight: 700, color: theme.fg,
          fontFamily: '"Inter Tight", inherit', letterSpacing: -0.8,
          marginTop: 4, fontVariantNumeric: 'tabular-nums',
        }}>{fmt(total)} ₽</div>
      </div>
    </div>
  );
}

// crude hex→hue extractor for palette generation
function hexToHue(hex) {
  if (!hex || hex[0] !== '#') return 90;
  const h = hex.slice(1);
  const r = parseInt(h.slice(0,2), 16) / 255;
  const g = parseInt(h.slice(2,4), 16) / 255;
  const b = parseInt(h.slice(4,6), 16) / 255;
  const max = Math.max(r,g,b), min = Math.min(r,g,b);
  const d = max - min;
  let hue = 0;
  if (d === 0) hue = 0;
  else if (max === r) hue = ((g-b)/d) % 6;
  else if (max === g) hue = (b-r)/d + 2;
  else hue = (r-g)/d + 4;
  hue = Math.round(hue * 60);
  if (hue < 0) hue += 360;
  return hue;
}

// ─────────────────────────────────────────────────────────────
// CATEGORY DETAIL MODAL
// ─────────────────────────────────────────────────────────────
function CategoryModal({ cat, transactions, theme, month, onClose }) {
  if (!cat) return null;
  const items = transactions.filter(t => t.cat === cat.id && t.month === month);
  return (
    <div onClick={onClose} style={{
      position: 'absolute', inset: 0, zIndex: 100,
      background: 'rgba(0,0,0,0.4)',
      display: 'flex', alignItems: 'flex-end',
      animation: 'fadeIn 0.2s ease',
    }}>
      <div onClick={e => e.stopPropagation()} style={{
        width: '100%', background: theme.bg,
        borderTopLeftRadius: 28, borderTopRightRadius: 28,
        padding: '12px 0 30px', maxHeight: '78%',
        display: 'flex', flexDirection: 'column',
        animation: 'slideUp 0.25s ease',
      }}>
        {/* grabber */}
        <div style={{
          width: 40, height: 5, borderRadius: 5,
          background: theme.border, margin: '0 auto 16px',
        }} />
        <div style={{ padding: '0 24px 16px', display: 'flex', alignItems: 'center', gap: 12 }}>
          <CatDot color={cat.color} size={44} radius={14} />
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 20, fontWeight: 700, color: theme.fg, fontFamily: '"Inter Tight", inherit' }}>{cat.name}</div>
            <div style={{ fontSize: 13, color: theme.muted, marginTop: 2 }}>{items.length} операций</div>
          </div>
          <button onClick={onClose} style={{
            width: 32, height: 32, borderRadius: 16,
            background: theme.card, border: 'none', cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: theme.muted,
          }}>{Icon.close(theme.muted, 16)}</button>
        </div>
        <div style={{
          padding: '8px 24px 16px',
          fontSize: 28, fontWeight: 700, color: theme.fg,
          fontFamily: '"Inter Tight", inherit', letterSpacing: -0.6,
          fontVariantNumeric: 'tabular-nums',
        }}>{fmt(cat.amount)} ₽</div>
        <div style={{ flex: 1, overflow: 'auto', padding: '0 16px' }}>
          {items.map(t => (
            <div key={t.id} style={{
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              padding: '14px 12px', borderBottom: `1px solid ${theme.border}`,
            }}>
              <div>
                <div style={{ fontSize: 15, color: theme.fg }}>{t.note || cat.name}</div>
                <div style={{ fontSize: 12, color: theme.muted, marginTop: 2 }}>{t.date}</div>
              </div>
              <div style={{
                fontSize: 15, fontWeight: 600, color: theme.fg,
                fontVariantNumeric: 'tabular-nums',
              }}>{fmt(t.amount)} ₽</div>
            </div>
          ))}
          {items.length === 0 && (
            <div style={{ padding: 32, textAlign: 'center', color: theme.muted, fontSize: 14 }}>
              Пока нет операций
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { StartScreen, MainScreen, CategoryModal, fmt });
