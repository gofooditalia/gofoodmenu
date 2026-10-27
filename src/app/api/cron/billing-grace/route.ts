/**
 * Cron giornaliero della tolleranza sui pagamenti (vercel.json, ore 5 UTC; src/lib/billing-grace.ts).
 * - Tolleranza scaduta: aggiorna la cache del menu, che passa alla pagina neutra.
 * - Tolleranza in corso: manda l'avviso se il webhook non ci è riuscito, e il promemoria
 *   quando alla sospensione mancano REMINDER_DAYS_BEFORE giorni o meno.
 * Vercel chiama la route con "Authorization: Bearer $CRON_SECRET".
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { REMINDER_DAYS_BEFORE, sendGraceEmail } from '@/lib/billing-grace';
import { revalidateMenuSlug } from '@/lib/revalidate-menu';

export const dynamic = 'force-dynamic';

const DAY_MS = 24 * 60 * 60 * 1000;
// Margine sull'orario del cron, che può partire qualche minuto dopo
const REMINDER_WINDOW_MS = REMINDER_DAYS_BEFORE * DAY_MS + 2 * 60 * 60 * 1000;

export async function GET(req: NextRequest) {
    const secret = process.env.CRON_SECRET;
    if (!secret || req.headers.get('authorization') !== `Bearer ${secret}`) {
        return new NextResponse('Unauthorized', { status: 401 });
    }

    const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!,
        { auth: { autoRefreshToken: false, persistSession: false } }
    );

    const { data: tenants, error } = await supabase
        .from('tenants')
        .select('id, slug, grace_until')
        .eq('subscription_status', 'past_due')
        .not('grace_until', 'is', null);
    if (error) {
        console.error('[CRON_BILLING_GRACE] DB Error:', error);
        return new NextResponse('Internal Error', { status: 500 });
    }

    const now = Date.now();
    const result = { suspended: [] as string[], notices: 0, reminders: 0 };

    for (const tenant of tenants ?? []) {
        const left = new Date(tenant.grace_until).getTime() - now;
        try {
            if (left <= 0) {
                revalidateMenuSlug(tenant.slug);
                result.suspended.push(tenant.slug ?? tenant.id);
                continue;
            }
            if (await sendGraceEmail(tenant.id, 'notice')) result.notices += 1;
            if (left <= REMINDER_WINDOW_MS && await sendGraceEmail(tenant.id, 'reminder')) result.reminders += 1;
        } catch (e) {
            console.error(`[CRON_BILLING_GRACE] Tenant ${tenant.id}:`, e);
        }
    }

    console.log('[CRON_BILLING_GRACE]', JSON.stringify(result));
    return NextResponse.json(result);
}
