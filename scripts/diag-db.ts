import postgres from 'postgres';
import * as dotenv from 'dotenv';
dotenv.config();

const connectionString = process.env.DATABASE_URL!;
const sql = postgres(connectionString);

async function main() {
	console.log('Listing check constraints...');
	try {
		const constraints = await sql`
      SELECT n.nspname as schema, conname, pg_get_constraintdef(c.oid) as def
      FROM pg_constraint c
      JOIN pg_namespace n ON n.oid = c.connamespace
      WHERE contype = 'c' AND pg_get_constraintdef(c.oid) IS NULL;
    `;
		console.log('Found constraints:', JSON.stringify(constraints, null, 2));
	} catch (e) {
		console.error('Failed to list constraints:', e);
	} finally {
		await sql.end();
	}
}

main();
