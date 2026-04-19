// TODO delete entire file after agreed color
function hexToHsl(hex: string): [number, number, number] {
  const r = parseInt(hex.slice(1, 3), 16) / 255;
  const g = parseInt(hex.slice(3, 5), 16) / 255;
  const b = parseInt(hex.slice(5, 7), 16) / 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const l = (max + min) / 2;

  if (max === min) return [0, 0, l * 100];

  const d = max - min;
  const s = l > 0.5 ? d / (2 - max - min) : d / (max + min);

  let h = 0;
  if (max === r) h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
  else if (max === g) h = ((b - r) / d + 2) / 6;
  else h = ((r - g) / d + 4) / 6;

  return [h * 360, s * 100, l * 100];
}

function hslToHex(h: number, s: number, l: number): string {
  s /= 100;
  l /= 100;

  const a = s * Math.min(l, 1 - l);
  const f = (n: number) => {
    const k = (n + h / 30) % 12;
    const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
    return Math.round(255 * color)
      .toString(16)
      .padStart(2, '0');
  };

  return `#${f(0)}${f(8)}${f(4)}`;
}

export interface BrandScale {
  '50': string;
  '100': string;
  '200': string;
  '300': string;
  '400': string;
  '500': string;
  '600': string;
  '700': string;
}

export function generateBrandScale(hex: string): BrandScale {
  const [h, s, l] = hexToHsl(hex);

  const clamp = (v: number) => Math.max(0, Math.min(100, v));

  return {
    '50': hslToHex(h, Math.min(s, 30), clamp(l + 40)),
    '100': hslToHex(h, Math.min(s, 40), clamp(l + 33)),
    '200': hslToHex(h, s * 0.9, clamp(l + 24)),
    '300': hslToHex(h, s * 0.95, clamp(l + 15)),
    '400': hslToHex(h, s, clamp(l + 7)),
    '500': hslToHex(h, s, l),
    '600': hslToHex(h, s, clamp(l - 8)),
    '700': hslToHex(h, s, clamp(l - 16)),
  };
}

export function hexToRgb(hex: string): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `${r}, ${g}, ${b}`;
}
