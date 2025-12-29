import { db } from '../src/lib/db';
import { profiles, categories, dishes } from '../src/lib/db/schema';
import { eq } from 'drizzle-orm';
import * as dotenv from 'dotenv';
dotenv.config();

async function main() {
    const slug = 'demo';
    console.log(`Checking data for slug: ${slug}`);

    const profile = await db.query.profiles.findFirst({
        where: eq(profiles.slug, slug)
    });

    if (!profile) {
        console.log('Profile not found');
        return;
    }

    console.log('Profile ID:', profile.id);

    const cats = await db.query.categories.findMany({
        where: eq(categories.restaurant_id, profile.id),
        with: {
            dishes: true
        }
    });

    console.log(`Found ${cats.length} categories`);
    cats.forEach(c => {
        console.log(`Category: ${c.name} (ID: ${c.id}), Dishes: ${c.dishes.length}`);
    });

    process.exit(0);
}

main();
