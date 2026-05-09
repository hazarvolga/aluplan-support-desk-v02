const { Client } = require('pg');
const bcrypt = require('bcryptjs');

async function run() {
  const dbUrl = process.env.DATABASE_URL;
  if (!dbUrl) {
    console.error('DATABASE_URL environment variable is missing.');
    process.exit(1);
  }

  const client = new Client({ connectionString: dbUrl });
  await client.connect();

  const hash = await bcrypt.hash('Vol1872017', 10);
  const adminEmail = process.env.ADMIN_EMAIL || 'admin@example.com';
  const query = `
    INSERT INTO users (email, "fullName", "passwordHash", "role", "status", "agent_status", "timezone", "language", "max_active_tickets", "created_at", "updated_at")
    VALUES ($2, 'Hazar Ekiz (Admin)', $1, 'ADMIN', 'ACTIVE', 'ONLINE', 'UTC', 'tr', 5, NOW(), NOW())
    ON CONFLICT (email) DO UPDATE 
    SET "role" = 'ADMIN', "passwordHash" = $1;
  `;

  await client.query(query, [hash, adminEmail]);
  console.log(`✅ Admin user ${adminEmail} created/updated successfully.`);

  await client.end();
}

run().catch(console.error);
