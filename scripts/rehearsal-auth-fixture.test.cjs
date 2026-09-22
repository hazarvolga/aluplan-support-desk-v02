'use strict';
const { test } = require('node:test');
const assert = require('node:assert/strict');
const { guard, validateFixture, assertFinalState } = require('./rehearsal-auth-fixture.cjs');

const env = { ALLOW_LOCAL_AUTH_FIXTURE: '1', NODE_ENV: 'production',
  DATABASE_URL: 'postgresql://rehearsal:synthetic@aluplan-customer-0123456789ab-pg:5432/working_clone',
  AUTH_ACTION_JWT_SECRET: 'a'.repeat(64) };
const fixture = { userId: '01234567-89ab-4cde-8123-456789abcdef',
  email: '01234567-89ab-4cde-8123-456789abcdef@example.invalid',
  password: 'b'.repeat(64), newPassword: 'c'.repeat(64), resetToken: 'abc.def.ghi', expiredToken: 'abc.def.jkl' };

test('fixture guard rejects unknown modes and non-owned database before dependency loading', () => {
  for (const mode of ['prepare', 'verify']) assert.doesNotThrow(() => guard(env, mode));
  for (const patch of [{ ALLOW_LOCAL_AUTH_FIXTURE: '' }, { NODE_ENV: 'development' },
    { DATABASE_URL: 'postgresql://x@167.86.84.107/working_clone' },
    { DATABASE_URL: env.DATABASE_URL + '?options=unsafe' },
    { DATABASE_URL: env.DATABASE_URL.replace('/working_clone', '/reference') },
    { DATABASE_URL: env.DATABASE_URL.replace(':5432', ':5433') },
    { DATABASE_URL: env.DATABASE_URL.replace('rehearsal:', 'root:') },
    { AUTH_ACTION_JWT_SECRET: 'short' }]) assert.throws(() => guard({ ...env, ...patch }, 'prepare'));
  assert.throws(() => guard(env, 'reset'));
});

test('fixture is bounded synthetic identity and has no arbitrary extra fields', () => {
  assert.doesNotThrow(() => validateFixture(fixture));
  for (const patch of [{ email: 'real@example.com' }, { userId: 'not-uuid' }, { password: 'short' },
    { newPassword: fixture.password }, { resetToken: 'x'.repeat(3000) }, { secret: 'extra' }]) {
    assert.throws(() => validateFixture({ ...fixture, ...patch }));
  }
});

test('final state requires one durable reset and preserves customer authority', () => {
  const state = { id: fixture.userId, email: fixture.email, sessionVersion: 1,
    passwordResetJtiHash: null, status: 'ACTIVE', deletedAt: null, role: { name: 'CUSTOMER',
      permissions: ['kb:read', 'ticket:create', 'ticket:read', 'ticket:update'].map(name => ({ permission: { name } })) } };
  assert.doesNotThrow(() => assertFinalState(state, fixture));
  for (const patch of [{ sessionVersion: 0 }, { sessionVersion: 2 }, { passwordResetJtiHash: 'not-consumed' },
    { status: 'INACTIVE' }, { deletedAt: new Date() }, { role: { name: 'ADMIN', permissions: [] } }]) {
    assert.throws(() => assertFinalState({ ...state, ...patch }, fixture));
  }
});
