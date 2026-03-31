import { PrismaClient } from '@aluplan/database';
import * as crypto from 'crypto';
import * as dotenv from 'dotenv';
import * as path from 'path';
import * as fs from 'fs';

// Load .env explicitly
const envPath = path.resolve(__dirname, '../.env');
if (fs.existsSync(envPath)) {
    dotenv.config({ path: envPath });
} else {
    console.error('❌ .env not found at root!');
    process.exit(1);
}

const prisma = new PrismaClient();

// Internal Crypto Function matching Backend's CryptoService
const ALGORITHM = 'aes-256-gcm';
const HEX_KEY = process.env.ENCRYPTION_KEY;

if (!HEX_KEY || HEX_KEY.length !== 64) {
    console.error('❌ Invalid or missing ENCRYPTION_KEY in .env (must be 32 bytes hex length 64)');
    process.exit(1);
}

const KEY = Buffer.from(HEX_KEY, 'hex');

function encrypt(text: string): string {
    const iv = crypto.randomBytes(12);
    const cipher = crypto.createCipheriv(ALGORITHM, KEY, iv);
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    const authTag = cipher.getAuthTag().toString('hex');
    return `${iv.toString('hex')}:${authTag}:${encrypted}`;
}

async function main() {
    console.log('🚀 Starting Pre-Flight Production Configuration Seed...');

    // Users & Assignee logic (We get the admin ID to assign updates to)
    const admin = await prisma.user.findFirst({
        where: { email: 'hazarvolga@gmail.com' }
    });

    const adminId = admin ? admin.id : null;

    if (!adminId) {
        console.warn('⚠️ Admin user hazarvolga@gmail.com not found, updatedBy fields will be null.');
    }

    // 1. Settings Data
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

        // STORAGE - CLOUDFLARE R2
        { key: 'storage.provider', value: 'r2', isSecret: false },
        { key: 'storage.r2.endpoint', value: 'https://457188683bc1b5df04c2ef11a013605a.r2.cloudflarestorage.com', isSecret: false },
        { key: 'storage.r2.access_key_id', value: '23d300382474b47fe069a8900ef85175', isSecret: true },
        { key: 'storage.r2.secret_access_key', value: '4f6d2d4e39800edf6a85da491470fd404abd1c6cb4785c622869803fc2d03c6b', isSecret: true },
        { key: 'storage.r2.token', value: 'cfat_vivAwu0aBtZUfpEKAJq4KN8uWr6dzo5WdsHtYPEX4b8eb87b', isSecret: true },
        { key: 'storage.r2.bucket', value: 'aluplan-docs', isSecret: false }, // Default fallback
    ];

    console.log('🔄 Upserting Configurations...');
    for (const setting of settings) {
        const finalValue = setting.isSecret ? encrypt(setting.value) : setting.value;

        // Use standard Prisma upsert
        await prisma.setting.upsert({
            where: { key: setting.key },
            update: {
                value: finalValue,
                isSecret: setting.isSecret,
                updatedBy: adminId,
            },
            create: {
                key: setting.key,
                value: finalValue,
                isSecret: setting.isSecret,
                updatedBy: adminId,
            }
        });
        console.log(` ✅ Set: ${setting.key}`);
    }

    // 2. Dynamics 365 CRM Config
    console.log('\n🔄 Configuring Dynamics 365 CRM...');

    // CRM keys can be stored either in Settings or in CrmConnection model
    // Both mapped to ensure coverage based on earlier DB architecture

    const d365Secret = encrypt('J0n8Q~bkkepIW0RBeqe9pt~NT-GG6GcNp72Vda9u');

    try {
        await prisma.crmConnection.upsert({
            where: { provider: 'DYNAMICS365' },
            create: {
                provider: 'DYNAMICS365',
                instanceUrl: 'https://marketingaluplan.crm4.dynamics.com/',
                tenantId: '0902521f-1c17-498d-99e7-17770cf5bb5f',
                clientId: 'aab421de-0e21-41e3-ab9b-908c2c24b2f9',
                clientSecret: d365Secret,
                isActive: true
            },
            update: {
                instanceUrl: 'https://marketingaluplan.crm4.dynamics.com/',
                tenantId: '0902521f-1c17-498d-99e7-17770cf5bb5f',
                clientId: 'aab421de-0e21-41e3-ab9b-908c2c24b2f9',
                clientSecret: d365Secret,
                isActive: true
            }
        });

        // Ensure API key is also stored if accessed via Settings
        await prisma.setting.upsert({
            where: { key: 'crm.dynamics.api_key' },
            update: { value: encrypt('b2PJTkEctm4muQeTJm'), isSecret: true },
            create: { key: 'crm.dynamics.api_key', value: encrypt('b2PJTkEctm4muQeTJm'), isSecret: true }
        });

        console.log(' ✅ Dynamics 365 Connected and Secured.');
    } catch (e: any) {
        console.warn(` ⚠️ Could not map Dynamics 365 to CrmConnection table: ${e.message}`);
    }

    console.log('\n🎉 Successfully Seated All Credentials into the Local Database!');
    console.log('You can now export this database and import it into your remote server safely.');
}

main()
    .catch(e => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
