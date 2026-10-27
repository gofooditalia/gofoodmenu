/**
 * Traduzione automatica del menu dopo i salvataggi del ristoratore (migrazione 041, tabella menu_translation_jobs).
 * Solo per i locali già tradotti (tenants.menu_languages non vuoto) e con il menu pubblico: non attiva mai lingue nuove.
 *
 * - requestMenuTranslation: chiamata dalla route /api/menu-translation, che revalidatePublicMenu richiama (con after)
 *   dopo ogni salvataggio. Segna la richiesta e aspetta DEBOUNCE_MS: se nel frattempo è arrivato un altro salvataggio si ferma e
 *   lascia fare a quello. Così una serie di modifiche ravvicinate (o un import AI) produce una sola traduzione.
 * - Lucchetto per locale (locked_until, con scadenza): salvataggio, cron e pulsante in /admin non traducono mai
 *   lo stesso menu due volte in parallelo.
 * - Ogni giro ha un tempo massimo: un menu molto grande si completa in più giri (salvataggio successivo o cron).
 */

import type { SupabaseClient } from '@supabase/supabase-js';
import { getSupabaseAdmin } from '@/lib/admin';
import { isMenuPublic } from '@/lib/menu-visibility';
import { revalidateMenuSlug } from '@/lib/revalidate-menu';
import { translateTenantMenu, type TranslateMenuOptions, type TranslateMenuResult } from '@/lib/translate-menu';

// Attesa dopo l'ultimo salvataggio prima di tradurre
export const DEBOUNCE_MS = 30_000;
// Dopo questo tempo dall'inizio del giro non si avviano altri blocchi. Funzioni Vercel: 300 s al massimo, compresa
// l'attesa iniziale (fino a 2 × DEBOUNCE_MS) e l'ultimo blocco avviato (fino al timeout di una chiamata, 90 s)
const TRANSLATE_BUDGET_MS = 120_000;
// Scadenza del lucchetto: oltre la durata massima di una funzione, così un giro interrotto non blocca il locale
const LOCK_MS = 6 * 60_000;

export type TranslationRunOutcome =
    | { status: 'done'; result: TranslateMenuResult }
    | { status: 'busy' } // un'altra traduzione è in corso per lo stesso locale
    | { status: 'superseded' }; // è arrivato un salvataggio più recente: tradurrà quello

/**
 * Prende il lucchetto del locale con un solo UPDATE condizionato (atomico). Con `requestedBefore` lo prende solo se
 * l'ultima richiesta è più vecchia di quella data (attesa dopo l'ultimo salvataggio finita).
 */
async function claimLock(admin: SupabaseClient, tenantId: string, requestedBefore?: Date): Promise<Date | null> {
    const now = new Date();
    // La riga può mancare (cron, /admin): la si crea senza toccare una richiesta già presente
    await admin.from('menu_translation_jobs').upsert({ tenant_id: tenantId }, { onConflict: 'tenant_id', ignoreDuplicates: true });

    let query = admin
        .from('menu_translation_jobs')
        .update({ locked_until: new Date(now.getTime() + LOCK_MS).toISOString() })
        .eq('tenant_id', tenantId)
        .or(`locked_until.is.null,locked_until.lt.${now.toISOString()}`);
    if (requestedBefore) query = query.lte('requested_at', requestedBefore.toISOString());
    const { data, error } = await query.select('tenant_id');
    if (error) throw new Error(`Lucchetto traduzione: ${error.message}`);
    return data?.length ? now : null;
}

async function releaseLock(admin: SupabaseClient, tenantId: string, startedAt: Date, completed: boolean) {
    const { error } = await admin
        .from('menu_translation_jobs')
        .update(completed ? { locked_until: null, last_run_at: startedAt.toISOString() } : { locked_until: null })
        .eq('tenant_id', tenantId);
    if (error) console.error('[menu-translation] Lucchetto non rilasciato:', tenantId, error.message);
}

/**
 * Un giro di traduzione sotto lucchetto. Usato dal salvataggio (con `requestedBefore`), dal cron e da /admin
 * (con `activate`, per attivare le lingue). Aggiorna il menu pubblico se ha tradotto qualcosa (o attivato le lingue).
 */
export async function runMenuTranslation(
    tenantId: string,
    {
        requestedBefore,
        activate = false,
        budgetMs = TRANSLATE_BUDGET_MS,
    }: { requestedBefore?: Date; activate?: boolean; budgetMs?: number } = {},
): Promise<TranslationRunOutcome> {
    const admin = getSupabaseAdmin();
    const startedAt = await claimLock(admin, tenantId, requestedBefore);
    if (!startedAt) {
        if (!requestedBefore) return { status: 'busy' };
        const { data } = await admin.from('menu_translation_jobs').select('locked_until').eq('tenant_id', tenantId).maybeSingle();
        const locked = data?.locked_until && new Date(data.locked_until).getTime() > Date.now();
        return locked ? { status: 'busy' } : { status: 'superseded' };
    }

    let completed = false;
    try {
        const options: TranslateMenuOptions = { activate, deadline: startedAt.getTime() + budgetMs };
        const result = await translateTenantMenu(admin, tenantId, options);
        completed = result.skipped === 0;
        if (result.translated > 0 || activate) {
            const { data: tenant } = await admin.from('tenants').select('slug').eq('id', tenantId).maybeSingle();
            revalidateMenuSlug(tenant?.slug);
        }
        return { status: 'done', result };
    } finally {
        await releaseLock(admin, tenantId, startedAt, completed);
    }
}

/** Il locale ha le traduzioni attive e il menu pubblico (le altre traduzioni costerebbero senza servire). */
export async function wantsAutoTranslation(admin: SupabaseClient, tenantId: string): Promise<boolean> {
    const { data } = await admin
        .from('tenants')
        .select('menu_languages, subscription_tier, subscription_status, grace_until')
        .eq('id', tenantId)
        .maybeSingle();
    return !!data?.menu_languages?.length && isMenuPublic(data);
}

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Da chiamare dentro la route /api/menu-translation, dopo un salvataggio (non dentro after(): lì revalidatePath non
 * aggiornava il menu su Vercel): segna la richiesta, aspetta la fine delle modifiche ravvicinate
 * e traduce. Se un'altra traduzione era in corso, al termine ricontrolla una volta (le modifiche arrivate durante
 * quel giro non vanno perse; in ogni caso le recupera il cron).
 */
export async function requestMenuTranslation(tenantId: string): Promise<void> {
    if (!process.env.OPENROUTER_API_KEY) return;
    try {
        const admin = getSupabaseAdmin();
        if (!(await wantsAutoTranslation(admin, tenantId))) return;

        const requestedAt = new Date();
        const { error } = await admin
            .from('menu_translation_jobs')
            .upsert({ tenant_id: tenantId, requested_at: requestedAt.toISOString() }, { onConflict: 'tenant_id' });
        if (error) throw new Error(`Richiesta traduzione: ${error.message}`);

        await sleep(DEBOUNCE_MS);
        let outcome = await runMenuTranslation(tenantId, { requestedBefore: requestedAt });
        if (outcome.status === 'busy') {
            // Giro altrui in corso (cron o /admin): si riprova una volta più tardi, poi ci pensa il cron
            await sleep(DEBOUNCE_MS);
            outcome = await runMenuTranslation(tenantId, { requestedBefore: requestedAt });
        }
        if (outcome.status === 'done') {
            const { translated, failed, skipped } = outcome.result;
            console.log(`[menu-translation] ${tenantId}: ${translated} tradotte, ${failed} non riuscite, ${skipped} rimandate`);
        }
    } catch (error) {
        // Mai un errore verso il ristoratore: il cron riprova
        console.error('[menu-translation] Traduzione automatica non riuscita:', tenantId, error);
    }
}
