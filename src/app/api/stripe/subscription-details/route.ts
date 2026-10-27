import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { stripe } from '@/lib/stripe';
import { getStripeCustomerId, getTenantIdForOwner } from '@/lib/stripe-billing';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return new NextResponse('Unauthorized', { status: 401 });
        }

        // 1. Resolve the tenant's saved Stripe customer
        const tenantId = await getTenantIdForOwner(user.id);
        const customerId = tenantId ? await getStripeCustomerId(tenantId) : null;

        if (!customerId) {
            return NextResponse.json({ subscription: null });
        }

        // 2. List Active Subscriptions
        const subscriptions = await stripe.subscriptions.list({
            customer: customerId,
            status: 'active',
            limit: 1,
        });

        if (subscriptions.data.length === 0) {
            // Check for other statuses?
            const otherSubs = await stripe.subscriptions.list({
                customer: customerId,
                limit: 1,
            });
            if (otherSubs.data.length > 0) {
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                const sub: any = otherSubs.data[0];
                // Return the most recent one even if not active (e.g. past_due, trialing)
                return NextResponse.json({
                    status: sub.status,
                    current_period_end: sub.current_period_end,
                    cancel_at_period_end: sub.cancel_at_period_end,
                    cancel_at: sub.cancel_at,
                });
            }
            return NextResponse.json({ subscription: null });
        }

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const sub: any = subscriptions.data[0];

        return NextResponse.json({
            status: sub.status,
            current_period_end: sub.current_period_end,
            cancel_at_period_end: sub.cancel_at_period_end,
            cancel_at: sub.cancel_at,
        });

    } catch (error) {
        console.error('[STRIPE_DETAILS] Error:', error);
        return new NextResponse('Internal Error', { status: 500 });
    }
}
