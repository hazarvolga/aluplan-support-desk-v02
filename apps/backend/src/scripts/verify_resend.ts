import { PrismaClient } from '@aluplan/database';
import * as dotenv from 'dotenv';
import * as path from 'path';

// Load .env
dotenv.config({ path: path.join(__dirname, '..', '..', '.env'), override: true });

const prisma = new PrismaClient();

async function run() {
  console.log('--- Resend API Verification Tool ---');

  // 1. Check DB
  const dbKey = await prisma.setting.findUnique({ where: { key: 'email.resend.api_key' } });

  // 2. Check ENV
  const envKey = process.env.RESEND_API_KEY;

  console.log('Database Key Status:', dbKey ? 'EXISTS (Warning: This will override .env)' : 'NOT FOUND');
  console.log('Environment Key Status:', envKey ? 'EXISTS in .env' : 'NOT FOUND');

  const finalKey = dbKey?.value || envKey;

  if (!finalKey) {
    console.error('ERROR: No API key found in either DB or .env');
    return;
  }

  console.log('Testing Key (starts with):', finalKey.substring(0, 10) + '...');

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
    console.log('Status Code:', res.status);
    console.log('Response:', body);

    if (res.ok) {
      console.log('\x1b[32mSUCCESS: API Key is VALID!\x1b[0m');
    } else {
      console.log('\x1b[31mFAILURE: API Key is INVALID!\x1b[0m');
      if (res.status === 401) {
        console.error('Error 401: Unauthorized. Please check your API key.');
      }
    }
  } catch (err) {
    console.error('ERROR: Failed to connect to Resend API:', err.message);
  }
}

run()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
