const { Client } = require('pg');

async function run() {
  const dbUrl = process.env.DATABASE_URL;
  if (!dbUrl) {
    console.error('DATABASE_URL environment variable is missing.');
    process.exit(1);
  }
  
  const client = new Client({ connectionString: dbUrl });
  await client.connect();
  
  try {
    const res = await client.query(
      `DELETE FROM _prisma_migrations WHERE migration_name = '20260303220000_fix_diverged_schema_sla'`
    );
    console.log(`✅ Successfully wiped migration lock. Rows deleted: ${res.rowCount}`);
    console.log('You can now click "Deploy (Force Rebuild)" in Coolify to apply the idempotent migration safely.');
  } catch (err) {
    console.error('Failed to wipe migration lock:', err);
  } finally {
    await client.end();
  }
}

run();
