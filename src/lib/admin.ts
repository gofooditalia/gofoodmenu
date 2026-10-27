/**
 * Pannello amministratore di Go!Food (/admin): dati su tutti i ristoranti iscritti.
 * Accesso riservato alle email in ADMIN_EMAILS (separate da virgola).
 * Le letture usano la service role e avvengono solo lato server.
 */

import { createClient } from '@supabase/supabase-js';
import { lastVisibleDay } from '@/lib/menu-visibility';

export function isAdminEmail(email: string | null | undefined): boolean {
    if (!email) return false;
    const admins = (process.env.ADMIN_EMAILS || '')
        .split(',')
        .map((e) => e.trim().toLowerCase())
        .filter(Boolean);
    return admins.includes(email.toLowerCase());
}

export function getSupabaseAdmin() {
    return createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!,
        { auth: { autoRefreshToken: false, persistSession: false } }
    );
}

// Account di prova (vedi CLAUDE.md): restano fuori dalla newsletter. Aggiornare se ne nasce uno nuovo.
export const TEST_TENANT_SLUGS = ['ristorante-marina', 'belleepoquepalermo', 'accademia', 'gofood'];
// Account di prova senza slug (registrazione mai completata), riconosciuti dall'id del tenant
export const TEST_TENANT_IDS = [
    'da1f52b7-4d2c-4e09-acef-f0a18df353c8', // "oza", prova di Gabriele
];

export function isTestTenant(t: { id: string; slug: string | null }): boolean {
    return TEST_TENANT_IDS.includes(t.id) || (!!t.slug && TEST_TENANT_SLUGS.includes(t.slug));
}

// Oltre questa soglia senza modifiche al menu il ristorante va ricontattato
export const STALE_MENU_DAYS = 60;

export interface AdminTenantRow {
    id: string;
    restaurantName: string;
    slug: string | null;
    email: string | null;
    tier: string;
    status: string;
    onboardingCompleted: boolean;
    createdAt: string;
    dishCount: number;
    lastMenuUpdate: string | null;
    flags: string[];
}

export interface AdminOverview {
    tenants: AdminTenantRow[];
    totals: {
        total: number;
        configured: number;
        paying: number;
        trialing: number;
        pastDue: number;
        newThisMonth: number;
    };
    mrr: { amount: number; currency: string; subscriptions: number } | null;
}

// Supabase restituisce al massimo 1000 righe per richiesta: si legge a pagine
async function fetchAllDishes(supabase: ReturnType<typeof getSupabaseAdmin>) {
    const pageSize = 1000;
    const rows: { tenant_id: string; updated_at: string }[] = [];
    for (let from = 0; ; from += pageSize) {
        const { data, error } = await supabase
            .from('dishes')
            .select('tenant_id, updated_at')
            .order('id')
            .range(from, from + pageSize - 1);
        if (error) throw error;
        rows.push(...(data ?? []));
        if (!data || data.length < pageSize) break;
    }
    return { data: rows };
}

export function isPaying(tier: string, status: string) {
    return tier !== 'free' && status === 'active';
}

export async function getAdminOverview(): Promise<AdminOverview> {
    const supabase = getSupabaseAdmin();

    const [{ data: tenants, error: tenantsError }, { data: dishes }, usersResult] = await Promise.all([
        supabase
            .from('tenants')
            .select('id, owner_id, restaurant_name, slug, contact_email, subscription_tier, subscription_status, grace_until, onboarding_completed, created_at')
            .order('created_at', { ascending: false }),
        fetchAllDishes(supabase),
        supabase.auth.admin.listUsers({ perPage: 1000 }),
    ]);
    if (tenantsError) throw tenantsError;

    const ownerEmails = new Map<string, string>();
    for (const user of usersResult.data?.users ?? []) {
        if (user.email) ownerEmails.set(user.id, user.email);
    }

    const dishStats = new Map<string, { count: number; last: string | null }>();
    for (const dish of dishes ?? []) {
        const stat = dishStats.get(dish.tenant_id) ?? { count: 0, last: null };
        stat.count += 1;
        if (!stat.last || dish.updated_at > stat.last) stat.last = dish.updated_at;
        dishStats.set(dish.tenant_id, stat);
    }

    const now = Date.now();
    const staleBefore = now - STALE_MENU_DAYS * 24 * 60 * 60 * 1000;
    const monthStart = new Date(new Date().getFullYear(), new Date().getMonth(), 1).getTime();

    const rows: AdminTenantRow[] = (tenants ?? []).map((t) => {
        const stat = dishStats.get(t.id) ?? { count: 0, last: null };
        const flags: string[] = [];
        if (!t.onboarding_completed) flags.push('Configurazione non completata');
        if (stat.count === 0) flags.push('Menu vuoto');
        else if (stat.last && new Date(stat.last).getTime() < staleBefore) {
            flags.push(`Menu fermo da oltre ${STALE_MENU_DAYS} giorni`);
        }
        if (t.subscription_status === 'past_due') {
            // Tolleranza sui pagamenti (src/lib/billing-grace.ts): il menu resta online fino a grace_until
            flags.push(t.grace_until && new Date(t.grace_until).getTime() > now
                ? `Pagamento non riuscito: menu online fino a ${lastVisibleDay(t.grace_until)}`
                : 'Menu sospeso: pagamento non riuscito');
        }

        return {
            id: t.id,
            restaurantName: t.restaurant_name,
            slug: t.slug,
            email: t.contact_email || ownerEmails.get(t.owner_id) || null,
            tier: t.subscription_tier,
            status: t.subscription_status,
            onboardingCompleted: t.onboarding_completed,
            createdAt: t.created_at,
            dishCount: stat.count,
            lastMenuUpdate: stat.last,
            flags,
        };
    });

    return {
        tenants: rows,
        totals: {
            total: rows.length,
            configured: rows.filter((r) => r.onboardingCompleted).length,
            paying: rows.filter((r) => isPaying(r.tier, r.status)).length,
            trialing: rows.filter((r) => r.status === 'trialing').length,
            pastDue: rows.filter((r) => r.status === 'past_due').length,
            newThisMonth: rows.filter((r) => new Date(r.createdAt).getTime() >= monthStart).length,
        },
        mrr: await getStripeMrr(),
    };
}

// Ricavi ricorrenti mensili dagli abbonamenti Stripe attivi (annuali divisi per 12)
async function getStripeMrr(): Promise<AdminOverview['mrr']> {
    if (!process.env.STRIPE_SECRET_KEY) return null;
    try {
        const { stripe } = await import('@/lib/stripe');
        let cents = 0;
        let currency = 'eur';
        let subscriptions = 0;
        for await (const sub of stripe.subscriptions.list({ status: 'active', limit: 100 })) {
            subscriptions += 1;
            for (const item of sub.items.data) {
                const price = item.price;
                if (!price.unit_amount || !price.recurring) continue;
                currency = price.currency;
                const perInterval = price.unit_amount * (item.quantity ?? 1);
                const count = price.recurring.interval_count || 1;
                const monthly =
                    price.recurring.interval === 'year' ? perInterval / (12 * count)
                    : price.recurring.interval === 'week' ? (perInterval * 52) / (12 * count)
                    : price.recurring.interval === 'day' ? (perInterval * 365) / (12 * count)
                    : perInterval / count;
                cents += monthly;
            }
        }
        return { amount: Math.round(cents) / 100, currency: currency.toUpperCase(), subscriptions };
    } catch (error) {
        console.error('[admin] Lettura MRR da Stripe non riuscita:', error);
        return null;
    }
}
