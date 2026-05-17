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

function requiredEnv(name) {
    const value = process.env[name];
    if (!value) {
        throw new Error(`Missing required environment variable: ${name}`);
    }
    return value;
}

function optionalSetting(settings, key, envName, isSecret = true) {
    const value = process.env[envName];
    if (value) {
        settings.push({ key, value, isSecret });
    }
}

async function main() {
    console.log('🚀 Starting Native PG Configuration Seed...');

    const client = new Client({
        connectionString: process.env.DATABASE_URL
    });

    await client.connect();

    try {
        // Get Admin ID
        const adminEmail = process.env.ADMIN_EMAIL || 'admin@example.com';
        const adminRes = await client.query(`SELECT id FROM users WHERE email = $1 LIMIT 1`, [adminEmail]);
        const adminId = adminRes.rows[0]?.id;

        if (!adminId) {
            console.warn(`⚠️ Admin user ${adminEmail} not found, updatedBy fields will be null.`);
        }

        const settings = [
            // EMAIL - RESEND
            { key: 'email.provider', value: 'resend', isSecret: false },
            { key: 'ai.openai.chat_model', value: 'gpt-4o-mini', isSecret: false },
            { key: 'ai.openai.embed_model', value: 'text-embedding-3-small', isSecret: false },

            // AI - PROVIDERS
            { key: 'ai.chat_provider', value: 'openai', isSecret: false },
            { key: 'ai.embed_provider', value: 'openai', isSecret: false },

            // STORAGE - CLOUDFLARE R2
            { key: 'storage.provider', value: 'r2', isSecret: false },
            { key: 'storage.r2.endpoint', value: process.env.STORAGE_ENDPOINT || '', isSecret: false },
            { key: 'storage.r2.bucket', value: process.env.STORAGE_BUCKET || 'aluplan-docs', isSecret: false },
        ];

        optionalSetting(settings, 'email.resend.api_key', 'RESEND_API_KEY');
        optionalSetting(settings, 'ai.xai.api_key', 'XAI_API_KEY');
        optionalSetting(settings, 'ai.openai.api_key', 'OPENAI_API_KEY');
        optionalSetting(settings, 'storage.r2.access_key_id', 'STORAGE_ACCESS_KEY');
        optionalSetting(settings, 'storage.r2.secret_access_key', 'STORAGE_SECRET_KEY');
        optionalSetting(settings, 'storage.r2.token', 'STORAGE_R2_TOKEN');

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

        const d365Secret = encrypt(requiredEnv('DYNAMICS_CLIENT_SECRET'));

        await client.query(`
            INSERT INTO crm_connections (provider, instance_url, tenant_id, client_id, client_secret, is_active, sync_status, created_at, updated_at)
            VALUES ('DYNAMICS_365', $2, $3, $4, $1, true, 'IDLE', NOW(), NOW())
            ON CONFLICT (provider)
            DO UPDATE SET instance_url = $2, tenant_id = $3, client_id = $4, client_secret = $1, is_active = true, updated_at = NOW();
        `, [
            d365Secret,
            requiredEnv('DYNAMICS_INSTANCE_URL'),
            requiredEnv('DYNAMICS_TENANT_ID'),
            requiredEnv('DYNAMICS_CLIENT_ID'),
        ]);

        // Also map API key to settings just in case
        await client.query(`
            INSERT INTO settings (key, value, is_secret, updated_at) 
            VALUES ('crm.dynamics.api_key', $1, true, NOW())
            ON CONFLICT (key) DO UPDATE SET value = $1, is_secret = true, updated_at = NOW();
        `, [encrypt(requiredEnv('CRM_API_KEY'))]);

        console.log(' ✅ Dynamics 365 Connected and Secured.');
        console.log('\n🎉 Successfully Seated All Credentials into the Local Database!');

    } catch (err) {
        console.error('❌ Error during execution:', err.message);
    } finally {
        await client.end();
    }
}

main();
