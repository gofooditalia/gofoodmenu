import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { stripe } from '@/lib/stripe';
import { getStripeCustomerId, getTenantIdForOwner } from '@/lib/stripe-billing';

export async function POST(req: NextRequest) {
    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return new NextResponse('Unauthorized', { status: 401 });
        }

        const body = await req.json();
        // action 'cancel': il portale si apre direttamente sulla disdetta (pulsante "Disdici abbonamento")
        const { returnUrl, action } = body;
        const returnTo = returnUrl || req.headers.get('origin') + '/dashboard/account';

        // 1. Resolve the tenant's saved Stripe customer
        const tenantId = await getTenantIdForOwner(user.id);
        if (!tenantId) {
            return new NextResponse('Tenant not found', { status: 404 });
        }

        const customerId = await getStripeCustomerId(tenantId);
        if (!customerId) {
            return new NextResponse('No Stripe customer found', { status: 404 });
        }

        // 2. Disdetta: a fine periodo, con motivo facoltativo (configurazione del portale su Stripe).
        // Se non si può aprire il flusso (es. disdetta già programmata) si apre il portale normale.
        if (action === 'cancel') {
            const { data: subscriptions } = await stripe.subscriptions.list({ customer: customerId, status: 'active', limit: 1 });
            const subscription = subscriptions[0];
            if (subscription && !subscription.cancel_at_period_end && !subscription.cancel_at) {
                try {
                    const session = await stripe.billingPortal.sessions.create({
                        customer: customerId,
                        return_url: returnTo,
                        flow_data: {
                            type: 'subscription_cancel',
                            subscription_cancel: { subscription: subscription.id },
                            after_completion: { type: 'redirect', redirect: { return_url: returnTo } },
                        },
                    });
                    return NextResponse.json({ url: session.url });
                } catch (error) {
                    console.error('[STRIPE_PORTAL] Cancel flow error, opening the plain portal:', error);
                }
            }
        }

        // 3. Create Portal Session
        const session = await stripe.billingPortal.sessions.create({
            customer: customerId,
            return_url: returnTo,
        });

        return NextResponse.json({ url: session.url });
    } catch (error) {
        console.error('[STRIPE_PORTAL] Error:', error);
        return new NextResponse('Internal Error', { status: 500 });
    }
}
