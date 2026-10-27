'use server';

import { Resend } from 'resend';
import { createClient } from '@/lib/supabase/server';
import { getAdminOverview, getSupabaseAdmin, isAdminEmail, isPaying, isTestTenant } from '@/lib/admin';
import { translateTenantMenu } from '@/lib/translate-menu';
import { revalidateMenuSlug } from '@/lib/revalidate-menu';

export interface NewsletterSyncResult {
    ok: boolean;
    message: string;
}

/**
 * Aggiunge al segmento newsletter di Resend (RESEND_NEWSLETTER_SEGMENT_ID) solo i clienti con abbonamento
 * premium attivo: chi ha solo iniziato la registrazione o è sul piano free resta fuori.
 * I contatti già presenti non vengono toccati: chi si è disiscritto resta disiscritto.
 * Gli account di prova (TEST_TENANT_SLUGS e TEST_TENANT_IDS) restano fuori.
 * La sincronizzazione aggiunge e basta: chi non è più cliente va tolto a mano dal segmento su Resend.
 */
export async function syncNewsletterContacts(): Promise<NewsletterSyncResult> {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user || !isAdminEmail(user.email)) {
        return { ok: false, message: 'Non autorizzato' };
    }

    const segmentId = process.env.RESEND_NEWSLETTER_SEGMENT_ID;
    if (!process.env.RESEND_API_KEY || !segmentId) {
        return { ok: false, message: 'Configura RESEND_API_KEY e RESEND_NEWSLETTER_SEGMENT_ID su Vercel' };
    }

    const resend = new Resend(process.env.RESEND_API_KEY);
    const { tenants } = await getAdminOverview();
    const emails = new Map<string, string>();
    let testAccounts = 0;
    let notPaying = 0;
    for (const t of tenants) {
        if (isTestTenant(t)) {
            testAccounts += 1;
            continue;
        }
        if (!isPaying(t.tier, t.status)) {
            notPaying += 1;
            continue;
        }
        // Il nome finisce nel saluto della newsletter ({{{FIRST_NAME}}}): niente spazi in più
        if (t.email) emails.set(t.email.toLowerCase(), t.restaurantName.trim().replace(/\s+/g, ' '));
    }

    let added = 0;
    let failed = 0;
    for (const [email, restaurantName] of emails) {
        const existing = await resend.contacts.get({ email });
        if (!existing.data) {
            const created = await resend.contacts.create({ email, firstName: restaurantName, unsubscribed: false });
            if (created.error) {
                console.error('[admin] Creazione contatto Resend:', email, created.error);
                failed += 1;
                continue;
            }
        }
        const linked = await resend.contacts.segments.add({ email, segmentId });
        if (linked.error) {
            console.error('[admin] Aggiunta al segmento Resend:', email, linked.error);
            failed += 1;
        } else {
            added += 1;
        }
    }

    return {
        ok: failed === 0,
        message: `${added} clienti con abbonamento attivo nella lista newsletter`
            + (failed ? `, ${failed} non riusciti (vedi log)` : '')
            + ` (esclusi ${notPaying} senza abbonamento e ${testAccounts} account di prova)`,
    };
}

export interface TranslateMenuActionResult {
    ok: boolean;
    message: string;
}

/**
 * Traduce il menu di un locale nelle lingue di TRANSLATED_LANGS (solo le voci o le lingue nuove o cambiate)
 * e attiva le pagine /{slug}/{lingua}. Per ora solo dal pannello admin: è la fase pilota (Magna Roma).
 */
export async function translateMenuForTenant(tenantId: string): Promise<TranslateMenuActionResult> {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user || !isAdminEmail(user.email)) {
        return { ok: false, message: 'Non autorizzato' };
    }
    if (!process.env.OPENROUTER_API_KEY) {
        return { ok: false, message: 'Configura OPENROUTER_API_KEY su Vercel' };
    }

    try {
        const admin = getSupabaseAdmin();
        const { data: tenant } = await admin.from('tenants').select('slug').eq('id', tenantId).single();
        const result = await translateTenantMenu(admin, tenantId);
        revalidateMenuSlug(tenant?.slug);
        return {
            ok: result.failed === 0,
            message: `${result.translated} voci tradotte, ${result.upToDate} già aggiornate`
                + (result.failed ? `, ${result.failed} non riuscite (restano in italiano: rilancia)` : ''),
        };
    } catch (error) {
        console.error('[admin] Traduzione menu:', error);
        return { ok: false, message: error instanceof Error ? error.message : 'Traduzione non riuscita' };
    }
}
