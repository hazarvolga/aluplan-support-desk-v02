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

    try {
        const email = 'test_customer@aluplan.com';
        const fullName = 'Test Customer';
        const password = 'Test1234!';
        const hash = await bcrypt.hash(password, 10);

        console.log(`[DEBUG] Target Email: ${email}`);

        // Get customer role ID (auto-create if missing)
        let roleRes = await client.query("SELECT id FROM roles WHERE LOWER(name) = 'customer' LIMIT 1");
        let roleId;
        if (roleRes.rows.length === 0) {
            console.log("[DEBUG] Role 'customer' not found. Creating it...");
            const insertRoleRes = await client.query(
                "INSERT INTO roles (id, name, description, is_system, created_at, updated_at) VALUES (gen_random_uuid(), 'customer', 'Customer Role', true, NOW(), NOW()) RETURNING id"
            );
            roleId = insertRoleRes.rows[0].id;
        } else {
            roleId = roleRes.rows[0].id;
        }
        console.log(`[DEBUG] Role ID for 'customer': ${roleId}`);

        // Insert user
        const userQuery = `
      INSERT INTO users (email, "fullName", "passwordHash", "role_id", status, timezone, language, created_at, updated_at)
      VALUES ($1, $2, $3, $4, 'ACTIVE', 'UTC', 'tr', NOW(), NOW())
      ON CONFLICT (email) DO UPDATE 
      SET "status" = 'ACTIVE', "passwordHash" = $3, "role_id" = $4
      RETURNING id;
    `;
        const userRes = await client.query(userQuery, [email, fullName, hash, roleId]);
        const userId = userRes.rows[0].id;
        console.log(`[DEBUG] User ID: ${userId}`);

        // Insert/Update CustomerProfile
        const profileQuery = `
      INSERT INTO customer_profiles (user_id, first_name, last_name, customer_no, company_name, crm_verified, created_at, updated_at)
      VALUES ($1, 'Test', 'Customer', $2, 'Aluplan Test Corp', true, NOW(), NOW())
      ON CONFLICT (user_id) DO UPDATE
      SET company_name = 'Aluplan Test Corp', crm_verified = true;
    `;
        const customerNo = `TEST-${Date.now()}`;
        await client.query(profileQuery, [userId, customerNo]);

        console.log(`✅ Test customer ${email} created/activated successfully. PW: ${password}`);
    } catch (err) {
        console.error('❌ Error injecting test customer:', err);
        process.exit(1);
    } finally {
        await client.end();
    }
}

run();
