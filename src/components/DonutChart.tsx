import { useMemo } from 'react';

interface DonutSegment {
  name: string;
  amount: number;
  color: string;
}

interface DonutChartProps {
  total: number;
  segments: DonutSegment[];
  chartStyle?: 'ring' | 'pie' | 'thin';
  accentColor?: string;
  mode?: 'expense' | 'income';
}

/** Crude hex -> hue extractor for palette generation */
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

/** Generate a harmonious palette from a base accent color */
function generatePalette(accentHex: string, count: number): string[] {
  const baseHue = hexToHue(accentHex);
  return Array.from({ length: count }, (_, i) => {
    const hue = (baseHue + i * 37) % 360;
    return `oklch(0.75 0.16 ${hue})`;
  });
}

const SIZE = 240;
const CX = SIZE / 2;
const CY = SIZE / 2;
const R = 92;
const STROKE_RING = 18;
const STROKE_THIN = 6;
const C = 2 * Math.PI * R;

const fmt = (n: number) => new Intl.NumberFormat('ru-RU').format(Math.round(n));

export function DonutChart({
  total,
  segments,
  chartStyle = 'ring',
  accentColor = '#D4F26A',
  mode = 'expense',
}: DonutChartProps) {
  const palette = useMemo(
    () => generatePalette(accentColor, segments.length),
    [accentColor, segments.length],
  );

  const arcs = useMemo(() => {
    const prefixSums = segments.reduce<number[]>((sums, s) => {
      sums.push((sums[sums.length - 1] ?? 0) + s.amount);
      return sums;
    }, []);
    return segments.map((s, i) => {
      const acc = i === 0 ? 0 : prefixSums[i - 1];
      const frac = total > 0 ? s.amount / total : 0;
      const len = C * frac;
      const dashOffset = total > 0 ? -C * (acc / total) : 0;
      return {
        color: palette[i] ?? accentColor,
        dasharray: `${Math.max(0, len - 3)} ${C}`,
        offset: dashOffset,
      };
    });
  }, [segments, total, palette, accentColor]);

  if (segments.length === 0) {
    return (
      <div
        className="flex flex-col items-center justify-center rounded-full border-bg"
        style={{
          width: SIZE,
          height: SIZE,
          border: `${STROKE_RING}px solid`,
          borderColor: 'var(--tw-border-opacity, #FFFFFF)',
        }}
      >
        <div className="text-[13px] text-muted">пусто</div>
      </div>
    );
  }

  const renderArcs = () => {
    switch (chartStyle) {
      case 'ring':
        return arcs.map((a, i) => (
          <circle
            key={i}
            cx={CX}
            cy={CY}
            r={R}
            fill="none"
            stroke={a.color}
            strokeWidth={STROKE_RING}
            strokeDasharray={a.dasharray}
            strokeDashoffset={a.offset}
            strokeLinecap="butt"
          />
        ));

      case 'pie': {
        const pieR = R - STROKE_RING / 2 + 1;
        const pieStroke = STROKE_RING * 2 - 2;
        return arcs.map((a, i) => {
          const ratio = pieR / R;
          const parts = a.dasharray.split(' ');
          const adjustedDash = `${parseFloat(parts[0]) * ratio} ${parts[1]}`;
          return (
            <circle
              key={i}
              cx={CX}
              cy={CY}
              r={pieR}
              fill="none"
              stroke={a.color}
              strokeWidth={pieStroke}
              strokeDasharray={adjustedDash}
              strokeDashoffset={a.offset * ratio}
            />
          );
        });
      }

      case 'thin':
        return arcs.map((a, i) => (
          <circle
            key={i}
            cx={CX}
            cy={CY}
            r={R}
            fill="none"
            stroke={a.color}
            strokeWidth={STROKE_THIN}
            strokeDasharray={a.dasharray}
            strokeDashoffset={a.offset}
          />
        ));
    }
  };

  return (
    <div className="relative" style={{ width: SIZE, height: SIZE }}>
      <svg width={SIZE} height={SIZE} style={{ transform: 'rotate(-90deg)' }}>
        {renderArcs()}
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
        <div className="text-xs font-medium uppercase tracking-wide text-muted">
          всего {mode === 'expense' ? 'трат' : 'дохода'}
        </div>
        <div
          className="mt-1 text-[30px] font-bold text-fg"
          style={{
            fontFamily: '"Inter Tight", inherit',
            letterSpacing: -0.8,
            fontVariantNumeric: 'tabular-nums',
          }}
        >
          {fmt(total)} ₽
        </div>
      </div>
    </div>
  );
}
