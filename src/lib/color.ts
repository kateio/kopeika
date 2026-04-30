export function hexToHue(hex: string): number {
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

export function generatePalette(accentHex: string, count: number): string[] {
  const baseHue = hexToHue(accentHex);
  const palette: string[] = [];
  for (let i = 0; i < count; i++) {
    const hue = (baseHue + i * 37) % 360;
    palette.push(`oklch(0.75 0.16 ${hue})`);
  }
  return palette;
}
