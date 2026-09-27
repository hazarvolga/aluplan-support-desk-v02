'use strict';
// Called only by the guarded isolated rehearsal; importing performs no I/O.
async function runClosedReopenProbe({ request, db, customer, other, support, admin }) {
  const assert = require('node:assert/strict');
  const id = customer.ticket.id;
  const path = `/tickets/${id}`;
  // Pass the global CSRF middleware while deliberately omitting all auth cookies.
  const anonymous = { cookies: customer.cookies.filter(cookie => cookie.startsWith('XSRF-TOKEN=')), csrf: customer.csrf };
  assert.equal(anonymous.cookies.length, 1);
  assert.equal(decodeURIComponent(anonymous.cookies[0].slice('XSRF-TOKEN='.length)), anonymous.csrf);
  let httpChecks = 0;
  const checked = async (...args) => {
    const result = await request(...args);
    httpChecks++;
    return result;
  };
  const readTicket = () => db.ticket.findUnique({ where: { id } });
  const readMessages = () => db.ticketMessage.findMany({ where: { ticketId: id },
    orderBy: { id: 'asc' }, include: { attachments: { orderBy: { id: 'asc' } } } });
  const transition = async (status, actor) => {
    await checked(`${path}/status/${status}`, 200, actor, undefined, true, 'PATCH');
    const persisted = await readTicket();
    assert.equal(persisted.status, status);
    return persisted;
  };
  assert.equal((await readTicket()).status, 'OPEN');
  const originalMessages = await readMessages();
  assert(originalMessages.length > 0, 'reopen fixture requires existing messages');
  assert(originalMessages.some(message => message.attachments.length > 0), 'reopen fixture requires an attachment');
  for (const staff of [support, admin]) {
    await transition('RESOLVED', staff);
    const closed = await transition('CLOSED', staff);
    assert(closed.closedAt instanceof Date);
    const beforeMessages = await readMessages();
    for (const [actor, status, csrf] of [
      [customer, 403, true], [other, 403, true], [anonymous, 401, true],
      [support, 403, false], [admin, 403, false],
    ]) {
      await checked(`${path}/status/OPEN`, status, actor, undefined, csrf, 'PATCH');
      assert.deepEqual(await readTicket(), closed);
      assert.deepEqual(await readMessages(), beforeMessages);
    }
    const reopened = await transition('OPEN', staff);
    assert.equal(reopened.closedAt, null);
    assert.deepEqual(reopened.resolvedAt, closed.resolvedAt);
    assert.deepEqual(reopened.slaSolvedAt, closed.slaSolvedAt);
    const afterMessages = await readMessages();
    for (const original of beforeMessages) {
      assert.deepEqual(afterMessages.find(message => message.id === original.id), original);
    }
    const existingIds = new Set(beforeMessages.map(message => message.id));
    const added = afterMessages.filter(message => !existingIds.has(message.id));
    assert.equal(afterMessages.length, beforeMessages.length + 1);
    assert.equal(added.length, 1);
    assert.equal(added[0].ticketId, id);
    assert.equal(added[0].senderId, staff.id);
    assert.equal(added[0].isInternal, true);
    assert.equal(added[0].metadata?.action, 'TICKET_REOPENED');
    assert.equal(added[0].metadata?.previousClosedAt, closed.closedAt.toISOString());
    const visible = await checked(path, 200, customer);
    assert.equal(visible.id, id);
    assert.equal(visible.status, 'OPEN');
    assert(Array.isArray(visible.messages));
    assert(!visible.messages.some(message => message.isInternal || message.id === added[0].id));
  }
  return { httpChecks };
}

module.exports = { runClosedReopenProbe };
