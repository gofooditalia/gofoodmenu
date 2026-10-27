/**
 * Avviso agli admin (ADMIN_EMAILS) quando un ristoratore disdice l'abbonamento dal portale Stripe, o annulla
 * la disdetta. Il webhook lo chiama su customer.subscription.updated, confrontando cancel_at_period_end /
 * cancel_at con i valori precedenti dell'evento. Solo lato server (service role).
 */

import { createClient } from '@supabase/supabase-js';
import { Resend } from 'resend';
import { SITE_URL } from '@/lib/site';
import { adminEmails } from '@/lib/billing-grace';

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
