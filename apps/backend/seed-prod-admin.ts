import { Client } from 'pg';
import * as bcrypt from 'bcrypt';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.resolve(__dirname, '.env') });

async function main() {
    const url = process.env.DATABASE_URL;
    if (!url) {
        console.error("❌ No DATABASE_URL found in .env");
        process.exit(1);
    }

    console.log(`Connecting to Production DB at ${url.substring(0, 20)}...`);

    const client = new Client({
        connectionString: url,
    });

    await client.connect();

    const adminEmail = process.env.ADMIN_EMAIL || 'admin@example.com';
    const plainPassword = 'Admin123!';
    const hashedPassword = await bcrypt.hash(plainPassword, 10);

    const query = `
    INSERT INTO users (email, "fullName", "passwordHash", "role", "status", "agent_status", "timezone", "language", "max_active_tickets", "created_at", "updated_at")
    VALUES ($1, 'Hazar Ekiz (Admin)', $2, 'ADMIN', 'ACTIVE', 'ONLINE', 'UTC', 'tr', 5, NOW(), NOW())
    ON CONFLICT (email) DO UPDATE 
    SET "role" = 'ADMIN', "passwordHash" = $2;
  `;

    await client.query(query, [adminEmail, hashedPassword]);

    console.log('✅ Admin user', adminEmail, 'successfully ensured as ADMIN via Raw PG query!');

    await client.end();
}

main().catch(console.error);
