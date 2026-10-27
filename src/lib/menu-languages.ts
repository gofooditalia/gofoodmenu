/**
 * Lingue del menu pubblico tradotte e salvate nel database (migrazione 039).
 * L'italiano è la lingua del ristoratore; le altre stanno su /{slug}/{lingua}.
 * Usato anche dal middleware: niente import da React o da Supabase qui.
 */

export const TRANSLATED_LANGS = ['en', 'fr', 'de', 'es', 'pl', 'pt', 'zh', 'ar'] as const;
export type TranslatedLang = (typeof TRANSLATED_LANGS)[number];
export type MenuLang = 'it' | TranslatedLang;

/**
 * Lingue proposte di default da "Traduci menu" in /admin. Cinese e arabo si aggiungono solo ai locali che li
 * chiedono: le lingue attive di ogni locale stanno in tenants.menu_languages e solo quelle si traducono.
 */
export const DEFAULT_TRANSLATED_LANGS: readonly TranslatedLang[] = ['en', 'fr', 'de', 'es', 'pl', 'pt'];

// Lingue scritte da destra a sinistra: la pagina prende dir="rtl"
export const RTL_LANGS: readonly MenuLang[] = ['ar'];

export function menuLangDir(lang: MenuLang): 'rtl' | 'ltr' {
    return RTL_LANGS.includes(lang) ? 'rtl' : 'ltr';
}

/**
 * Codice BCP 47 della lingua per l'attributo lang e gli hreflang. L'indirizzo resta /{slug}/zh, ma il testo è
 * cinese semplificato: zh-Hans fa scegliere al telefono i caratteri giusti.
 */
export function menuLangTag(lang: MenuLang): string {
    return lang === 'zh' ? 'zh-Hans' : lang;
}

export const MENU_LANG_LABELS: Record<MenuLang, { label: string; flag: string }> = {
    it: { label: 'Italiano', flag: '🇮🇹' },
    en: { label: 'English', flag: '🇬🇧' },
    fr: { label: 'Français', flag: '🇫🇷' },
    de: { label: 'Deutsch', flag: '🇩🇪' },
    es: { label: 'Español', flag: '🇪🇸' },
    pl: { label: 'Polski', flag: '🇵🇱' },
    pt: { label: 'Português', flag: '🇵🇹' },
    zh: { label: '简体中文', flag: '🇨🇳' },
    ar: { label: 'العربية', flag: '🇸🇦' },
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
 * Si guarda solo la lingua principale del codice: zh-CN, zh-TW e zh-HK vanno sul cinese (semplificato,
 * l'unico tradotto), ar-SA, ar-EG… sull'arabo.
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
