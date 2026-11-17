/**
 * Prezzo al peso (colonna `dishes.price_unit`, migrazione 045).
 * NULL = prezzo a porzione (tutti i piatti esistenti); 'hg' = prezzo all'etto (100 g); 'kg' = prezzo al chilo.
 * Il prezzo salvato resta quello per l'unità scelta: il menu aggiunge solo l'etichetta accanto al prezzo.
 * Testi fissi scritti a mano, come in menu-i18n.ts: in italiano "all'etto" / "al kg", nelle altre lingue
 * le unità del sistema internazionale (100 g, kg), che si leggono in ogni lingua e anche in arabo e cinese.
 */

import type { MenuLang } from '@/lib/menu-languages';

export type PriceUnit = 'hg' | 'kg';

export const PRICE_UNITS: PriceUnit[] = ['hg', 'kg'];

/** Opzioni del pannello del ristoratore ('' = a porzione). */
export const PRICE_UNIT_OPTIONS: { value: PriceUnit | ''; label: string }[] = [
  { value: '', label: 'A porzione' },
  { value: 'hg', label: "All'etto (100 g)" },
  { value: 'kg', label: 'Al kg' },
];

export function toPriceUnit(value: unknown): PriceUnit | null {
  return value === 'hg' || value === 'kg' ? value : null;
}

const SUFFIX: Record<MenuLang, Record<PriceUnit, string>> = {
  it: { hg: "all'etto", kg: 'al kg' },
  en: { hg: '/ 100 g', kg: '/ kg' },
  fr: { hg: '/ 100 g', kg: '/ kg' },
  de: { hg: '/ 100 g', kg: '/ kg' },
  es: { hg: '/ 100 g', kg: '/ kg' },
  pl: { hg: '/ 100 g', kg: '/ kg' },
  pt: { hg: '/ 100 g', kg: '/ kg' },
  zh: { hg: '/ 100 g', kg: '/ kg' },
  ar: { hg: '/ 100 g', kg: '/ kg' },
};

/** Etichetta da mettere dopo il prezzo ("all'etto", "/ 100 g"…), stringa vuota per il prezzo a porzione. */
export function priceUnitSuffix(unit: unknown, lang: MenuLang = 'it'): string {
  const value = toPriceUnit(unit);
  return value ? SUFFIX[lang][value] : '';
}
