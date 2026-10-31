import { menuLangTag, type MenuLang } from '@/lib/menu-languages';

/**
 * Coperto in euro nella lingua del menu, con le cifre 0-9 anche in arabo (come i prezzi dei piatti).
 * Supabase restituisce le colonne DECIMAL come testo ("2.00", "0.00"): null se non c'è un coperto da mostrare.
 */
export function formatCoverCharge(value: number | string | null | undefined, lang: MenuLang): string | null {
  const amount = Number(value);
  if (!Number.isFinite(amount) || amount <= 0) return null;
  const locale = lang === 'ar' ? 'ar-u-nu-latn' : menuLangTag(lang);
  return new Intl.NumberFormat(locale, { style: 'currency', currency: 'EUR' }).format(amount);
}
