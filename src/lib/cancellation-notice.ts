/**
 * Avvisi agli admin (ADMIN_EMAILS) sulla fine dell'abbonamento. Solo lato server (service role).
 * - Disdetta dal portale Stripe, o disdetta annullata: il webhook su customer.subscription.updated confronta
 *   cancel_at_period_end / cancel_at con i valori precedenti dell'evento.
 * - "Elimina Account" con un abbonamento che si rinnova ancora (l'eliminazione non lo disdice).
 */

import { createClient } from '@supabase/supabase-js';
import { Resend } from 'resend';
import { SITE_URL } from '@/lib/site';
import { adminEmails } from '@/lib/billing-grace';
import { stripe } from '@/lib/stripe';

// Valori di cancellation_details.feedback di Stripe (motivo scelto nel portale)
const FEEDBACK_LABELS: Record<string, string> = {
    too_expensive: 'Troppo caro',
    missing_features: 'Mancano delle funzioni',
    switched_service: 'Passato a un altro servizio',
    unused: 'Non lo usa',
    customer_service: 'Assistenza',
    too_complex: 'Troppo complicato',
    low_quality: 'Qualità insufficiente',
    other: 'Altro',
};

export type CancellationChange = 'scheduled' | 'revoked';

interface CancellationInfo {
    endsAt?: number | null;
    feedback?: string | null;
    comment?: string | null;
}

/** Se l'evento cambia la disdetta programmata: 'scheduled' (disdetta) o 'revoked' (riattivato), altrimenti null. */
export function detectCancellationChange(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    subscription: any,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    previous: any,
): CancellationChange | null {
    if (!previous || !('cancel_at_period_end' in previous || 'cancel_at' in previous)) return null;
    const isScheduled = (v: { cancel_at_period_end?: boolean; cancel_at?: number | null }) =>
        Boolean(v.cancel_at_period_end || v.cancel_at);
    const now = isScheduled(subscription);
    const before = isScheduled({
        cancel_at_period_end: 'cancel_at_period_end' in previous ? previous.cancel_at_period_end : subscription.cancel_at_period_end,
        cancel_at: 'cancel_at' in previous ? previous.cancel_at : subscription.cancel_at,
    });
    if (now && !before) return 'scheduled';
    if (!now && before) return 'revoked';
    return null;
}

function formatDate(unixSeconds: number) {
    return new Date(unixSeconds * 1000).toLocaleDateString('it-IT', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric',
        timeZone: 'Europe/Rome',
    });
}

export async function notifyAdminsOfCancellation(tenantId: string, change: CancellationChange, info: CancellationInfo) {
    const admins = adminEmails();
    const apiKey = process.env.RESEND_API_KEY;
    if (!admins.length || !apiKey) {
        console.warn('[CANCELLATION] ADMIN_EMAILS or RESEND_API_KEY missing');
        return;
    }

    const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!,
        { auth: { autoRefreshToken: false, persistSession: false } }
    );
    const { data: tenant } = await supabase
        .from('tenants')
        .select('restaurant_name, slug, contact_email, owner_id, footer_data')
        .eq('id', tenantId)
        .maybeSingle();
    if (!tenant) return;

    let ownerEmail: string | null = tenant.contact_email;
    if (!ownerEmail && tenant.owner_id) {
        const { data } = await supabase.auth.admin.getUserById(tenant.owner_id);
        ownerEmail = data.user?.email ?? null;
    }

    const name = (tenant.footer_data?.public_name || tenant.restaurant_name) as string;
    const lines = [
        `Locale: ${name}${tenant.slug ? ` (${SITE_URL}/${tenant.slug})` : ''}`,
        `Email: ${ownerEmail ?? 'non trovata'}`,
    ];

    let subject: string;
    if (change === 'scheduled') {
        subject = `Disdetta: ${name}`;
        lines.unshift(`Il ristoratore ha disdetto l'abbonamento dal portale Stripe.`, ``);
        if (info.endsAt) lines.push(`Menu online fino a: ${formatDate(info.endsAt)}`);
        lines.push(`Motivo: ${info.feedback ? FEEDBACK_LABELS[info.feedback] ?? info.feedback : 'non indicato'}`);
        if (info.comment) lines.push(`Commento: ${info.comment}`);
        lines.push(``, `Fino a quella data può annullare la disdetta da Account → Riattiva abbonamento.`);
    } else {
        subject = `Disdetta annullata: ${name}`;
        lines.unshift(`Il ristoratore ha annullato la disdetta: l'abbonamento si rinnoverà normalmente.`, ``);
    }
    lines.push(``, `${SITE_URL}/admin`);

    const { error } = await new Resend(apiKey).emails.send({
        from: '"Go!Food Menù" <help@gofoodmenu.it>',
        to: admins,
        replyTo: ownerEmail ?? undefined,
        subject,
        text: lines.join('\n'),
    });
    if (error) console.error(`[CANCELLATION] Resend error for tenant ${tenantId}:`, error);
}

/**
 * Prima di "Elimina Account": se il locale ha ancora un abbonamento che si rinnova (non disdetto), avvisa gli admin
 * con il cliente Stripe, perché l'eliminazione non lo disdice e il ristoratore non potrà più farlo dal pannello.
 * Non blocca mai l'eliminazione: in caso di errore registra e basta.
 */
export async function notifyAdminsOfDeletionWithSubscription(tenantId: string, ownerEmail: string | null | undefined) {
    try {
        const admins = adminEmails();
        const apiKey = process.env.RESEND_API_KEY;
        if (!admins.length || !apiKey) return;

        const supabase = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.SUPABASE_SERVICE_ROLE_KEY!,
            { auth: { autoRefreshToken: false, persistSession: false } }
        );
        const [{ data: tenant }, { data: billing }] = await Promise.all([
            supabase.from('tenants').select('restaurant_name, slug, subscription_tier, footer_data').eq('id', tenantId).maybeSingle(),
            supabase.from('tenant_billing').select('stripe_customer_id, stripe_subscription_id').eq('tenant_id', tenantId).maybeSingle(),
        ]);
        if (!tenant || tenant.subscription_tier !== 'premium' || !billing?.stripe_subscription_id) return;

        const subscription = await stripe.subscriptions.retrieve(billing.stripe_subscription_id);
        if (!['active', 'past_due', 'unpaid', 'trialing'].includes(subscription.status)) return;
        if (subscription.cancel_at_period_end || subscription.cancel_at) return;

        const name = (tenant.footer_data?.public_name || tenant.restaurant_name) as string;
        const { error } = await new Resend(apiKey).emails.send({
            from: '"Go!Food Menù" <help@gofoodmenu.it>',
            to: admins,
            replyTo: ownerEmail ?? undefined,
            subject: `Account eliminato con abbonamento attivo: ${name}`,
            text: [
                `Il ristoratore ha eliminato l'account senza disdire l'abbonamento: su Stripe continua a rinnovarsi.`,
                ``,
                `Locale: ${name}${tenant.slug ? ` (slug ${tenant.slug})` : ''}`,
                `Email: ${ownerEmail ?? 'non trovata'}`,
                `Cliente Stripe: ${billing.stripe_customer_id ?? 'non trovato'}`,
                `Abbonamento Stripe: ${subscription.id}`,
                ``,
                `Il locale e i suoi dati non esistono più: l'abbonamento va gestito a mano dalla dashboard di Stripe.`,
            ].join('\n'),
        });
        if (error) console.error(`[DELETE_ACCOUNT] Resend error for tenant ${tenantId}:`, error);
    } catch (e) {
        console.error(`[DELETE_ACCOUNT] Subscription check failed for tenant ${tenantId}:`, e);
    }
}
