import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const databaseRoot = new URL('../packages/database/prisma/', import.meta.url);
const expectedPermissions = ['kb:read', 'ticket:create', 'ticket:read', 'ticket:update'];
const contract = JSON.parse(await readFile(new URL('rbac-canonical.json', databaseRoot), 'utf8'));
const migrationUrl = new URL('migrations/20260919000000_add_customer_rbac_contract/migration.sql', databaseRoot);
const readMigration = async () => (await readFile(migrationUrl, 'utf8')).replace(/--[^\n]*/g, '');

test('canonical CUSTOMER contract restores only the four customer workflow permissions', () => {
    assert.deepEqual(contract.rolePermissions.CUSTOMER, expectedPermissions);
    assert.deepEqual(contract.roleBoundaries.CUSTOMER.required, expectedPermissions);
    const forbidden = contract.roleBoundaries.CUSTOMER.forbidden;
    assert.deepEqual([...forbidden].sort(), contract.permissions
        .map(({ name }) => name).filter(name => !expectedPermissions.includes(name)).sort());
});

test('RBAC seed obtains CUSTOMER grants from the canonical contract', async () => {
    const source = await readFile(new URL('seed-rbac.ts', databaseRoot), 'utf8');
    assert.match(source, /name: 'CUSTOMER',\s*isSystem: true,\s*perms: canonicalContract\.rolePermissions\.CUSTOMER/);
});

test('customer migration is atomic, bounded, and refuses aliases and pre-existing excess grants', async () => {
    const sql = await readMigration();
    assert.match(sql, /^\s*BEGIN;/);
    assert.match(sql, /COMMIT;\s*$/);
    assert.match(sql, /SET LOCAL lock_timeout = '5s'/);
    assert.match(sql, /SET LOCAL statement_timeout = '30s'/);
    assert.match(sql, /UPPER\(REPLACE\(BTRIM\("name"\), '-', '_'\)\) = 'CUSTOMER'\s+AND "name" <> 'CUSTOMER'/);
    assert.match(sql, /RAISE EXCEPTION 'A non-canonical CUSTOMER role alias already exists'/);
    const excessCheck = sql.match(/WHERE role_row\."name" = 'CUSTOMER'\s+AND permission_row\."name" NOT IN \(([^)]+)\)/);
    assert.ok(excessCheck, 'must reject excess grants before assigning permissions');
    assert.deepEqual([...excessCheck[1].matchAll(/'([^']+)'/g)].map(match => match[1]), expectedPermissions);
    assert.match(sql, /RAISE EXCEPTION 'Existing CUSTOMER role has permissions outside the approved matrix'/);
    assert.ok(sql.indexOf('Existing CUSTOMER role has permissions') < sql.indexOf('INSERT INTO "roles"'));
});

test('customer migration preserves users, catalog, existing role metadata, and existing assignments', async () => {
    const sql = await readMigration();
    const statements = sql.replace(/'(?:''|[^'])*'/g, "''");
    assert.doesNotMatch(statements, /\b(?:UPDATE|DELETE|TRUNCATE|DROP|ALTER)\b/i);
    assert.doesNotMatch(sql, /"users"/);
    assert.deepEqual([...sql.matchAll(/INSERT INTO "([^"]+)"/g)].map(match => match[1]), ['roles', 'role_permissions']);
    assert.match(sql, /ON CONFLICT \("name"\) DO NOTHING;/);
    assert.match(sql, /ON CONFLICT \("role_id", "permission_id"\) DO NOTHING;/);
});

test('customer migration grants precisely the canonical set and fails if catalog entries are missing', async () => {
    const sql = await readMigration();
    const grantFilter = sql.match(/WHERE role_row\."name" = 'CUSTOMER'\s+AND permission_row\."name" IN \(([^)]+)\)/);
    assert.ok(grantFilter);
    assert.deepEqual([...grantFilter[1].matchAll(/'([^']+)'/g)].map(match => match[1]), expectedPermissions);
    assert.match(sql, /IF assigned_count <> 4 THEN\s+RAISE EXCEPTION 'CUSTOMER permission count mismatch/);
});
