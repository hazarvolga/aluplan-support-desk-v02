'use strict';
// Run via stdin only inside the parent's isolated disposable backend/working clone.
const { randomUUID, randomBytes } = require('node:crypto');
const assert = require('node:assert/strict');
function guard(env) {
  let url;
  try { url = new URL(env.DATABASE_URL); } catch { throw new Error('probe guard rejected'); }
  if (env.ALLOW_LOCAL_CUSTOMER_PROBE !== '1' || env.NODE_ENV !== 'production' ||
      !['postgres:', 'postgresql:'].includes(url.protocol) ||
      !/^aluplan-customer-[a-f0-9]+-pg$/.test(url.hostname) ||
      url.pathname !== '/working_clone' || url.search || url.hash ||
      (url.port && url.port !== '5432')) throw new Error('probe guard rejected');
}
function expectStatus(response, expected) {
  if (response.status !== expected) throw new Error('unexpected HTTP status');
}
function assertLogin(body) {
  assert(body && body.user && typeof body.user.id === 'string');
  assert.deepEqual(Object.keys(body), ['user']);
}
function readProbeRequestTimeout(env) {
  const value = env.ALUPLAN_PROBE_REQUEST_TIMEOUT_MS;
  if (value === undefined) return 5000;
  const milliseconds = Number(value);
  if (!/^\d+$/.test(value) || !Number.isSafeInteger(milliseconds) || milliseconds < 5000 || milliseconds > 30000) {
    throw new Error('invalid probe request timeout');
  }
  return milliseconds;
}
async function main() {
  guard(process.env); // Before loading dependencies or opening a connection.
  const requestTimeoutMs = readProbeRequestTimeout(process.env);
  const { PrismaClient } = require('/app/packages/database/client');
  const { PrismaPg } = require('/app/apps/backend/node_modules/@prisma/adapter-pg');
  const { Pool } = require('/app/apps/backend/node_modules/pg');
  const bcrypt = require('/app/apps/backend/node_modules/bcryptjs');
  const pool = new Pool({ connectionString: process.env.DATABASE_URL, max: 2, connectionTimeoutMillis: 5000, query_timeout: 10000 });
  const db = new PrismaClient({ adapter: new PrismaPg(pool), log: [] });
  let checks = 0;
  const loginDurationsMs = [];
  async function request(path, status, actor, body, csrf = true) {
    assert(/^\/(auth\/login|tickets(?:[/?].*)?)$/.test(path));
    const headers = { 'content-type': 'application/json' };
    if (actor?.cookies) headers.cookie = actor.cookies.join('; ');
    if (body && actor && csrf) {
      headers['x-xsrf-token'] = actor.csrf;
      headers['x-requested-with'] = 'XMLHttpRequest';
    }
    const startedAt = performance.now();
    const response = await fetch(`http://127.0.0.1:4000/api/v1${path}`, {
      method: body ? 'POST' : 'GET', headers, body: body ? JSON.stringify(body) : undefined,
      signal: AbortSignal.timeout(requestTimeoutMs), redirect: 'error',
    });
    expectStatus(response, status);
    checks++;
    const data = await response.json();
    if (path === '/auth/login') {
      loginDurationsMs.push(Math.round(performance.now() - startedAt));
      assertLogin(data);
      actor.cookies = response.headers.getSetCookie().map(value => value.split(';')[0]);
      assert(actor.cookies.some(value => value.startsWith('alu_at=')));
      const csrfCookie = actor.cookies.find(value => value.startsWith('XSRF-TOKEN='));
      assert(csrfCookie);
      actor.csrf = decodeURIComponent(csrfCookie.slice('XSRF-TOKEN='.length));
    }
    return data;
  }
  try {
    const role = await db.role.findUnique({ where: { name: 'CUSTOMER' }, include: { permissions: { include: { permission: true } } } });
    assert(role && ['ticket:read', 'ticket:create', 'ticket:update'].every(name => role.permissions.some(item => item.permission.name === name)));
    const actors = [];
    for (let index = 0; index < 2; index++) {
      const id = randomUUID(), accountId = randomUUID();
      const actor = { id, email: `${id}@example.invalid`, password: randomBytes(32).toString('hex') };
      const passwordHash = await bcrypt.hash(actor.password, 12);
      await db.$transaction(async tx => {
        await tx.crmAccount.create({ data: { id: accountId, name: 'Isolated rehearsal account', externalAccountId: randomUUID(), crmVerified: true } });
        await tx.user.create({ data: { id, email: actor.email, fullName: 'Isolated rehearsal customer', passwordHash, roleId: role.id, status: 'ACTIVE',
          customerProfile: { create: { firstName: 'Isolated', lastName: 'Rehearsal', customerNo: id, companyName: 'Isolated rehearsal account', accountId, externalContactId: randomUUID(), crmVerified: true } },
        } });
      });
      await request('/auth/login', 200, actor, { email: actor.email, password: actor.password });
      actor.ticket = await request('/tickets', 201, actor, { subject: 'Isolated customer rehearsal', description: 'Synthetic local-only test data' });
      assert.equal(actor.ticket.userId, actor.id);
      actors.push(actor);
    }
    for (const [own, other] of [[actors[0], actors[1]], [actors[1], actors[0]]]) {
      const path = `/tickets/${own.ticket.id}`;
      assert.equal((await request(path, 200, own)).id, own.ticket.id);
      await request(path, 401);
      await request(path, 403, other);
      await request(`/tickets/by-number/${own.ticket.ticketNumber}`, 403, other);
      const list = await request(`/tickets?userId=${other.id}`, 200, own);
      assert(Array.isArray(list.data) && list.data.length > 0);
      assert(list.data.every(ticket => ticket.userId === own.id));
      const before = await db.ticketMessage.count({ where: { ticketId: own.ticket.id } });
      const reply = await request(`${path}/messages`, 201, own, { message: 'Synthetic own reply' });
      assert.equal(typeof reply.id, 'string');
      const persisted = await db.ticketMessage.findUnique({ where: { id: reply.id } });
      assert(persisted);
      assert.equal(persisted.ticketId, own.ticket.id);
      assert.equal(persisted.senderId, own.id);
      assert.equal(persisted.message, 'Synthetic own reply');
      assert.equal(persisted.isInternal, false);
      const count = await db.ticketMessage.count({ where: { ticketId: own.ticket.id } });
      assert.equal(count, before + 1);
      await request(`${path}/messages`, 403, other, { message: 'Synthetic forbidden reply' });
      await request(`${path}/messages`, 403, own, { message: 'Synthetic internal reply', isInternal: true });
      await request(`${path}/messages`, 403, own, { message: 'Synthetic CSRF rejection' }, false);
      assert.equal(await db.ticketMessage.count({ where: { ticketId: own.ticket.id } }), count);
    }
    console.log(JSON.stringify({ status: 'PASS', customers: 2, tickets: 2, ownReplies: 2, httpChecks: checks, requestTimeoutMs, loginDurationsMs }));
  } catch (error) {
    console.error(JSON.stringify({ status: 'FAIL', completedHttpChecks: checks, errorType: error?.constructor?.name }));
    throw error;
  } finally { await db.$disconnect(); await pool.end(); }
}
module.exports = { guard, expectStatus, assertLogin, readProbeRequestTimeout };
if (require.main === module || process.argv[1] === '-') {
  const deadline = setTimeout(() => { console.error('customer probe timed out'); process.exit(1); }, 120000);
  main().catch(() => { console.error('customer probe failed'); process.exitCode = 1; }).finally(() => clearTimeout(deadline));
}
