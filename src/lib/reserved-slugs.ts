// Slug che un locale non può usare: coincidono con rotte statiche di src/app/ (o con file di public/),
// che hanno la precedenza su /[slug] e renderebbero il menu irraggiungibile.
// Da aggiornare a ogni nuova cartella o file di primo livello in src/app/ o public/.
export const RESERVED_SLUGS: ReadonlySet<string> = new Set([
    // Rotte in src/app/
    'admin',
    'api',
    'auth',
    'dashboard',
    'en',
    'forgot-password',
    'login',
    'onboarding',
    'prenota',
    'register',
    'reset-password',
    'termini-e-condizioni',
    // File e metadati in src/app/ (sitemap.xml, robots.txt, opengraph-image, icon.svg)
    'sitemap',
    'robots',
    'opengraph-image',
    'icon',
    // Cartelle di public/ e percorsi interni di Next.js
    'images',
    'videos',
    '_next',
]);

export const SLUG_MIN_LENGTH = 3;
export const SLUG_PATTERN = /^[a-z0-9-]+$/;

export function isReservedSlug(slug: string): boolean {
    return RESERVED_SLUGS.has(slug.toLowerCase());
}

// Motivo per cui uno slug non è accettabile, oppure null se va bene (l'unicità si controlla a parte).
export function slugProblem(slug: string): string | null {
    if (!SLUG_PATTERN.test(slug)) {
        return 'L\'indirizzo può contenere solo lettere minuscole, numeri e trattini.';
    }
    if (slug.length < SLUG_MIN_LENGTH) {
        return `L'indirizzo deve avere almeno ${SLUG_MIN_LENGTH} caratteri.`;
    }
    if (isReservedSlug(slug)) {
        return `"${slug}" è un indirizzo riservato al sito Go!Food Menù: scegline un altro.`;
    }
    return null;
}
