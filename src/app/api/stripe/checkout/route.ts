import { NextRequest, NextResponse } from 'next/server';
import { createClient as createSupabaseServerClient } from '@/lib/supabase/server';
import { stripe } from '@/lib/stripe';
import { getReusableCustomerId } from '@/lib/stripe-billing';
import { createClient } from '@supabase/supabase-js';
import { SLUG_PATTERN, SLUG_MIN_LENGTH, isReservedSlug } from '@/lib/reserved-slugs';

export async function POST(req: NextRequest) {
    try {
        const supabase = await createSupabaseServerClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return new NextResponse('Unauthorized', { status: 401 });
        }

        const body = await req.json();
        const { desiredSlug, returnUrl } = body;

        console.log('[CHECKOUT] Request body:', { desiredSlug, returnUrl });

        // 1. Get Tenant using Prisma (Bypasses RLS)
        console.log('[CHECKOUT] Authenticated user:', user.id);

        // Use Supabase Service Role to bypass RLS
        const supabaseAdmin = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.SUPABASE_SERVICE_ROLE_KEY!,
            {
                auth: {
                    autoRefreshToken: false,
                    persistSession: false
                }
            }
        );

        // Fetch tenant using admin client
        const { data: tenant, error: tenantError } = await supabaseAdmin
            .from('tenants')
            .select('id, restaurant_name, slug')
            .eq('owner_id', user.id)
            .single();

        if (tenantError || !tenant) {
            console.error('Tenant fetch error:', tenantError);
            return NextResponse.json(
                { error: 'Tenant not found' },
                { status: 404 }
            );
        }

        // 2. Validate & Unique Slug
        let finalSlug = desiredSlug;
        if (desiredSlug) {
            // Basic format check
            if (!SLUG_PATTERN.test(desiredSlug)) {
                return new NextResponse('Invalid slug format', { status: 400 });
            }

            // Ensure uniqueness. Slug riservati (rotte del sito) o troppo corti passano al suffisso
            // -1, -2… come uno slug occupato: lo slug è generato dal nome e il ristoratore non può cambiarlo.
            let isUnique = false;
            let counter = 0;

            while (!isUnique) {
                const checkSlug = counter === 0 ? desiredSlug : `${desiredSlug}-${counter}`;

                if (isReservedSlug(checkSlug) || checkSlug.length < SLUG_MIN_LENGTH) {
                    counter++;
                    continue;
                }

                const { data: existing } = await supabaseAdmin
                    .from('tenants')
                    .select('id')
                    .eq('slug', checkSlug)
                    .neq('id', tenant.id)
                    .maybeSingle();

                if (!existing) {
                    finalSlug = checkSlug;
                    isUnique = true;
                } else {
                    counter++;
                }
            }
        }

        const priceId = process.env.STRIPE_PRICE_ID;
        if (!priceId) {
            console.error('STRIPE_PRICE_ID is missing');
            return new NextResponse('Server configuration error', { status: 500 });
        }

        // 3. Create Checkout Session (reusing the tenant's Stripe customer if it has one)
        const existingCustomerId = await getReusableCustomerId(tenant.id);

        const session = await stripe.checkout.sessions.create({
            mode: 'subscription',
            payment_method_types: ['card'],
            line_items: [
                {
                    price: priceId,
                    quantity: 1,
                },
            ],
            metadata: {
                tenantId: tenant.id,
                desiredSlug: finalSlug || '', // Will be used in webhook to update slug
                userId: user.id
            },
            subscription_data: {
                metadata: {
                    tenantId: tenant.id,
                    desiredSlug: finalSlug || '',
                    userId: user.id
                }
            },
            ...(existingCustomerId
                ? { customer: existingCustomerId }
                : { customer_email: user.email || undefined }), // Pre-fill email for new customers
            success_url: `${returnUrl || req.headers.get('origin')}/dashboard?payment=success&session_id={CHECKOUT_SESSION_ID}&new_slug=${finalSlug}`,
            cancel_url: `${returnUrl || req.headers.get('origin')}/dashboard?payment=canceled`,
            allow_promotion_codes: true,
            billing_address_collection: 'required',
        });

        return NextResponse.json({ url: session.url });
    } catch (error) {
        console.error('[STRIPE_CHECKOUT] Error creating session:', error);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const errorMessage = (error as any)?.message || 'Unknown error';
        return new NextResponse(`Internal Error: ${errorMessage}`, { status: 500 });
    }
}
