import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';
import * as dotenv from 'dotenv';
import { fileURLToPath } from 'url';

// Load environment variables
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const supabaseUrl = process.env.PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
	console.error('Missing Supabase credentials in .env');
	process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

const MENU_FILE_PATH = path.resolve(process.cwd(), 'example/Menu Completo Ristorante.txt');
const RESTAURANT_SLUG = 'osteria-romana';

async function seed() {
	console.log(`Reading menu from ${MENU_FILE_PATH}...`);
	const rawText = fs.readFileSync(MENU_FILE_PATH, 'utf-8');
	const lines = rawText
		.split('\n')
		.map((l) => l.trim())
		.filter((l) => l.length > 0);

	// Get Profile ID
	const { data: profile, error: profileError } = await supabase
		.from('profiles')
		.select('id')
		.eq('slug', RESTAURANT_SLUG)
		.single();

	if (profileError || !profile) {
		console.error(`Restaurant with slug "${RESTAURANT_SLUG}" not found. Error:`, profileError);
		return;
	}
	const restaurantId = profile.id;
	console.log(`Found restaurant ID: ${restaurantId}`);

	// Delete existing data
	console.log('Cleaning up old data...');
	const { error: deleteDishesError } = await supabase
		.from('dishes')
		.delete()
		.eq('restaurant_id', restaurantId);
	if (deleteDishesError) console.error('Error deleting dishes:', deleteDishesError);

	const { error: deleteCatsError } = await supabase
		.from('categories')
		.delete()
		.eq('restaurant_id', restaurantId);
	if (deleteCatsError) console.error('Error deleting categories:', deleteCatsError);

	// Parse and Insert
	let currentCategoryName = '';
	let currentCategoryId = null;

	for (let i = 0; i < lines.length; i++) {
		const line = lines[i];

		if (line.includes('— €')) {
			// It's a dish
			if (!currentCategoryId) {
				console.warn(`Skipping dish "${line}" because no category is set.`);
				continue;
			}

			const parts = line.split('— €');
			const name = parts[0].trim();
			let priceStr = parts[1].trim();
			// Handle cases like "€4,00" -> 4.00
			priceStr = priceStr.replace(',', '.').replace('€', '');
			const price = parseFloat(priceStr);

			// Check next line for description
			let description = '';
			if (i + 1 < lines.length) {
				const nextLine = lines[i + 1];
				if (!nextLine.includes('— €') && !isLikelyCategory(nextLine)) {
					description = nextLine;
					i++;
				}
			}

			const { error: dishError } = await supabase.from('dishes').insert({
				restaurant_id: restaurantId,
				category_id: currentCategoryId,
				name: name,
				description: description,
				price: price,
				is_available: true
			});

			if (dishError) console.error(`Failed to insert dish ${name}:`, dishError);
			else console.log(`  Added dish: ${name}`);
		} else {
			// Likely a Category
			if (line.length < 3) continue;
			if (line.includes('PAGINA')) continue;

			currentCategoryName = line;
			console.log(`Creating Category: ${currentCategoryName}`);

			const { data: catData, error: catError } = await supabase
				.from('categories')
				.insert({
					restaurant_id: restaurantId,
					name: currentCategoryName
				})
				.select()
				.single();

			if (catError) {
				console.error(`Failed to create category ${currentCategoryName}:`, catError);
				currentCategoryId = null;
			} else {
				currentCategoryId = catData.id;
			}
		}
	}

	console.log('Seeding complete!');
}

function isLikelyCategory(line: string): boolean {
	// Simple heuristic
	return line === line.toUpperCase() && line.length > 3;
}

seed();
