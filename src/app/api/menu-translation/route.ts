/**
 * Traduzione automatica del menu dopo un salvataggio (src/lib/menu-translation-jobs.ts).
 * La chiama revalidatePublicMenu (con after) invece di tradurre lì dentro: un revalidatePath eseguito dentro
 * after() di un'azione server non aggiornava la cache del menu su Vercel (provato il 27/10/2026), mentre dentro
 * una richiesta normale sì, come nel cron. La risposta arriva a lavoro finito (attesa, traduzione, cache).
 * Solo uso interno: "Authorization: Bearer $CRON_SECRET".
 */

import { NextRequest, NextResponse } from 'next/server';
import { requestMenuTranslation } from '@/lib/menu-translation-jobs';

export const dynamic = 'force-dynamic';
export const maxDuration = 300;

export async function POST(req: NextRequest) {
    const secret = process.env.CRON_SECRET;
    if (!secret || req.headers.get('authorization') !== `Bearer ${secret}`) {
        return new NextResponse('Unauthorized', { status: 401 });
    }
    const { tenantId } = (await req.json().catch(() => ({}))) as { tenantId?: unknown };
    if (typeof tenantId !== 'string' || !tenantId) {
        return new NextResponse('Bad Request', { status: 400 });
    }

    await requestMenuTranslation(tenantId);
    return NextResponse.json({ ok: true });
}
