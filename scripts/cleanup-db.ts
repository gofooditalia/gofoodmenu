import postgres from 'postgres';
import * as dotenv from 'dotenv';
dotenv.config();

const connectionString = process.env.DATABASE_URL!;
const sql = postgres(connectionString);

async function main() {
	console.log('Dropping check constraint...');
	try {
		await sql`ALTER TABLE public.allergens DROP CONSTRAINT IF EXISTS allergens_number_check;`;
		console.log('Constraint dropped successfully.');
	} catch (e) {
		console.error('Failed to drop constraint:', e);
	} finally {
		await sql.end();
	}
}

main();
