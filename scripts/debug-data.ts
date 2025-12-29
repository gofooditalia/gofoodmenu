import { db } from '../src/lib/db';
import { dishes, profiles } from '../src/lib/db/schema';
import * as dotenv from 'dotenv';
dotenv.config();

async function main() {
    console.log('Debugging dishes data with snake_case schema...');
    try {
        const allDishes = await db.select().from(dishes).limit(5);
        console.log('Sample dishes:', JSON.stringify(allDishes, null, 2));

        const allProfiles = await db.select().from(profiles).limit(2);
        console.log('Profiles:', JSON.stringify(allProfiles, null, 2));

    } catch (e) {
        console.error('Debug failed:', e);
    } finally {
        process.exit(0);
    }
}

main();
