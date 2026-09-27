'use strict';
const { test } = require('node:test');
const assert = require('node:assert/strict');
const { runClosedReopenProbe } = require('./rehearsal-ticket-reopen.cjs');

function fixture(fault) {
  const customer = { id: 'customer', ticket: { id: 'ticket' } };
  const other = { id: 'other' }, support = { id: 'support' }, admin = { id: 'admin' };
  let ticket = { id: 'ticket', status: 'OPEN', closedAt: null, resolvedAt: null, slaSolvedAt: null };
  let messages = [{ id: 'original', ticketId: 'ticket', senderId: customer.id, message: 'kept',
    isInternal: false, attachments: [{ id: 'attachment', url: 'synthetic.png', deletedAt: null }] }];
  const calls = [];
  const db = {
    ticket: { findUnique: async () => structuredClone(ticket) },
    ticketMessage: { findMany: async () => structuredClone(messages) },
  };
  const request = async (path, expected, actor, body, csrf = true, method = 'GET') => {
    calls.push({ path, expected, actor, csrf, method, before: ticket.status });
    const authorized = actor === support || actor === admin;
    const status = !actor ? 401 : method === 'GET' || (authorized && csrf) ? 200 : 403;
    assert.equal(status, expected);
    if (status !== 200) {
      if (fault === 'denied-write') ticket = { ...ticket, closedAt: null };
      return {};
    }
    if (method === 'GET') return { id: ticket.id, status: ticket.status };
    const next = path.split('/').at(-1);
    if (next === 'RESOLVED') {
      ticket = { ...ticket, status: next, resolvedAt: new Date(1000), slaSolvedAt: new Date(1000) };
    } else if (next === 'CLOSED') {
      ticket = { ...ticket, status: next, closedAt: new Date(2000) };
    } else {
      assert.equal(ticket.status, 'CLOSED');
      const previousClosedAt = ticket.closedAt.toISOString();
      ticket = { ...ticket, status: fault === 'not-durable' ? 'CLOSED' : next, closedAt: null };
      messages = [...messages, { id: `audit-${calls.length}`, ticketId: ticket.id,
        senderId: fault === 'wrong-actor' ? other.id : actor.id, isInternal: true,
        metadata: { action: 'TICKET_REOPENED', previousClosedAt }, attachments: [] }];
      if (fault === 'message-loss') messages = messages.slice(1);
      if (fault === 'attachment-loss') messages = messages.map(message => ({ ...message, attachments: [] }));
      if (fault === 'history-loss') ticket = { ...ticket, resolvedAt: null };
    }
    return { id: ticket.id, status: next };
  };
  return { request, db, customer, other, support, admin, calls };
}

test('both staff reopen persisted CLOSED tickets after all denials, retaining history', async () => {
  const context = fixture();
  assert.deepEqual(await runClosedReopenProbe(context), { httpChecks: 18 });
  assert.equal(context.calls.length, 18);
  for (const actor of [context.support, context.admin]) {
    assert(context.calls.some(call => call.actor === actor && call.before === 'CLOSED'
      && call.path.endsWith('/status/OPEN') && call.expected === 200));
  }
  assert.equal(context.calls.filter(call => call.expected !== 200).length, 10);
  assert(context.calls.filter(call => call.expected !== 200).every(call => call.before === 'CLOSED'));
});

for (const fault of ['denied-write', 'not-durable', 'wrong-actor', 'message-loss', 'attachment-loss', 'history-loss']) {
  test(`rejects ${fault}`, async () => {
    await assert.rejects(runClosedReopenProbe(fixture(fault)), { name: 'AssertionError' });
  });
}
