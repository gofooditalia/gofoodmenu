import postgres from 'postgres';
import * as dotenv from 'dotenv';
dotenv.config();

const connectionString = process.env.DATABASE_URL!;
const sql = postgres(connectionString);

async function main() {
    console.log('Deep audit of public schema...');
    try {
        const tables = await sql`
      SELECT table_name, table_type
      FROM information_schema.tables
      WHERE table_schema = 'public';
    `;
        console.log('Tables:', JSON.stringify(tables, null, 2));

        const checkConstraints = await sql`
      SELECT 
          tc.table_name, 
          conname as constraint_name,
          pg_get_constraintdef(c.oid) as definition
      FROM pg_constraint c
      JOIN pg_namespace n ON n.oid = c.connamespace
      JOIN pg_class cl ON cl.oid = c.conrelid
      JOIN information_schema.table_constraints tc ON tc.constraint_name = conname
      WHERE n.nspname = 'public' AND contype = 'c';
    `;
        console.log('Check Constraints:', JSON.stringify(checkConstraints, null, 2));

        const triggers = await sql`
      SELECT trigger_name, event_manipulation, event_object_table, action_statement
      FROM information_schema.triggers
      WHERE trigger_schema = 'public';
    `;
        console.log('Triggers:', JSON.stringify(triggers, null, 2));

        const views = await sql`
      SELECT table_name
      FROM information_schema.views
      WHERE table_schema = 'public';
    `;
        console.log('Views:', JSON.stringify(views, null, 2));

    } catch (e) {
        console.error('Audit failed:', e);
    } finally {
        await sql.end();
    }
}

main();
