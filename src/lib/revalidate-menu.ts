import { revalidatePath } from 'next/cache';
import { TRANSLATED_LANGS } from '@/lib/menu-languages';

const SLUG_RE = /^[a-z0-9-]+$/;

/** Purges the cached public menu pages (ISR) for a tenant slug: menu, allergens (translated versions included) and the contact card (/info). */
export function revalidateMenuSlug(slug: string | null | undefined) {
    if (!slug || !SLUG_RE.test(slug)) return;
    revalidatePath(`/${slug}`);
    revalidatePath(`/${slug}/allergeni`);
    revalidatePath(`/${slug}/info`);
    for (const lang of TRANSLATED_LANGS) {
        revalidatePath(`/${slug}/${lang}`);
        revalidatePath(`/${slug}/${lang}/allergeni`);
    }
}
