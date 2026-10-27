'use server';

import { after } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { revalidateMenuSlug } from '@/lib/revalidate-menu';
import { requestMenuTranslation } from '@/lib/menu-translation-jobs';

/**
 * Purges the cached public menu of the current user's tenant.
 * Call after any change to dishes, categories, tenant info, locations or design.
 * `previousSlug` covers slug changes, so the old URL stops serving the menu.
 * For translated menus it also schedules the automatic translation of new or changed items
 * (after the response, grouped with the saves that follow: src/lib/menu-translation-jobs.ts).
 */
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
    if (tenantId) after(() => requestMenuTranslation(tenantId));
}
