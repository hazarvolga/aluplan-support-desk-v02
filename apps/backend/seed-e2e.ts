/**
 * Seed test users for Playwright E2E.
 *
 * Idempotent — safe to re-run. Reads credentials from env vars so CI can
 * inject secrets without committing them. Falls back to opinionated defaults
 * for local development that match `apps/frontend/e2e/helpers/auth.ts`.
 *
 * Run with:
 *   pnpm --filter @aluplan/backend exec tsx seed-e2e.ts
 */
import { PrismaClient } from '@aluplan/database';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import * as bcrypt from 'bcryptjs';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.resolve(__dirname, '.env') });

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool as any);
const prisma = new PrismaClient({ adapter });

const ADMIN = {
    email: process.env.E2E_ADMIN_EMAIL || 'e2e-admin@aluplan.test',
    password: process.env.E2E_ADMIN_PASSWORD || 'E2eAdmin!Pass123',
    fullName: 'E2E Admin',
    roleName: 'ADMIN',
};

const AGENT = {
    email: process.env.E2E_AGENT_EMAIL || 'e2e-agent@aluplan.test',
    password: process.env.E2E_AGENT_PASSWORD || 'E2eAgent!Pass123',
    fullName: 'E2E Agent',
    roleName: 'AGENT',
};

const CUSTOMER = {
    email: process.env.E2E_CUSTOMER_EMAIL || 'e2e-customer@aluplan.test',
    password: process.env.E2E_CUSTOMER_PASSWORD || 'E2eCustomer!Pass123',
    fullName: 'E2E Customer',
    roleName: 'CUSTOMER',
};

async function ensureRole(name: string) {
    const existing = await prisma.role.findFirst({ where: { name } });
    if (existing) return existing;
    return prisma.role.create({
        data: { name, description: `${name} role (seeded by seed-e2e.ts)` },
    });
}

async function ensureUser(spec: { email: string; password: string; fullName: string; roleName: string }) {
    const role = await ensureRole(spec.roleName);
    const passwordHash = await bcrypt.hash(spec.password, 10);

    const user = await prisma.user.upsert({
        where: { email: spec.email },
        update: {
            passwordHash,
            fullName: spec.fullName,
            roleId: role.id,
            status: 'ACTIVE',
            deletedAt: null,
        },
        create: {
            email: spec.email,
            passwordHash,
            fullName: spec.fullName,
            roleId: role.id,
            status: 'ACTIVE',
        },
    });

    return user;
}

async function main() {
    const created: Array<{ role: string; email: string }> = [];
    for (const spec of [ADMIN, AGENT, CUSTOMER]) {
        const user = await ensureUser(spec);
        created.push({ role: spec.roleName, email: user.email });
    }

    console.log('\nE2E test users seeded:');
    for (const u of created) {
        console.log(`  ${u.role.padEnd(10)} ${u.email}`);
    }
    console.log('\nCredentials are read from env (E2E_ADMIN_EMAIL, E2E_ADMIN_PASSWORD, …).');
}

main()
    .catch((err) => {
        console.error('seed-e2e failed:', err);
        process.exit(1);
    })
    .finally(() => prisma.$disconnect());
