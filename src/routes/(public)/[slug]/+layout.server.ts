import { error } from '@sveltejs/kit';
import { db } from '$lib/db';
import { profiles as profilesTable, allergens as allergensTable } from '$lib/db/schema';
import { eq, asc } from 'drizzle-orm';
import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async ({ params }) => {
    const { slug } = params;

    const profile = await db.query.profiles.findFirst({
        where: eq(profilesTable.slug, slug)
    });

    if (!profile) {
        throw error(404, 'Ristorante non trovato');
    }

    const allergens = await db.query.allergens.findMany({
        orderBy: [asc(allergensTable.number)]
    });

    return {
        profile,
        allergens: allergens || []
    };
};
