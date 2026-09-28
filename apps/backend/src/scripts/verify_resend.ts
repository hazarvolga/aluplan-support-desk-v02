import { PrismaClient } from '@aluplan/database';
import * as dotenv from 'dotenv';
import * as path from 'path';
import { createCliLogger } from '../common/utils/cli-logger';

const cliLogger = createCliLogger('VerifyResend');

// Load .env
dotenv.config({ path: path.join(__dirname, '..', '..', '.env'), override: true });

const prisma = new PrismaClient();

async function run() {
  cliLogger.log('--- Resend API Verification Tool ---');

  // 1. Check DB
  const dbKey = await prisma.setting.findUnique({ where: { key: 'email.resend.api_key' } });

  // 2. Check ENV
  const envKey = process.env.RESEND_API_KEY;

  cliLogger.log('Database Key Status:', dbKey ? 'EXISTS (Warning: This will override .env)' : 'NOT FOUND');
  cliLogger.log('Environment Key Status:', envKey ? 'EXISTS in .env' : 'NOT FOUND');

  const finalKey = dbKey?.value || envKey;

  if (!finalKey) {
    cliLogger.error('ERROR: No API key found in either DB or .env');
    return;
  }

  cliLogger.log('Testing Key (starts with):', finalKey.substring(0, 10) + '...');

  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${finalKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'onboarding@resend.dev',
        to: 'delivered@resend.dev',
        subject: 'Diagnostic Test',
        text: 'This is a diagnostic test from the verification script.',
      }),
    });

    const body = await res.text();
    cliLogger.log('Status Code:', res.status);
    cliLogger.log('Response:', body);

    if (res.ok) {
      cliLogger.log('\x1b[32mSUCCESS: API Key is VALID!\x1b[0m');
    } else {
      cliLogger.log('\x1b[31mFAILURE: API Key is INVALID!\x1b[0m');
      if (res.status === 401) {
        cliLogger.error('Error 401: Unauthorized. Please check your API key.');
      }
    }
  } catch (err) {
    cliLogger.error('ERROR: Failed to connect to Resend API:', err.message);
  }
}

run()
  .catch((error) => cliLogger.error(error))
  .finally(() => prisma.$disconnect());
