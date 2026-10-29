/**
 * Correzioni a mano delle traduzioni del menu dal pannello del ristoratore (/dashboard/translations).
 * Solo funzioni pure, usate dalla pagina (lato browser) e da translate-menu.ts.
 *
 * Una lingua corretta a mano finisce in `translations.manual`: la traduzione automatica non la rifà più, anche se
 * la lunghezza non supera il controllo di plausibilità. Se il ristoratore cambia il testo italiano la correzione
 * decade come tutte le altre lingue (il menu tradotto mostra l'italiano finché non viene ritradotto).
 */

import type { TextPair, Translations } from '@/lib/translate-menu';
import { isTranslatedLang, type TranslatedLang } from '@/lib/menu-languages';

// Stato di una voce in una lingua: tradotta (in automatico o a mano) o in attesa della traduzione automatica
export type TranslationStatus = 'auto' | 'manual' | 'pending';

export function sourceOf(name: string | null | undefined, description: string | null | undefined): TextPair {
    return { name: (name ?? '').trim(), description: (description ?? '').trim() };
}

function sameSource(a: TextPair | undefined, b: TextPair): boolean {
    return !!a && a.name === b.name && a.description === b.description;
}

export function manualLangs(t: Translations | null | undefined): TranslatedLang[] {
    return Array.isArray(t?.manual) ? t.manual.filter(isTranslatedLang) : [];
}

/** Traduzione valida per il testo italiano attuale (null se manca o se l'italiano è cambiato dopo). */
export function currentTranslation(t: Translations | null | undefined, source: TextPair, lang: TranslatedLang): TextPair | null {
    if (!t || !sameSource(t.source, source)) return null;
    const pair = t[lang];
    return pair?.name ? { name: pair.name, description: pair.description ?? '' } : null;
}

export function translationStatus(t: Translations | null | undefined, source: TextPair, lang: TranslatedLang): TranslationStatus {
    if (!currentTranslation(t, source, lang)) return 'pending';
    return manualLangs(t).includes(lang) ? 'manual' : 'auto';
}

/**
 * Traduzioni da salvare dopo la correzione di una lingua. Se le traduzioni salvate sono di un testo italiano
 * precedente si tengono solo la correzione e le altre lingue spariscono (le rifà la traduzione automatica):
 * con il nuovo `source` sembrerebbero valide anche se descrivono il piatto vecchio.
 */
export function withManualTranslation(
    t: Translations | null | undefined,
    source: TextPair,
    lang: TranslatedLang,
    pair: TextPair,
): Translations {
    const base: Translations = t && sameSource(t.source, source) ? { ...t } : {};
    const manual = [...new Set([...manualLangs(base), lang])];
    return {
        ...base,
        source,
        [lang]: { name: pair.name.trim(), description: source.description ? pair.description.trim() : '' },
        manual,
    };
}

/** Traduzioni senza la lingua indicata: al prossimo giro la traduzione automatica la rifà da capo. */
export function withoutTranslation(t: Translations | null | undefined, lang: TranslatedLang): Translations {
    const next: Translations = { ...(t ?? {}) };
    delete next[lang];
    const manual = manualLangs(t).filter((l) => l !== lang);
    if (manual.length) next.manual = manual;
    else delete next.manual;
    return next;
}
