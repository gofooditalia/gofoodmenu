/**
 * Cron orario delle traduzioni del menu (vercel.json; src/lib/menu-translation-jobs.ts).
 * Rete di sicurezza della traduzione automatica dopo il salvataggio: per ogni locale con le traduzioni attive
 * e il menu pubblico cerca le voci nuove, cambiate o non riuscite e le traduce (stesso lucchetto del salvataggio
 * e di /admin, quindi mai due traduzioni insieme). Se è tutto aggiornato non fa nessuna chiamata AI.
 * Vercel chiama la route con "Authorization: Bearer $CRON_SECRET".
 */

import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/admin';
import { isMenuPublic } from '@/lib/menu-visibility';
import { runMenuTranslation } from '@/lib/menu-translation-jobs';
import { countPendingTranslations } from '@/lib/translate-menu';

export const dynamic = 'force-dynamic';
export const maxDuration = 300;

// Dopo questo tempo non si inizia un altro locale: i rimanenti li prende il cron successivo
const START_BUDGET_MS = 60_000;

export async function GET(req: NextRequest) {
    const secret = process.env.CRON_SECRET;
    if (!secret || req.headers.get('authorization') !== `Bearer ${secret}`) {
        return new NextResponse('Unauthorized', { status: 401 });
    }
    if (!process.env.OPENROUTER_API_KEY) {
        return NextResponse.json({ skipped: 'OPENROUTER_API_KEY mancante' });
    }

    const admin = getSupabaseAdmin();
    const { data: tenants, error } = await admin
        .from('tenants')
        .select('id, slug, subscription_tier, subscription_status, grace_until')
        .neq('menu_languages', '{}');
    if (error) {
        console.error('[CRON_MENU_TRANSLATIONS] DB Error:', error);
        return new NextResponse('Internal Error', { status: 500 });
    }

    const started = Date.now();
    const result = { checked: 0, translated: {} as Record<string, number>, busy: [] as string[], deferred: [] as string[] };

    for (const tenant of (tenants ?? []).filter((t) => isMenuPublic(t))) {
        const name = tenant.slug ?? tenant.id;
        if (Date.now() - started > START_BUDGET_MS) {
            result.deferred.push(name);
            continue;
        }
        try {
            result.checked += 1;
            if ((await countPendingTranslations(admin, tenant.id)) === 0) continue;
            const outcome = await runMenuTranslation(tenant.id);
            if (outcome.status === 'done') result.translated[name] = outcome.result.translated;
            else result.busy.push(name);
        } catch (e) {
            console.error(`[CRON_MENU_TRANSLATIONS] Tenant ${tenant.id}:`, e);
        }
    }

    console.log('[CRON_MENU_TRANSLATIONS]', JSON.stringify(result));
    return NextResponse.json(result);
}
