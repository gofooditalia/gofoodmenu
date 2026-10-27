import { createClient } from '@supabase/supabase-js';
import { stripe } from '@/lib/stripe';

// tenant_billing is service-role only (RLS on, no policies) - never use a user client here.
function getSupabaseAdmin() {
    return createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!,
        { auth: { autoRefreshToken: false, persistSession: false } }
    );
}

export async function getTenantIdForOwner(ownerId: string): Promise<string | null> {
    const { data } = await getSupabaseAdmin()
        .from('tenants')
        .select('id')
        .eq('owner_id', ownerId)
        .maybeSingle();
    return data?.id ?? null;
}

export async function saveTenantBilling(
    tenantId: string,
    ids: { stripeCustomerId?: string | null; stripeSubscriptionId?: string | null }
) {
    const row: Record<string, string> = { tenant_id: tenantId };
    if (ids.stripeCustomerId) row.stripe_customer_id = ids.stripeCustomerId;
    if (ids.stripeSubscriptionId) row.stripe_subscription_id = ids.stripeSubscriptionId;

    const { error } = await getSupabaseAdmin()
        .from('tenant_billing')
        .upsert(row, { onConflict: 'tenant_id' });
    if (error) throw error;
}

export async function findTenantIdBySubscription(subscriptionId: string): Promise<string | null> {
    const { data } = await getSupabaseAdmin()
        .from('tenant_billing')
        .select('tenant_id')
        .eq('stripe_subscription_id', subscriptionId)
        .maybeSingle();
    return data?.tenant_id ?? null;
}

const LIVE_STATUSES = ['active', 'trialing', 'past_due', 'unpaid'];

async function searchTenantSubscriptions(tenantId: string) {
    const result = await stripe.subscriptions.search({
        query: `metadata['tenantId']:'${tenantId}'`,
        limit: 10,
    });
    return result.data;
}

/**
 * Whether a Stripe subscription event should change the tenant's state.
 * A tenant can have stale subscriptions (e.g. a failed first checkout that
 * later expires as incomplete_expired) - those must not touch the tenant.
 */
export async function isCurrentSubscription(tenantId: string, subscriptionId: string): Promise<boolean> {
    const { data } = await getSupabaseAdmin()
        .from('tenant_billing')
        .select('stripe_subscription_id')
        .eq('tenant_id', tenantId)
        .maybeSingle();
    if (data?.stripe_subscription_id) return data.stripe_subscription_id === subscriptionId;

    // Legacy tenants (subscribed before tenant_billing): current unless another live one exists
    const subscriptions = await searchTenantSubscriptions(tenantId);
    return !subscriptions.some(sub => sub.id !== subscriptionId && LIVE_STATUSES.includes(sub.status));
}

/**
 * Stripe customer for a tenant. Uses the saved ID; for tenants that subscribed
 * before tenant_billing existed, falls back to the subscription's tenantId
 * metadata (set at checkout) and saves what it finds.
 */
export async function getStripeCustomerId(tenantId: string): Promise<string | null> {
    const { data } = await getSupabaseAdmin()
        .from('tenant_billing')
        .select('stripe_customer_id')
        .eq('tenant_id', tenantId)
        .maybeSingle();
    if (data?.stripe_customer_id) return data.stripe_customer_id;

    const subscriptions = await searchTenantSubscriptions(tenantId);
    const subscription = subscriptions.find(sub => LIVE_STATUSES.includes(sub.status)) ?? subscriptions[0];
    if (!subscription) return null;

    const customerId = typeof subscription.customer === 'string'
        ? subscription.customer
        : subscription.customer.id;

    await saveTenantBilling(tenantId, {
        stripeCustomerId: customerId,
        stripeSubscriptionId: subscription.id,
    });
    return customerId;
}

/**
 * Saved Stripe customer to reuse at checkout, so a tenant that subscribes again
 * doesn't get a new duplicate customer. Null if none saved or it was deleted in Stripe.
 */
export async function getReusableCustomerId(tenantId: string): Promise<string | null> {
    const { data } = await getSupabaseAdmin()
        .from('tenant_billing')
        .select('stripe_customer_id')
        .eq('tenant_id', tenantId)
        .maybeSingle();
    if (!data?.stripe_customer_id) return null;

    try {
        const customer = await stripe.customers.retrieve(data.stripe_customer_id);
        return customer.deleted ? null : customer.id;
    } catch {
        return null;
    }
}

/**
 * Whether the tenant still has a subscription that will renew (live and not scheduled to cancel).
 * "Elimina Account" is blocked until it's cancelled. Throws if Stripe can't be reached: callers must not
 * treat that as "no subscription".
 */
export async function hasRenewingSubscription(tenantId: string): Promise<boolean> {
    const customerId = await getStripeCustomerId(tenantId);
    if (!customerId) return false;

    const { data } = await stripe.subscriptions.list({ customer: customerId, status: 'all', limit: 20 });
    return data.some(sub => LIVE_STATUSES.includes(sub.status) && !sub.cancel_at_period_end && !sub.cancel_at);
}
