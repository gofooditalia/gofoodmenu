/**
 * Contrasto tra colori secondo WCAG 2.2: usato dal menu pubblico (testo leggibile sui badge),
 * dal Design Studio (avvisi sui colori scelti) e dalla PWA (colore delle barre di sistema).
 */

// Testo normale (WCAG AA 1.4.3)
export const MIN_TEXT_CONTRAST = 4.5;

const DARK_TEXT = '#171717';
const LIGHT_TEXT = '#FFFFFF';

export function parseHex(color: string | undefined): [number, number, number] | null {
  const hex = color && /^#([0-9a-f]{3}|[0-9a-f]{6})$/i.exec(color.trim())?.[1];
  if (!hex) return null;
  const full = hex.length === 3 ? hex.split('').map((c) => c + c).join('') : hex;
  return [0, 2, 4].map((i) => parseInt(full.slice(i, i + 2), 16)) as [number, number, number];
}

export function relativeLuminance([r, g, b]: [number, number, number]): number {
  const [lr, lg, lb] = [r, g, b].map((v) => {
    const c = v / 255;
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * lr + 0.7152 * lg + 0.0722 * lb;
}

// null se uno dei due colori non è un esadecimale (es. 'transparent')
export function contrastRatio(a: string | undefined, b: string | undefined): number | null {
  const ca = parseHex(a);
  const cb = parseHex(b);
  if (!ca || !cb) return null;
  const [hi, lo] = [relativeLuminance(ca), relativeLuminance(cb)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
}

// Il colore scelto se si legge sul fondo, altrimenti il più leggibile tra testo scuro e bianco
export function readableTextOn(background: string | undefined, preferred: string | undefined): string | undefined {
  const ratio = contrastRatio(preferred, background);
  if (ratio === null || ratio >= MIN_TEXT_CONTRAST) return preferred;
  const dark = contrastRatio(DARK_TEXT, background) ?? 0;
  const light = contrastRatio(LIGHT_TEXT, background) ?? 0;
  return dark >= light ? DARK_TEXT : LIGHT_TEXT;
}
