import { db } from '../src/lib/db';
import {
	categories as categoriesTable,
	dishes as dishesTable,
	profiles as profilesTable
} from '../src/lib/db/schema';
import { eq, and } from 'drizzle-orm';
import * as fs from 'fs';
import * as path from 'path';

const PROFILE_SLUG = 'demo';
const CATEGORY_NAME = 'Gli Antipasti';
const FILE_PATH = './example/GLI ANTIPASTI .txt';

async function run() {
	console.log('--- Starting Antipasti Import ---');

	// 1. Get Profile
	const profile = await db.query.profiles.findFirst({
		where: eq(profilesTable.slug, PROFILE_SLUG)
	});

	if (!profile) {
		console.error(`Profile with slug "${PROFILE_SLUG}" not found.`);
		process.exit(1);
	}

	console.log(`Found Profile: ${profile.restaurant_name} (${profile.id})`);

	// 2. Get or Create Category
	let category = await db.query.categories.findFirst({
		where: and(
			eq(categoriesTable.restaurant_id, profile.id),
			eq(categoriesTable.name, CATEGORY_NAME)
		)
	});

	if (!category) {
		console.log(`Category "${CATEGORY_NAME}" not found. Creating...`);
		const [newCategory] = await db
			.insert(categoriesTable)
			.values({
				restaurant_id: profile.id,
				name: CATEGORY_NAME,
				sort_order: 0
			})
			.returning();
		category = newCategory;
	}

	console.log(`Using Category: ${category.name} (${category.id})`);

	// 3. Parse File
	const content = fs.readFileSync(FILE_PATH, 'utf-8');
	const lines = content
		.split('\n')
		.map((l) => l.trim())
		.filter((l) => l.length > 0);

	const dishes: any[] = [];
	let currentDish: any = null;

	for (let i = 1; i < lines.length; i++) {
		const line = lines[i];

		if (line.includes('— €')) {
			// New Dish
			const [name, priceStr] = line.split('— €').map((s) => s.trim());
			const price = parseFloat(priceStr.replace(',', '.'));

			currentDish = {
				restaurant_id: profile.id,
				category_id: category.id,
				name: name,
				price: price.toString(),
				description: '',
				is_available: true
			};
			dishes.push(currentDish);
		} else if (currentDish) {
			// It's a description for the previous dish
			currentDish.description = line;
		}
	}

	console.log(`Parsed ${dishes.length} dishes.`);

	// 4. Insert Dishes
	for (const dish of dishes) {
		console.log(`Inserting: ${dish.name} - ${dish.price}€`);
		await db.insert(dishesTable).values(dish);
	}

	console.log('--- Import Complete ---');
}

run().catch(console.error);
