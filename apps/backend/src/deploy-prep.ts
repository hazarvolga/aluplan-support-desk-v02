import { PrismaClient } from '@aluplan/database';
import * as crypto from 'crypto';
import * as dotenv from 'dotenv';
import * as path from 'path';
import * as fs from 'fs';
import { createCliLogger } from './common/utils/cli-logger';

const cliLogger = createCliLogger('DeployPrep');

// Load .env explicitly
const envPath = path.resolve(__dirname, '../.env');
if (fs.existsSync(envPath)) {
    dotenv.config({ path: envPath });
} else {
    cliLogger.error('❌ .env not found at root!');
    process.exit(1);
}

const prisma = new PrismaClient();

// Internal Crypto Function matching Backend's CryptoService
const ALGORITHM = 'aes-256-gcm';
const HEX_KEY = process.env.ENCRYPTION_KEY;

if (!HEX_KEY || HEX_KEY.length !== 64) {
    cliLogger.error('❌ Invalid or missing ENCRYPTION_KEY in .env (must be 32 bytes hex length 64)');
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
    cliLogger.log('🚀 Starting Pre-Flight Production Configuration Seed...');

    // Users & Assignee logic (We get the admin ID to assign updates to)
    const adminEmail = process.env.ADMIN_EMAIL || 'admin@example.com';
    const admin = await prisma.user.findFirst({
        where: { email: adminEmail }
    });

    const adminId = admin ? admin.id : null;

    if (!adminId) {
        cliLogger.warn(`⚠️ Admin user ${adminEmail} not found, updatedBy fields will be null.`);
    }

    // 1. Settings Data
    const settings = [
        // EMAIL - RESEND
        { key: 'email.provider', value: 'resend', isSecret: false },
        { key: 'email.resend.api_key', value: process.env.RESEND_API_KEY || '', isSecret: true },

        // AI - GROK / XAI
        { key: 'ai.xai.api_key', value: process.env.XAI_API_KEY || '', isSecret: true },
        { key: 'ai.xai.chat_model', value: process.env.XAI_CHAT_MODEL || 'llama3-8b-8192', isSecret: false },

        // AI - OPENAI
        { key: 'ai.openai.api_key', value: process.env.OPENAI_API_KEY || '', isSecret: true },
        { key: 'ai.openai.chat_model', value: process.env.OPENAI_CHAT_MODEL || 'gpt-4o-mini', isSecret: false },
        { key: 'ai.openai.embed_model', value: process.env.OPENAI_EMBED_MODEL || 'text-embedding-3-small', isSecret: false },

        // STORAGE - CLOUDFLARE R2
        { key: 'storage.provider', value: 'r2', isSecret: false },
        { key: 'storage.r2.endpoint', value: process.env.R2_ENDPOINT || '', isSecret: false },
        { key: 'storage.r2.access_key_id', value: process.env.R2_ACCESS_KEY_ID || '', isSecret: true },
        { key: 'storage.r2.secret_access_key', value: process.env.R2_SECRET_ACCESS_KEY || '', isSecret: true },
        { key: 'storage.r2.token', value: process.env.R2_TOKEN || '', isSecret: true },
        { key: 'storage.r2.bucket', value: process.env.R2_BUCKET || 'aluplan-docs', isSecret: false }, // Default fallback
    ];

    cliLogger.log('🔄 Upserting Configurations...');
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
        cliLogger.log(` ✅ Set: ${setting.key}`);
    }

    // 2. Dynamics 365 CRM Config
    cliLogger.log('\n🔄 Configuring Dynamics 365 CRM...');

    // CRM keys can be stored either in Settings or in CrmConnection model
    // Both mapped to ensure coverage based on earlier DB architecture

    const d365Secret = encrypt(process.env.DYNAMICS365_CLIENT_SECRET || '');

    try {
        const existingCrm = await prisma.crmConnection.findFirst({
            where: { provider: 'DYNAMICS_365' }
        });
        const d365Data = {
            instanceUrl: process.env.DYNAMICS365_INSTANCE_URL || 'https://marketingaluplan.crm4.dynamics.com/',
            tenantId: process.env.DYNAMICS365_TENANT_ID || '',
            clientId: process.env.DYNAMICS365_CLIENT_ID || '',
            clientSecret: d365Secret,
            isActive: true
        };
        if (existingCrm) {
            await prisma.crmConnection.update({ where: { id: existingCrm.id }, data: d365Data });
        } else {
            await prisma.crmConnection.create({ data: { provider: 'DYNAMICS_365', ...d365Data } });
        }

        // Ensure API key is also stored if accessed via Settings
        await prisma.setting.upsert({
            where: { key: 'crm.dynamics.api_key' },
            update: { value: encrypt(process.env.DYNAMICS365_API_KEY || ''), isSecret: true },
            create: { key: 'crm.dynamics.api_key', value: encrypt(process.env.DYNAMICS365_API_KEY || ''), isSecret: true }
        });

        cliLogger.log(' ✅ Dynamics 365 Connected and Secured.');
    } catch (e: any) {
        cliLogger.warn(` ⚠️ Could not map Dynamics 365 to CrmConnection table: ${e.message}`);
    }

    cliLogger.log('\n🎉 Successfully Seated All Credentials into the Local Database!');
    cliLogger.log('You can now export this database and import it into your remote server safely.');
}

main()
    .catch(e => {
        cliLogger.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
