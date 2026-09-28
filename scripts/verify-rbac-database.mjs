#!/usr/bin/env node

// Runtime-safe RBAC database verification. This intentionally has no
// TypeScript/compiler dependency so it can run in the production image.

import { readFile } from 'node:fs/promises';
import pg from 'pg';

const { Client } = pg;
const connectionString = process.env.DATABASE_URL;
let stage = 'startup';

if (!connectionString) {
    process.stderr.write('RBAC database verification requires DATABASE_URL.\n');
    process.exit(1);
}

function normalizeRole(value) {
    return String(value).trim().replaceAll('-', '_').toUpperCase();
}

async function main() {
    const contract = JSON.parse(await readFile(
        new URL('../packages/database/prisma/rbac-canonical.json', import.meta.url),
        'utf8',
    ));
    const client = new Client({
        connectionString,
        connectionTimeoutMillis: 10_000,
        query_timeout: 35_000,
    });
    stage = 'connect';
    await client.connect();
    try {
        stage = 'begin-read-only';
        await client.query('BEGIN ISOLATION LEVEL REPEATABLE READ READ ONLY');
        await client.query("SET LOCAL statement_timeout = '30s'");
        stage = 'permissions';
        const permissions = await client.query(
            'SELECT name FROM public.permissions ORDER BY name',
        );
        const actualPermissions = new Set(permissions.rows.map(({ name }) => name));
        for (const permission of contract.permissions) {
            if (!actualPermissions.has(permission.name)) {
                throw new Error('canonical permission is missing');
            }
        }

        stage = 'role-permissions';
        const assignments = await client.query(`
            SELECT role_row.name AS role, permission_row.name AS permission
            FROM public.roles AS role_row
            LEFT JOIN public.role_permissions AS role_permission
              ON role_permission.role_id = role_row.id
            LEFT JOIN public.permissions AS permission_row
              ON permission_row.id = role_permission.permission_id
            ORDER BY role_row.name, permission_row.name
        `);
        const actualByRole = new Map();
        for (const row of assignments.rows) {
            const role = normalizeRole(row.role);
            const values = actualByRole.get(role) ?? [];
            if (row.permission !== null) values.push(row.permission);
            actualByRole.set(role, values);
        }
        for (const [rawRole, expectedPermissions] of Object.entries(contract.rolePermissions)) {
            const actual = [...(actualByRole.get(normalizeRole(rawRole)) ?? [])].sort();
            const expected = [...expectedPermissions].sort();
            if (JSON.stringify(actual) !== JSON.stringify(expected)) {
                throw new Error('canonical role permission mapping differs');
            }
        }
        process.stdout.write('RBAC database contract verified.\n');
    } finally {
        await client.query('ROLLBACK').catch(() => undefined);
        await client.end().catch(() => undefined);
    }
}

main().catch(() => {
    process.stderr.write(`RBAC database verification failed at ${stage}.\n`);
    process.exitCode = 1;
});
