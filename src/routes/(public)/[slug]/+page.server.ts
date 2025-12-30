import type { PageServerLoad } from './$types';
import { db } from '$lib/db';
import {
	categories as categoriesTable
} from '$lib/db/schema';
import { eq, asc } from 'drizzle-orm';

export const load: PageServerLoad = async ({ parent }) => {
	const { profile } = await parent();

	// Fetch categories with dishes
	const categories = await db.query.categories.findMany({
		where: eq(categoriesTable.restaurant_id, profile.id),
		orderBy: [asc(categoriesTable.sort_order)],
		with: {
			dishes: true
		}
	});

	return {
		categories: categories || []
	};
};
