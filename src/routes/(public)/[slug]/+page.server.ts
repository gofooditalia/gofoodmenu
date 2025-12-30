import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { db } from '$lib/db';
import {
	profiles as profilesTable,
	categories as categoriesTable,
	allergens as allergensTable
} from '$lib/db/schema';
import { eq, asc } from 'drizzle-orm';

export const load: PageServerLoad = async ({ params }) => {
	const { slug } = params;

	// Fetch restaurant profile
	const profile = await db.query.profiles.findFirst({
		where: eq(profilesTable.slug, slug)
	});

	if (!profile) {
		throw error(404, 'Ristorante non trovato');
	}

	// Fetch categories with dishes
	// Using relational queries for cleaner nesting
	const categories = await db.query.categories.findMany({
		where: eq(categoriesTable.restaurant_id, profile.id),
		orderBy: [asc(categoriesTable.sort_order)],
		with: {
			dishes: true
		}
	});

	// Fetch allergens for mapping
	const allergens = await db.query.allergens.findMany({
		orderBy: [asc(allergensTable.number)]
	});

	return {
		profile,
		categories: categories || [],
		allergens: allergens || []
	};
};
