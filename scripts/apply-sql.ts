import postgres from 'postgres';
import * as dotenv from 'dotenv';
import * as fs from 'fs';
import * as path from 'path';

dotenv.config();

const connectionString = process.env.DATABASE_URL!;
const sql = postgres(connectionString);

async function main() {
    const filePath = process.argv[2];
    if (!filePath) {
        console.error('Please provide a path to a SQL file.');
        process.exit(1);
    }

    console.log(`Applying SQL from: ${filePath}`);
    try {
        const query = fs.readFileSync(path.resolve(filePath), 'utf8');
        await sql.unsafe(query);
        console.log('SQL applied successfully.');
    } catch (e) {
        console.error('Failed to apply SQL:', e);
    } finally {
        await sql.end();
    }
}

main();
