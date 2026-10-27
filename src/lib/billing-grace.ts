/**
 * Periodo di tolleranza per i pagamenti non riusciti (migrazione 040).
 *
 * Al primo pagamento non riuscito il webhook Stripe imposta tenants.grace_until: il menu resta visibile
 * mentre Stripe ritenta l'addebito. Alla scadenza il cron giornaliero (/api/cron/billing-grace, ore 5 UTC)
 * aggiorna la cache e il menu mostra la pagina neutra; al pagamento riuscito torna visibile da solo.
 * Il ristoratore riceve un'email all'inizio della tolleranza e un promemoria prima della sospensione,
 * con copia agli indirizzi in ADMIN_EMAILS. Solo lato server (service role).
 */

import { createClient } from '@supabase/supabase-js';
import { Resend } from 'resend';
import { SITE_URL } from '@/lib/site';
import { lastVisibleDay } from '@/lib/menu-visibility';

const DAY_MS = 24 * 60 * 60 * 1000;

/** Giorni in cui il menu resta visibile dopo il primo pagamento non riuscito (variabile MENU_GRACE_DAYS). */
export const GRACE_DAYS = Math.max(1, Number(process.env.MENU_GRACE_DAYS) || 7);

/** Il promemoria parte quando alla sospensione mancano al massimo questi giorni. */
export const REMINDER_DAYS_BEFORE = 2;

// Ora (UTC) in cui scade la tolleranza: un'ora prima del cron (vercel.json, "0 5 * * *"), così il menu
// si sospende di primo mattino e mai durante il servizio.
const GRACE_END_HOUR_UTC = 4;

function getSupabaseAdmin() {
    return createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!,
        { auth: { autoRefreshToken: false, persistSession: false } }
    );
}

/** Fine della tolleranza per un pagamento non riuscito adesso: GRACE_DAYS dopo, alla prima scadenza del mattino. */
export function computeGraceUntil(now: Date = new Date()): Date {
    const end = new Date(now.getTime() + GRACE_DAYS * DAY_MS);
    const atHour = new Date(Date.UTC(end.getUTCFullYear(), end.getUTCMonth(), end.getUTCDate(), GRACE_END_HOUR_UTC));
    return atHour.getTime() >= end.getTime() ? atHour : new Date(atHour.getTime() + DAY_MS);
}

export type GraceEmailKind = 'notice' | 'reminder';

const SENT_COLUMN: Record<GraceEmailKind, string> = {
    notice: 'grace_notice_sent_at',
    reminder: 'grace_reminder_sent_at',
};

function graceEmail(kind: GraceEmailKind, name: string, day: string) {
    const accountUrl = `${SITE_URL}/dashboard/account`;
    const footer = [
        `Per evitarlo basta aggiornare la carta da Account → Abbonamento → Gestisci abbonamento:`,
        accountUrl,
        ``,
        `Appena il pagamento va a buon fine il menu torna visibile da solo.`,
        `Per qualsiasi dubbio rispondi a questa email.`,
        ``,
        `Lo staff di Go!Food Menù`,
    ];

    if (kind === 'notice') {
        return {
            subject: `Pagamento non riuscito: il menu di ${name} resta online fino a ${day}`,
            text: [
                `Ciao,`,
                ``,
                `non siamo riusciti ad addebitare il rinnovo dell'abbonamento Go!Food Menù di ${name}. Nei prossimi giorni il pagamento verrà ritentato in automatico.`,
                ``,
                `Il menu resta visibile ai clienti fino a ${day}. Se entro quella data il pagamento non va a buon fine, dal mattino seguente al posto del menu i clienti vedranno una pagina che li invita a chiedere piatti, prezzi e allergeni al personale.`,
                ``,
                ...footer,
            ].join('\n'),
        };
    }
    return {
        subject: `Promemoria: il menu di ${name} resta online solo fino a ${day}`,
        text: [
            `Ciao,`,
            ``,
            `il pagamento dell'abbonamento Go!Food Menù di ${name} non è ancora andato a buon fine.`,
            ``,
            `Il menu resta visibile ai clienti fino a ${day}; dal mattino seguente, senza pagamento, i clienti vedranno una pagina che li invita a chiedere piatti, prezzi e allergeni al personale.`,
            ``,
            ...footer,
        ].join('\n'),
    };
}

function adminEmails(): string[] {
    return (process.env.ADMIN_EMAILS || '').split(',').map((e) => e.trim()).filter(Boolean);
}

/**
 * Manda l'avviso al ristoratore (copia agli admin) se il locale è ancora in tolleranza e l'avviso non è
 * già partito. La data in tenant_billing si prenota prima dell'invio (niente doppioni tra webhook e cron)
 * e si libera se l'invio fallisce, così il cron riprova il giorno dopo.
 */
export async function sendGraceEmail(tenantId: string, kind: GraceEmailKind): Promise<boolean> {
    const supabase = getSupabaseAdmin();
    const { data: tenant } = await supabase
        .from('tenants')
        .select('restaurant_name, contact_email, owner_id, subscription_status, grace_until, footer_data')
        .eq('id', tenantId)
        .maybeSingle();
    if (!tenant || tenant.subscription_status !== 'past_due' || !tenant.grace_until) return false;
    if (new Date(tenant.grace_until).getTime() <= Date.now()) return false;

    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) {
        console.warn('[BILLING_GRACE] RESEND_API_KEY is missing');
        return false;
    }

    let to: string | null = tenant.contact_email;
    if (!to && tenant.owner_id) {
        const { data } = await supabase.auth.admin.getUserById(tenant.owner_id);
        to = data.user?.email ?? null;
    }
    if (!to) {
        console.warn(`[BILLING_GRACE] No email for tenant ${tenantId}`);
        return false;
    }

    // I locali iscritti prima di tenant_billing possono non avere la riga
    await supabase.from('tenant_billing').upsert({ tenant_id: tenantId }, { onConflict: 'tenant_id', ignoreDuplicates: true });

    const column = SENT_COLUMN[kind];
    const { data: claimed } = await supabase
        .from('tenant_billing')
        .update({ [column]: new Date().toISOString() })
        .eq('tenant_id', tenantId)
        .is(column, null)
        .select('tenant_id');
    if (!claimed?.length) return false;

    const name = (tenant.footer_data?.public_name || tenant.restaurant_name) as string;
    const { subject, text } = graceEmail(kind, name, lastVisibleDay(tenant.grace_until));
    const admins = adminEmails().filter((e) => e.toLowerCase() !== to!.toLowerCase());

    const { error } = await new Resend(apiKey).emails.send({
        from: '"Go!Food Menù" <help@gofoodmenu.it>',
        to: [to],
        cc: admins.length ? admins : undefined,
        replyTo: 'help@gofoodmenu.it',
        subject,
        text,
    });
    if (error) {
        console.error(`[BILLING_GRACE] Resend error (${kind}) for tenant ${tenantId}:`, error);
        await supabase.from('tenant_billing').update({ [column]: null }).eq('tenant_id', tenantId);
        return false;
    }
    return true;
}

/** Dopo un pagamento riuscito: al prossimo pagamento non riuscito gli avvisi ripartono da capo. */
export async function resetGraceEmails(tenantId: string) {
    await getSupabaseAdmin()
        .from('tenant_billing')
        .update({ grace_notice_sent_at: null, grace_reminder_sent_at: null })
        .eq('tenant_id', tenantId);
}
