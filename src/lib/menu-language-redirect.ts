/**
 * Reindirizzamento del menu pubblico nella lingua del telefono (usato dal middleware).
 * Chi apre /{slug} dal QR con il telefono in inglese, francese, tedesco o spagnolo va su /{slug}/{lingua},
 * se il locale ha quella lingua attiva (tenants.menu_languages, migrazione 039). Il QR resta lo stesso.
 *
 * L'elenco dei locali tradotti si legge da Supabase al massimo ogni 5 minuti per istanza: il middleware
 * gira a ogni richiesta e non deve interrogare il database ogni volta. Un locale appena tradotto
 * comincia a reindirizzare entro qualche minuto; le sue pagine /{slug}/{lingua} funzionano subito.
 */

import { NextResponse, type NextRequest } from 'next/server';
import { isReservedSlug } from '@/lib/reserved-slugs';
import { MENU_LANG_COOKIE, pickMenuLang } from '@/lib/menu-languages';

const MENU_PATH = /^\/([a-z0-9-]+)\/?$/;
const CACHE_MS = 5 * 60 * 1000;

let cache: { at: number; langs: Map<string, string[]> } | null = null;

async function translatedTenants(): Promise<Map<string, string[]>> {
    if (cache && Date.now() - cache.at < CACHE_MS) return cache.langs;
    const langs = new Map<string, string[]>();
    try {
        const url = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/tenants?select=slug,menu_languages&menu_languages=neq.%7B%7D`;
        const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
        const res = await fetch(url, {
            headers: { apikey: key, Authorization: `Bearer ${key}` },
            signal: AbortSignal.timeout(1500),
        });
        // Prima della migrazione 039 la colonna non esiste (errore 400): nessun reindirizzamento
        if (res.ok) {
            for (const row of (await res.json()) as { slug: string | null; menu_languages: string[] | null }[]) {
                if (row.slug && row.menu_languages?.length) langs.set(row.slug, row.menu_languages);
            }
        }
    } catch (error) {
        console.error('[menu-lang] Elenco dei menu tradotti non disponibile:', error);
    }
    cache = { at: Date.now(), langs };
    return langs;
}

/** Restituisce il reindirizzamento alla versione tradotta del menu, oppure null per proseguire normalmente. */
export async function menuLanguageRedirect(request: NextRequest): Promise<NextResponse | null> {
    if (request.method !== 'GET') return null;
    const match = request.nextUrl.pathname.match(MENU_PATH);
    if (!match || isReservedSlug(match[1])) return null;

    const available = (await translatedTenants()).get(match[1]);
    if (!available?.length) return null;

    const lang = pickMenuLang(
        available,
        request.headers.get('accept-language'),
        request.cookies.get(MENU_LANG_COOKIE)?.value,
    );
    if (lang === 'it') return null;

    const url = request.nextUrl.clone();
    url.pathname = `/${match[1]}/${lang}`;
    // 307: temporaneo, la scelta dipende dal telefono di chi apre il link
    return NextResponse.redirect(url, 307);
}
