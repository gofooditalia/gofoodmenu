'use server';

import { after } from 'next/server';
import { headers } from 'next/headers';
import { createClient } from '@/lib/supabase/server';
import { getSupabaseAdmin } from '@/lib/admin';
import { revalidateMenuSlug } from '@/lib/revalidate-menu';
import { wantsAutoTranslation } from '@/lib/menu-translation-jobs';

/**
 * Purges the cached public menu of the current user's tenant.
 * Call after any change to dishes, categories, tenant info, locations or design.
 * `previousSlug` covers slug changes, so the old URL stops serving the menu.
 * For translated menus it also schedules the automatic translation of new or changed items
 * (after the response, grouped with the saves that follow: src/lib/menu-translation-jobs.ts).
 */
async function scheduleMenuTranslation(tenantId: string, origin: string) {
    const secret = process.env.CRON_SECRET;
    if (!secret || !process.env.OPENROUTER_API_KEY) return;
    try {
        if (!(await wantsAutoTranslation(getSupabaseAdmin(), tenantId))) return;
        // The work runs in its own request: revalidatePath inside after() did not purge the menu on Vercel
        const bypass = process.env.VERCEL_AUTOMATION_BYPASS_SECRET; // protected preview deployments
        const res = await fetch(`${origin}/api/menu-translation`, {
            method: 'POST',
            headers: {
                authorization: `Bearer ${secret}`,
                'content-type': 'application/json',
                ...(bypass ? { 'x-vercel-protection-bypass': bypass } : {}),
            },
            body: JSON.stringify({ tenantId }),
        });
        if (!res.ok) console.error('[menu-translation] Route answered', res.status);
    } catch (error) {
        // Never surfaces to the restaurant owner: the hourly cron catches up
        console.error('[menu-translation] Request failed:', error);
    }
}

export async function revalidatePublicMenu(previousSlug?: string | null) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: tenant } = await (supabase.from('tenants') as any)
        .select('id, slug')
        .eq('owner_id', user.id)
        .maybeSingle();

    revalidateMenuSlug(tenant?.slug);
    if (previousSlug && previousSlug !== tenant?.slug) {
        revalidateMenuSlug(previousSlug);
    }

    const tenantId: string | undefined = tenant?.id;
    if (tenantId) {
        const h = await headers();
        const host = h.get('x-forwarded-host') ?? h.get('host');
        const proto = h.get('x-forwarded-proto') ?? (host?.startsWith('localhost') ? 'http' : 'https');
        if (host) after(() => scheduleMenuTranslation(tenantId, `${proto}://${host}`));
    }
}
