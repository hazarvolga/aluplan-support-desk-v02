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

const { assertSafeE2eDatabaseUrl } = require('./seed-e2e-safety.cjs') as {
    assertSafeE2eDatabaseUrl: (environment?: NodeJS.ProcessEnv) => string;
};

const pool = new Pool({ connectionString: assertSafeE2eDatabaseUrl(process.env) });
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
    roleName: 'SUPPORT_AGENT',
};

const CUSTOMER = {
    email: process.env.E2E_CUSTOMER_EMAIL || 'e2e-customer@aluplan.test',
    password: process.env.E2E_CUSTOMER_PASSWORD || 'E2eCustomer!Pass123',
    fullName: 'E2E Customer',
    roleName: 'CUSTOMER',
};
const CUSTOMER_PHONE = process.env.E2E_CUSTOMER_PHONE || '905550009988';

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

async function ensurePermissionGrant(roleName: string, permissionName: string): Promise<void> {
    const role = await prisma.role.findUnique({ where: { name: roleName }, select: { id: true } });
    const permission = await prisma.permission.findUnique({ where: { name: permissionName }, select: { id: true } });
    if (!role || !permission) {
        throw new Error(`E2E RBAC prerequisite missing: ${roleName} / ${permissionName}`);
    }

    await prisma.rolePermission.upsert({
        where: { roleId_permissionId: { roleId: role.id, permissionId: permission.id } },
        create: { roleId: role.id, permissionId: permission.id },
        update: {},
    });
}

async function assertRoleHasPermissions(roleName: string, requiredPermissions: string[]): Promise<void> {
    const role = await prisma.role.findUnique({
        where: { name: roleName },
        include: { permissions: { include: { permission: { select: { name: true } } } } },
    });
    const granted = new Set(role?.permissions.map(({ permission }) => permission.name) ?? []);
    const missing = requiredPermissions.filter((permission) => !granted.has(permission));
    if (missing.length > 0) {
        throw new Error(`E2E RBAC migration is missing ${roleName} permissions: ${missing.join(', ')}`);
    }
}

async function main() {
    const created: Array<{ role: string; email: string }> = [];
    for (const spec of [ADMIN, AGENT, CUSTOMER]) {
        const user = await ensureUser(spec);
        created.push({ role: spec.roleName, email: user.email });
        if (spec === CUSTOMER) {
            await prisma.customerProfile.upsert({
                where: { userId: user.id },
                update: {
                    firstName: 'E2E',
                    lastName: 'Customer',
                    customerNo: `E2E-${user.id}`,
                    companyName: 'E2E Test Company',
                    phoneNumber: CUSTOMER_PHONE,
                },
                create: {
                    userId: user.id,
                    firstName: 'E2E',
                    lastName: 'Customer',
                    customerNo: `E2E-${user.id}`,
                    companyName: 'E2E Test Company',
                    phoneNumber: CUSTOMER_PHONE,
                },
            });
        }
    }

    // The admin wildcard exists only for the synthetic user in an isolated _e2e database.
    await ensurePermissionGrant('ADMIN', '*');
    // Staff and customer users rely only on the canonical, migration-owned least-privilege matrices.
    await assertRoleHasPermissions('SUPPORT_AGENT', [
        'ticket:read', 'ticket:create', 'ticket:update', 'ticket:assign', 'ticket:close', 'ticket:escalate',
    ]);
    await assertRoleHasPermissions('CUSTOMER', ['kb:read', 'ticket:create', 'ticket:read', 'ticket:update']);

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
