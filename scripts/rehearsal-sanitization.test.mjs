import test from 'node:test';
import assert from 'node:assert/strict';
import { buildSanitizationPlan } from './rehearsal-sanitization.mjs';

const inventory = {
  users: ['id', 'passwordHash', 'refresh_token_hash'],
  crm_connections: ['tenant_id', 'client_id', 'client_secret', 'webhook_secret', 'instance_url', 'is_active', 'sync_settings'],
  crm_delta_sync_states: ['delta_link'],
  settings: ['value', 'is_secret'],
  webhooks: ['url', 'secret', 'is_active'],
  tickets: ['id', 'description'],
};
const columns = () => Object.entries(inventory).flatMap(([table, names]) => names.map(column => ({ table, column })));

test('pure plan has transaction, pre-write inventory guard and narrow exclusions', () => {
  const input = columns();
  const before = structuredClone(input);
  const plan = buildSanitizationPlan(input);
  assert.deepEqual(input, before);
  assert.match(plan.sql, /^BEGIN;/);
  assert.ok(plan.sql.indexOf('RAISE EXCEPTION') < plan.sql.indexOf('UPDATE'));
  assert.match(plan.sql, /COMMIT;$/);
  assert.match(plan.sql, /!LOCAL_REFERENCE_LOGIN_DISABLED!/);
  assert.match(plan.sql, /"refresh_token_hash"=NULL/);
  assert.match(plan.unsafeAssertionSql, /IS DISTINCT FROM false/);
  assert.deepEqual(plan.excludedColumns.users, ['passwordHash', 'refresh_token_hash']);
  assert.equal(plan.excludedColumns.tickets, undefined);
  assert.doesNotMatch(plan.sql, /DELETE|TRUNCATE|DROP|ALTER|INSERT/);
  plan.excludedColumns.users.push('not-persistent');
  assert.equal(buildSanitizationPlan(input).excludedColumns.users.includes('not-persistent'), false);
});

test('migrated reset/session fields are cleared only when present', () => {
  const optional = ['session_version', 'email_verification_jti_hash', 'email_verification_sent_at', 'password_reset_jti_hash', 'password_reset_sent_at'];
  const plan = buildSanitizationPlan([...columns(), ...optional.map(column => ({ table: 'users', column }))]);
  assert.match(plan.sql, /"session_version"=0/);
  for (const column of optional.slice(1)) assert.ok(plan.sql.includes(`"${column}"=NULL`));
  assert.equal(plan.excludedColumns.users.length, 7);
  assert.ok(!buildSanitizationPlan(columns()).sql.includes('"session_version"'));
});

test('unknown credential columns including MFA fail closed without returning SQL', () => {
  for (const column of ['password', 'apiKey', 'access_token', 'mfaEnabled', 'totpSecret', 'backup_code', 'passkey', 'credential']) {
    assert.throws(() => buildSanitizationPlan([...columns(), { table: 'users', column }]), /Unreviewed credential/);
  }
  assert.throws(() => buildSanitizationPlan([...columns(), { table: 'other', column: 'passwordHash' }]), /Unreviewed credential/);
});

test('missing required cleared or metadata credential column is rejected', () => {
  for (const omitted of ['users.passwordHash', 'settings.is_secret', 'crm_connections.instance_url']) {
    assert.throws(() => buildSanitizationPlan(columns().filter(c => `${c.table}.${c.column}` !== omitted)), /Required column missing/);
  }
});

test('malformed identifiers, duplicate rows and non-array input are rejected', () => {
  for (const input of [null, {}, [], [...columns(), columns()[0]], [...columns(), { table: "users';--", column: 'id' }]]) {
    assert.throws(() => buildSanitizationPlan(input));
  }
});
