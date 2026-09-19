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
function readExtendedProbeMode(env) {
  if (env.ALUPLAN_PROBE_EXTENDED === undefined) return false;
  if (env.ALUPLAN_PROBE_EXTENDED !== '1') throw new Error('invalid extended probe mode');
  return true;
}
function assertSyntheticBytes(actual, expected) {
  if (!expected.length || !Buffer.from(actual).equals(Buffer.from(expected))) {
    throw new Error('attachment byte mismatch');
  }
}
async function main() {
  guard(process.env); // Before loading dependencies or opening a connection.
  const requestTimeoutMs = readProbeRequestTimeout(process.env);
  const extended = readExtendedProbeMode(process.env);
  const { PrismaClient } = require('/app/packages/database/client');
  const { PrismaPg } = require('/app/apps/backend/node_modules/@prisma/adapter-pg');
  const { Pool } = require('/app/apps/backend/node_modules/pg');
  const bcrypt = require('/app/apps/backend/node_modules/bcryptjs');
  const pool = new Pool({ connectionString: process.env.DATABASE_URL, max: 2, connectionTimeoutMillis: 5000, query_timeout: 10000 });
  const db = new PrismaClient({ adapter: new PrismaPg(pool), log: [] });
  let checks = 0;
  let stage = 'base';
  const loginDurationsMs = [];
  async function request(path, status, actor, body, csrf = true, method = body ? 'POST' : 'GET', raw = false) {
    assert(/^\/(auth\/login|tickets(?:[/?].*)?|attachments\/[a-zA-Z0-9/-]+|storage\/[a-zA-Z0-9/_.-]+|users\/lookup\?email=[a-zA-Z0-9%._@-]+)$/.test(path));
    assert(['GET', 'POST', 'PATCH'].includes(method));
    const headers = body instanceof FormData ? {} : { 'content-type': 'application/json' };
    if (actor?.cookies) headers.cookie = actor.cookies.join('; ');
    if (method !== 'GET' && actor && csrf) {
      headers['x-xsrf-token'] = actor.csrf;
      headers['x-requested-with'] = 'XMLHttpRequest';
    }
    const startedAt = performance.now();
    const response = await fetch(`http://127.0.0.1:4000/api/v1${path}`, {
      method, headers, body: body instanceof FormData ? body : body ? JSON.stringify(body) : undefined,
      signal: AbortSignal.timeout(requestTimeoutMs), redirect: 'manual',
    });
    expectStatus(response, status);
    checks++;
    if (raw) return response;
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
    assert.equal(await db.webhook.count({ where: { isActive: true } }), 0);
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
      own.messageId = reply.id;
      const count = await db.ticketMessage.count({ where: { ticketId: own.ticket.id } });
      assert.equal(count, before + 1);
      await request(`${path}/messages`, 403, other, { message: 'Synthetic forbidden reply' });
      await request(`${path}/messages`, 403, own, { message: 'Synthetic internal reply', isInternal: true });
      await request(`${path}/messages`, 403, own, { message: 'Synthetic CSRF rejection' }, false);
      assert.equal(await db.ticketMessage.count({ where: { ticketId: own.ticket.id } }), count);
    }
    if (extended) {
      const [customer, other] = actors;
      const ticketIds = actors.map(actor => actor.ticket.id);
      const ticketState = () => db.ticket.findMany({ where: { id: { in: ticketIds } }, orderBy: { id: 'asc' },
        select: { id: true, status: true, parentId: true, subject: true, priority: true } });
      stage = 'customer-review';
      await request(`/tickets/${customer.ticket.id}/status/PENDING_CUSTOMER_REVIEW`, 200, customer, undefined, true, 'PATCH');
      assert.equal((await db.ticket.findUnique({ where: { id: customer.ticket.id } })).status, 'PENDING_CUSTOMER_REVIEW');
      const unchanged = await ticketState();
      const messagesBefore = await db.ticketMessage.count({ where: { ticketId: { in: ticketIds } } });
      await request(`/tickets/${customer.ticket.id}/status/PENDING_CUSTOMER_REVIEW`, 403, other, undefined, true, 'PATCH');
      await request(`/tickets/${customer.ticket.id}/status/OPEN`, 403, customer, undefined, true, 'PATCH');
      await request('/tickets/bulk', 403, customer, { ticketIds, status: 'OPEN' }, true, 'PATCH');
      await request(`/tickets/${customer.ticket.id}/link/${other.ticket.id}`, 403, customer, undefined, true, 'POST');
      await request(`/tickets/${other.ticket.id}/status/PENDING_CUSTOMER_REVIEW`, 403, other, undefined, false, 'PATCH');
      assert.deepEqual(await ticketState(), unchanged);
      assert.equal(await db.ticketMessage.count({ where: { ticketId: { in: ticketIds } } }), messagesBefore);
      stage = 'staff-login';
      const staff = [];
      for (const name of ['SUPPORT_AGENT', 'ADMIN']) {
        const staffRole = await db.role.findUnique({ where: { name }, include: { permissions: { include: { permission: true } } } });
        assert(staffRole && staffRole.permissions.length > 0);
        const id = randomUUID();
        const actor = { id, email: `${id}@example.invalid`, password: randomBytes(32).toString('hex') };
        await db.user.create({ data: { id, email: actor.email, fullName: 'Isolated rehearsal staff',
          passwordHash: await bcrypt.hash(actor.password, 12), roleId: staffRole.id, status: 'ACTIVE' } });
        await request('/auth/login', 200, actor, { email: actor.email, password: actor.password });
        staff.push(actor);
      }
      const [support, admin] = staff;
      stage = 'staff-management';
      assert.equal((await request(`/tickets/${customer.ticket.id}`, 200, support)).id, customer.ticket.id);
      const note = await request(`/tickets/${customer.ticket.id}/messages`, 201, support, { message: 'Synthetic staff internal note', isInternal: true });
      const persistedNote = await db.ticketMessage.findUnique({ where: { id: note.id } });
      assert(persistedNote && persistedNote.isInternal && persistedNote.senderId === support.id && persistedNote.ticketId === customer.ticket.id);
      const customerView = await request(`/tickets/${customer.ticket.id}`, 200, customer);
      assert(Array.isArray(customerView.messages) && !customerView.messages.some(message => message.id === note.id || message.isInternal));
      await request(`/tickets/${customer.ticket.id}/status/OPEN`, 200, support, undefined, true, 'PATCH');
      assert.equal((await db.ticket.findUnique({ where: { id: customer.ticket.id } })).status, 'OPEN');
      const lookup = `/users/lookup?email=${encodeURIComponent(customer.email)}`;
      await request(lookup, 403, customer);
      await request(lookup, 403, support);
      assert.equal((await request(lookup, 200, admin)).id, customer.id);
      await request(`/tickets/${other.ticket.id}/status/OPEN`, 200, admin, undefined, true, 'PATCH');
      assert.equal((await db.ticket.findUnique({ where: { id: other.ticket.id } })).status, 'OPEN');

      stage = 'attachment-bytes';
      const bytes = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+ip1sAAAAASUVORK5CYII=', 'base64');
      const form = () => { const data = new FormData(); data.set('file', new Blob([bytes], { type: 'image/png' }), 'synthetic.png'); return data; };
      const upload = async (messageId, actor) => {
        const attachment = await request(`/attachments/upload/${messageId}`, 201, actor, form());
        const persisted = await db.attachment.findUnique({ where: { id: attachment.id } });
        assert(persisted && persisted.messageId === messageId && persisted.fileSize === bytes.length && persisted.mimeType === 'image/png');
        assert.equal(persisted.fileName, 'synthetic.png'); assert.equal(persisted.deletedAt, null);
        assert.equal(persisted.url, attachment.url);
        assert.match(attachment.url, new RegExp(`^tickets/msg_${messageId}/[a-zA-Z0-9_.-]+$`));
        assertSyntheticBytes(require('node:fs').readFileSync(`/app/uploads/${attachment.url}`), bytes);
        return attachment;
      };
      const download = async (attachment, actor) => {
        const redirect = await request(`/attachments/${attachment.id}/download`, 302, actor, undefined, true, 'GET', true);
        assert.equal(redirect.headers.get('location'), `/api/v1/storage/${attachment.url}`);
        await redirect.arrayBuffer();
        const response = await request(`/storage/${attachment.url}`, 200, actor, undefined, true, 'GET', true);
        assert.equal(response.headers.get('cache-control'), 'private, no-store');
        assert.equal(response.headers.get('content-disposition'), 'attachment');
        assert.equal(response.headers.get('x-content-type-options'), 'nosniff');
        assert.equal(response.headers.get('content-security-policy'), "default-src 'none'; sandbox");
        assertSyntheticBytes(Buffer.from(await response.arrayBuffer()), bytes);
      };
      const publicAttachment = await upload(customer.messageId, customer);
      await download(publicAttachment, customer);
      const messageIds = [customer.messageId, note.id];
      const attachmentCount = () => db.attachment.count({ where: { messageId: { in: messageIds } } });
      const fileInventory = () => messageIds.map(id => {
        const path = `/app/uploads/tickets/msg_${id}`;
        return require('node:fs').existsSync(path) ? require('node:fs').readdirSync(path).sort() : [];
      });
      const attachmentCountBefore = await attachmentCount(), filesBefore = fileInventory();
      await request(`/attachments/upload/${customer.messageId}`, 403, other, form());
      const denyRedirect = async (actor, expected) => {
        const response = await request(`/attachments/${publicAttachment.id}/download`, expected, actor, undefined, true, 'GET', true);
        assert.equal(response.headers.get('location'), null); await response.arrayBuffer();
      };
      await denyRedirect(other, 403); await denyRedirect(undefined, 401);
      await request(`/storage/${publicAttachment.url}`, 403, other);
      await request(`/storage/${publicAttachment.url}`, 401);
      await request(`/attachments/upload/${customer.messageId}`, 403, customer, form(), false);
      assert.equal(await attachmentCount(), attachmentCountBefore); assert.deepEqual(fileInventory(), filesBefore);
      await download(publicAttachment, support);
      const internalAttachment = await upload(note.id, support);
      await request(`/attachments/${internalAttachment.id}/download`, 403, customer);
      await request(`/storage/${internalAttachment.url}`, 403, customer);
      await download(internalAttachment, support);

      stage = 'bulk-and-merge';
      assert.equal((await request('/tickets/bulk', 200, support, { ticketIds, status: 'IN_PROGRESS' }, true, 'PATCH')).count, 2);
      assert((await ticketState()).every(ticket => ticket.status === 'IN_PROGRESS'));
      const beforeMerge = await db.ticketMessage.count({ where: { ticketId: { in: ticketIds } } });
      const messageIdsBeforeMerge = (await db.ticketMessage.findMany({ where: { ticketId: { in: ticketIds } }, select: { id: true } })).map(message => message.id);
      await request(`/tickets/${customer.ticket.id}/link/${other.ticket.id}`, 201, support, undefined, true, 'POST');
      const merged = await db.ticket.findUnique({ where: { id: customer.ticket.id } });
      assert.equal(merged.parentId, other.ticket.id); assert.equal(merged.status, 'CLOSED');
      assert.equal(await db.ticketMessage.count({ where: { ticketId: { in: ticketIds } } }), beforeMerge + 2);
      const mergeNotes = await db.ticketMessage.findMany({ where: { ticketId: { in: ticketIds }, id: { notIn: messageIdsBeforeMerge } } });
      assert.equal(mergeNotes.length, 2);
      assert(mergeNotes.every(message => message.isInternal && message.senderId === support.id));
      assert.deepEqual(mergeNotes.map(message => message.ticketId).sort(), [...ticketIds].sort());
      assert.equal(await db.emailLog.count({ where: { recipientEmail: { in: [...actors, ...staff].map(actor => actor.email) }, status: { in: ['QUEUED', 'SENT'] } } }), 0);
      assert.equal(checks, 56);
    }
    console.log(JSON.stringify({ status: 'PASS', customers: 2, tickets: 2, ownReplies: 2, httpChecks: checks, requestTimeoutMs, loginDurationsMs, extended }));
  } catch (error) {
    console.error(JSON.stringify({ status: 'FAIL', stage, completedHttpChecks: checks, errorType: error?.constructor?.name }));
    throw error;
  } finally { await db.$disconnect(); await pool.end(); }
}
module.exports = { guard, expectStatus, assertLogin, readProbeRequestTimeout, readExtendedProbeMode, assertSyntheticBytes };
if (require.main === module || process.argv[1] === '-') {
  const deadline = setTimeout(() => { console.error('customer probe timed out'); process.exit(1); }, 120000);
  main().catch(() => { console.error('customer probe failed'); process.exitCode = 1; }).finally(() => clearTimeout(deadline));
}
