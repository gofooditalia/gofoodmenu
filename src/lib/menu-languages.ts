/**
 * Lingue del menu pubblico tradotte e salvate nel database (migrazione 039).
 * L'italiano è la lingua del ristoratore; le altre stanno su /{slug}/{lingua}.
 * Usato anche dal middleware: niente import da React o da Supabase qui.
 */

export const TRANSLATED_LANGS = ['en', 'fr', 'de', 'es', 'pl', 'pt'] as const;
export type TranslatedLang = (typeof TRANSLATED_LANGS)[number];
export type MenuLang = 'it' | TranslatedLang;

export const MENU_LANG_LABELS: Record<MenuLang, { label: string; flag: string }> = {
    it: { label: 'Italiano', flag: '🇮🇹' },
    en: { label: 'English', flag: '🇬🇧' },
    fr: { label: 'Français', flag: '🇫🇷' },
    de: { label: 'Deutsch', flag: '🇩🇪' },
    es: { label: 'Español', flag: '🇪🇸' },
    pl: { label: 'Polski', flag: '🇵🇱' },
    pt: { label: 'Português', flag: '🇵🇹' },
};

// Cookie con la lingua scelta dal cliente nel selettore: vale più della lingua del telefono
export const MENU_LANG_COOKIE = 'menu_lang';

export function isTranslatedLang(value: string | null | undefined): value is TranslatedLang {
    return !!value && (TRANSLATED_LANGS as readonly string[]).includes(value);
}

export function isMenuLang(value: string | null | undefined): value is MenuLang {
    return value === 'it' || isTranslatedLang(value);
}

/**
 * Lingua in cui aprire il menu, dalla scelta salvata nel cookie o dalla lingua del telefono
 * (intestazione Accept-Language). Telefono in italiano: italiano. Lingua tradotta: quella.
 * Altra lingua (es. olandese): inglese, se il locale ce l'ha. Nessuna informazione: italiano.
 */
export function pickMenuLang(
    available: readonly string[],
    acceptLanguage: string | null,
    cookieLang?: string | null,
): MenuLang {
    if (cookieLang === 'it') return 'it';
    if (isTranslatedLang(cookieLang) && available.includes(cookieLang)) return cookieLang;
    if (!acceptLanguage) return 'it';

    const preferred = acceptLanguage
        .split(',')
        .map((part) => {
            const [tag, ...params] = part.trim().split(';');
            const q = params.map((p) => p.trim()).find((p) => p.startsWith('q='));
            return { lang: tag.trim().toLowerCase().split('-')[0], q: q ? Number(q.slice(2)) || 0 : 1 };
        })
        .filter((p) => p.lang && p.lang !== '*' && p.q > 0)
        .sort((a, b) => b.q - a.q);

    const first = preferred[0]?.lang;
    if (!first || first === 'it') return 'it';
    if (isTranslatedLang(first) && available.includes(first)) return first;
    return available.includes('en') ? 'en' : 'it';
}

/** Indirizzo di una pagina del menu nella lingua indicata: menuLangPath('pizzeria', 'en', '/allergeni') → /pizzeria/en/allergeni. */
export function menuLangPath(slug: string, lang: MenuLang, suffix = ''): string {
    return `/${slug}${lang === 'it' ? '' : `/${lang}`}${suffix}`;
}
