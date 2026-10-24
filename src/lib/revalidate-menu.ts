import { revalidatePath } from 'next/cache';
import { TRANSLATED_LANGS } from '@/lib/menu-languages';

const SLUG_RE = /^[a-z0-9-]+$/;

/** Purges the cached public menu pages (ISR) for a tenant slug, translated versions included. */
export function revalidateMenuSlug(slug: string | null | undefined) {
    if (!slug || !SLUG_RE.test(slug)) return;
    revalidatePath(`/${slug}`);
    revalidatePath(`/${slug}/allergeni`);
    for (const lang of TRANSLATED_LANGS) revalidatePath(`/${slug}/${lang}`);
}
