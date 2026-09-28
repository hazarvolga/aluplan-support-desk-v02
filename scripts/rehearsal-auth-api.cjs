'use strict';
// Operator-invoked inside an owned isolated backend clone; never invokes mail issuance.
const assert = require('node:assert/strict');
const BASE = 'http://127.0.0.1:4000/api/v1/auth';
function actorFrom(response) {
  const pairs = response.headers.getSetCookie().map(value => value.split(';')[0]);
  const get = name => {
    const matching = pairs.filter(value => value.startsWith(`${name}=`));
    assert.equal(matching.length, 1); assert.ok(matching[0].length > name.length + 1);
    return matching[0];
  };
  return Object.freeze({ access: get('alu_at'), refresh: get('alu_rt') });
}
async function main({ fixtureApi, fetchImpl = globalThis.fetch, env = process.env }) {
  let stage = 'guard', httpChecks = 0;
  try {
    fixtureApi.guard(env, 'prepare');
    stage = 'prepare';
    const fixture = await fixtureApi.main('prepare');
    async function request(label, path, status, { body, actor, method = body ? 'POST' : 'GET' } = {}) {
      stage = label;
      assert.ok(['/login', '/me', '/refresh', '/reset-password'].includes(path));
      const headers = { 'content-type': 'application/json' };
      if (actor) headers.cookie = path === '/refresh' ? actor.refresh : actor.access;
      const response = await fetchImpl(`${BASE}${path}`, { method, headers,
        body: body ? JSON.stringify(body) : undefined, redirect: 'manual', signal: AbortSignal.timeout(30_000) });
      try {
        assert.equal(response.status, status);
        httpChecks += 1;
        const data = await response.json();
        if (status === 200 && path === '/login') {
          assert.deepEqual(Object.keys(data), ['user']); assert.equal(data.user.id, fixture.userId);
          assert.ok(Object.keys(data.user).every(key => !/password|token|secret/i.test(key)));
        }
        if (status === 200 && path === '/me') assert.equal(data.id, fixture.userId);
        if (status === 200 && ['/reset-password', '/refresh'].includes(path)) assert.equal(data.success, true);
        return status === 200 && ['/login', '/refresh'].includes(path) ? actorFrom(response) : undefined;
      } finally { await response.body?.cancel().catch(() => {}); }
    }
    const reset = token => ({ body: { token, newPassword: fixture.newPassword } });
    const login = password => ({ body: { email: fixture.email, password } });
    await request('expired-reset', '/reset-password', 401, reset(fixture.expiredToken));
    const initial = await request('initial-login', '/login', 200, login(fixture.password));
    await request('initial-me', '/me', 200, { actor: initial });
    const rotated = await request('initial-refresh', '/refresh', 200, { actor: initial, method: 'POST' });
    await request('rotated-me', '/me', 200, { actor: rotated });
    await request('valid-reset', '/reset-password', 200, reset(fixture.resetToken));
    await request('old-access-revoked', '/me', 401, { actor: rotated });
    await request('old-refresh-revoked', '/refresh', 403, { actor: rotated, method: 'POST' });
    await request('reset-replay', '/reset-password', 401, reset(fixture.resetToken));
    await request('old-password-rejected', '/login', 401, login(fixture.password));
    const renewed = await request('new-login', '/login', 200, login(fixture.newPassword));
    await request('new-me', '/me', 200, { actor: renewed });
    stage = 'verify';
    const verification = await fixtureApi.main('verify', fixture);
    assert.equal(verification.status, 'PASS');
    return { status: 'PASS', scope: 'isolated-api-password-reset', httpChecks,
      expiredReset401: true, validReset200: true, oldAccess401: true, oldRefresh403: true,
      resetReplay401: true, oldPassword401: true, newLoginAndMe200: true, fixtureVerified: true,
      browserAcceptance: false, forgotPasswordIssuanceAcceptance: false, mailDeliveryAcceptance: false };
  } catch { throw new Error(`auth API probe failed at ${stage}`); }
}
module.exports = { main };
