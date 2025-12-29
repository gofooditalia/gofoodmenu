import { drizzle } from 'drizzle-orm/postgres-js';
import { migrate } from 'drizzle-orm/postgres-js/migrator';
import postgres from 'postgres';
import * as dotenv from 'dotenv';
dotenv.config();

const connectionString = process.env.DATABASE_URL!;
const sql = postgres(connectionString, { max: 1 });
const db = drizzle(sql);

async function main() {
	console.log('Running migrations...');
	try {
		await migrate(db, { migrationsFolder: './supabase/migrations/drizzle' });
		console.log('Migrations completed successfully.');
	} catch (e) {
		console.error('Migration failed:', e);
	} finally {
		await sql.end();
	}
}

main();
