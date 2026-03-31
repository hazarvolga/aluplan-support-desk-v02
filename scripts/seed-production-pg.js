const { Client } = require('pg');
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

// Load environment variables
const envPath = path.resolve(__dirname, '../.env');
if (fs.existsSync(envPath)) {
    dotenv.config({ path: envPath });
} else {
    console.error('❌ .env not found at root!');
    process.exit(1);
}

const ALGORITHM = 'aes-256-gcm';
const HEX_KEY = process.env.ENCRYPTION_KEY;

if (!HEX_KEY || HEX_KEY.length !== 64) {
    console.error('❌ Invalid or missing ENCRYPTION_KEY in .env (must be 32 bytes hex length 64)');
    process.exit(1);
}

const KEY = Buffer.from(HEX_KEY, 'hex');

function encrypt(text) {
    const iv = crypto.randomBytes(12);
    const cipher = crypto.createCipheriv(ALGORITHM, KEY, iv);
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    const authTag = cipher.getAuthTag().toString('hex');
    return `${iv.toString('hex')}:${authTag}:${encrypted}`;
}

async function main() {
    console.log('🚀 Starting Native PG Configuration Seed...');

    const client = new Client({
        connectionString: process.env.DATABASE_URL
    });

    await client.connect();

    try {
        // Get Admin ID
        const adminRes = await client.query(`SELECT id FROM users WHERE email = 'hazarvolga@gmail.com' LIMIT 1`);
        const adminId = adminRes.rows.length > 0 ? adminRes.rows[0].id : null;

        if (!adminId) {
            console.warn('⚠️ Admin user hazarvolga@gmail.com not found, updatedBy fields will be null.');
        }

        const settings = [
            // EMAIL - RESEND
            { key: 'email.provider', value: 'resend', isSecret: false },
            { key: 'email.resend.api_key', value: 're_fupJu99g_BM3sewTw2JtnpG3ezskBSWhB', isSecret: true },

            // AI - GROK / XAI
            { key: 'ai.xai.api_key', value: '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', isSecret: true },
            { key: 'ai.xai.chat_model', value: 'llama3-8b-8192', isSecret: false },

            // AI - OPENAI
            { key: 'ai.openai.api_key', value: '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', isSecret: true },
            { key: 'ai.openai.chat_model', value: 'gpt-4o-mini', isSecret: false },
            { key: 'ai.openai.embed_model', value: 'text-embedding-3-small', isSecret: false },

            // AI - PROVIDERS
            { key: 'ai.chat_provider', value: 'openai', isSecret: false },
            { key: 'ai.embed_provider', value: 'openai', isSecret: false },

            // STORAGE - CLOUDFLARE R2
            { key: 'storage.provider', value: 'r2', isSecret: false },
            { key: 'storage.r2.endpoint', value: 'https://457188683bc1b5df04c2ef11a013605a.r2.cloudflarestorage.com', isSecret: false },
            { key: 'storage.r2.access_key_id', value: '23d300382474b47fe069a8900ef85175', isSecret: true },
            { key: 'storage.r2.secret_access_key', value: '4f6d2d4e39800edf6a85da491470fd404abd1c6cb4785c622869803fc2d03c6b', isSecret: true },
            { key: 'storage.r2.token', value: 'cfat_vivAwu0aBtZUfpEKAJq4KN8uWr6dzo5WdsHtYPEX4b8eb87b', isSecret: true },
            { key: 'storage.r2.bucket', value: 'aluplan-docs', isSecret: false },
        ];

        console.log('🔄 Upserting Configurations into Settings Table...');

        for (const setting of settings) {
            const finalValue = setting.isSecret ? encrypt(setting.value) : setting.value;

            await client.query(`
                INSERT INTO settings (key, value, is_secret, updated_by, updated_at) 
                VALUES ($1, $2, $3, $4, NOW())
                ON CONFLICT (key) 
                DO UPDATE SET value = $2, is_secret = $3, updated_by = $4, updated_at = NOW();
            `, [setting.key, finalValue, setting.isSecret, adminId]);

            console.log(` ✅ Set: ${setting.key}`);
        }

        // Dynamics 365 CRM Config
        console.log('\n🔄 Configuring Dynamics 365 CRM in crm_connections Table...');

        const d365Secret = encrypt('J0n8Q~bkkepIW0RBeqe9pt~NT-GG6GcNp72Vda9u');

        await client.query(`
            INSERT INTO crm_connections (provider, instance_url, tenant_id, client_id, client_secret, is_active, sync_status, created_at, updated_at)
            VALUES ('DYNAMICS_365', 'https://marketingaluplan.crm4.dynamics.com/', '0902521f-1c17-498d-99e7-17770cf5bb5f', 'aab421de-0e21-41e3-ab9b-908c2c24b2f9', $1, true, 'IDLE', NOW(), NOW())
            ON CONFLICT (provider)
            DO UPDATE SET instance_url = 'https://marketingaluplan.crm4.dynamics.com/', tenant_id = '0902521f-1c17-498d-99e7-17770cf5bb5f', client_id = 'aab421de-0e21-41e3-ab9b-908c2c24b2f9', client_secret = $1, is_active = true, updated_at = NOW();
        `, [d365Secret]);

        // Also map API key to settings just in case
        await client.query(`
            INSERT INTO settings (key, value, is_secret, updated_at) 
            VALUES ('crm.dynamics.api_key', $1, true, NOW())
            ON CONFLICT (key) DO UPDATE SET value = $1, is_secret = true, updated_at = NOW();
        `, [encrypt('b2PJTkEctm4muQeTJm')]);

        console.log(' ✅ Dynamics 365 Connected and Secured.');
        console.log('\n🎉 Successfully Seated All Credentials into the Local Database!');

    } catch (err) {
        console.error('❌ Error during execution:', err.message);
    } finally {
        await client.end();
    }
}

main();
