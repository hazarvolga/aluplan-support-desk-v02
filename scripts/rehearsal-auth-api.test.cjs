'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const { main } = require('./rehearsal-auth-api.cjs');
const fixture = { userId: 'synthetic-id', email: 'synthetic@example.invalid', password: 'old-private',
  newPassword: 'new-private', resetToken: 'valid-private', expiredToken: 'expired-private' };
function harness(failureIndex = -1) {
  const calls = [], lifecycle = [];
  const statuses = [401, 200, 200, 200, 200, 200, 401, 403, 401, 401, 200, 200];
  const fixtureApi = {
    guard() { lifecycle.push('guard'); },
    async main(mode, value) { lifecycle.push(mode); if (mode === 'prepare') return fixture;
      assert.equal(value, fixture); return { status: 'PASS', resetConsumed: true }; },
  };
  const fetchImpl = async (url, options) => {
    const index = calls.length; calls.push({ url, options });
    const cookies = index === 1 ? ['alu_at=original; HttpOnly', 'alu_rt=original-refresh; HttpOnly']
      : index === 3 ? ['alu_at=rotated; HttpOnly', 'alu_rt=rotated-refresh; HttpOnly']
      : index === 10 ? ['alu_at=new; HttpOnly', 'alu_rt=new-refresh; HttpOnly'] : [];
    return { status: index === failureIndex ? 302 : statuses[index], headers: { getSetCookie: () => cookies },
      json: async () => index === 1 || index === 10 ? { user: { id: fixture.userId } }
        : [2, 4, 11].includes(index) ? { id: fixture.userId } : { success: true },
      body: { cancel: async () => {} } };
  };
  return { fixtureApi, fetchImpl, calls, lifecycle };
}
test('API reset lifecycle retains rotated credentials and only returns aggregate evidence', async () => {
  const h = harness(); const result = await main(h);
  assert.deepEqual(h.lifecycle, ['guard', 'prepare', 'verify']);
  assert.equal(result.status, 'PASS'); assert.equal(result.httpChecks, 12);
  for (const { url, options } of h.calls) {
    assert.match(url, /^http:\/\/127\.0\.0\.1:4000\/api\/v1\/auth\//);
    assert.equal(options.redirect, 'manual'); assert.ok(options.signal instanceof AbortSignal);
  }
  assert.equal(h.calls[6].options.headers.cookie, 'alu_at=rotated');
  assert.equal(h.calls[7].options.headers.cookie, 'alu_rt=rotated-refresh');
  assert.equal(h.calls[4].options.headers.cookie, 'alu_at=rotated');
  assert.equal(h.calls[11].options.headers.cookie, 'alu_at=new');
  assert.equal(JSON.parse(h.calls[0].options.body).token, fixture.expiredToken);
  assert.equal(JSON.parse(h.calls[5].options.body).token, fixture.resetToken);
  assert.equal(JSON.parse(h.calls[8].options.body).token, fixture.resetToken);
  assert.ok(Object.values(fixture).every(secret => !JSON.stringify(result).includes(secret)));
});
test('unexpected redirect fails closed before further requests or verification', async () => {
  const h = harness(5); await assert.rejects(main(h), /^Error: auth API probe failed at valid-reset$/);
  assert.equal(h.calls.length, 6); assert.deepEqual(h.lifecycle, ['guard', 'prepare']);
});
test('fixture boundary rejection happens before preparation and fetch', async () => {
  const h = harness(); h.fixtureApi.guard = () => { throw new Error('private-url'); };
  await assert.rejects(main(h), /^Error: auth API probe failed at guard$/); assert.equal(h.calls.length, 0);
});
test('every unexpected response status terminates at its exact stage', async () => {
  for (let index = 0; index < 12; index += 1) {
    const h = harness(index); await assert.rejects(main(h), /auth API probe failed at/);
    assert.equal(h.calls.length, index + 1); assert.ok(!h.lifecycle.includes('verify'));
  }
});
test('missing rotated credentials fail before revocation could give a false positive', async () => {
  const h = harness(), original = h.fetchImpl;
  h.fetchImpl = async (...args) => {
    const response = await original(...args);
    if (h.calls.length === 4) response.headers.getSetCookie = () => ['alu_at=rotated'];
    return response;
  };
  await assert.rejects(main(h), /failed at initial-refresh$/); assert.equal(h.calls.length, 4);
});
test('failed database verification cannot produce a passing aggregate', async () => {
  const h = harness(), original = h.fixtureApi.main;
  h.fixtureApi.main = async (...args) => args[0] === 'verify' ? { status: 'FAIL' } : original(...args);
  await assert.rejects(main(h), /failed at verify$/);
});
