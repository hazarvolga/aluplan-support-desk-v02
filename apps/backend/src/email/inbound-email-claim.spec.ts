import { claimInbound, completeInbound, holdInbound, recordInboundHold, summarizeInboundState } from './inbound-email-claim';

const input = { messageId: '<synthetic@example.invalid>', from: 'customer@example.invalid', subject: 'Subject', body: 'Body' };
function fixture(seed?: any) {
    const rows = new Map<string, any>(seed ? [[seed.messageId, seed]] : []);
    const db: any = { inboundEmailLog: {
        create: jest.fn(async ({ data }) => {
            if (rows.has(data.messageId)) throw { code: 'P2002' };
            const row = { id: String(rows.size), ...data };
            rows.set(data.messageId, row); return row;
        }),
        findUnique: jest.fn(async ({ where }) => rows.get(where.messageId) ?? null),
        updateMany: jest.fn(async ({ where, data }) => {
            const row = [...rows.values()].find(item => Object.entries(where).every(([key, value]) => item[key] === value));
            if (!row) return { count: 0 };
            rows.set(row.messageId, { ...row, ...data }); return { count: 1 };
        }),
    } };
    return { db, rows };
}

describe('durable inbound claims (synthetic DB, no transaction claim)', () => {
    it('retains known domain evidence on hold without acknowledging or allowing stale overwrite', async () => {
        const { db, rows } = fixture(); const claim = await claimInbound(db, input);
        if (claim.kind !== 'claimed') throw Error('claim');
        const outcome = { ticketId: '00000000-0000-4000-8000-000000000001',
            ticketMessageId: '00000000-0000-4000-8000-000000000002', failedAttachmentCount: 1 };
        expect(await holdInbound(db, claim, 'PROCESSING_FAILED', outcome)).toBe(true);
        const row = rows.get(input.messageId);
        expect(row).toMatchObject({ processed: false, ticketId: outcome.ticketId });
        expect(JSON.parse(row.error.slice('INBOUND_HOLD_V1:'.length))).toMatchObject({
            ticketMessageId: outcome.ticketMessageId, failedAttachmentCount: 1, note: 'INBOUND_ATTACHMENT_FAILURE',
        });
        expect(await holdInbound(db, claim, 'PROCESSING_FAILED', { ticketId: 'other' })).toBe(false);
        expect(await completeInbound(db, claim, {})).toBe(false);
        expect((await claimInbound(db, input)).kind).toBe('held');
        expect(rows.get(input.messageId)).toEqual(row);
    });

    it('does not erase existing ticket linkage when no new evidence is known', async () => {
        const { db, rows } = fixture(); const claim = await claimInbound(db, input);
        if (claim.kind !== 'claimed') throw Error('claim');
        rows.set(input.messageId, { ...rows.get(input.messageId), ticketId: 'known-ticket' });
        await holdInbound(db, claim, 'PROCESSING_FAILED');
        expect(rows.get(input.messageId)).toHaveProperty('ticketId', 'known-ticket');
    });
    it('only one concurrent ingress acquires; pending never acknowledges', async () => {
        const { db } = fixture();
        const results = await Promise.all([claimInbound(db, input), claimInbound(db, input)]);
        expect(results.map(r => r.kind).sort()).toEqual(['claimed', 'held']);
    });
    it('acknowledges only completed identical content and preserves attachment fence', async () => {
        const { db, rows } = fixture(); const claim = await claimInbound(db, input);
        if (claim.kind !== 'claimed') throw Error('claim');
        expect(await completeInbound(db, claim, { ticketId: 'ticket', failedAttachmentCount: 1, ticketMessageId: 'message' })).toBe(true);
        expect((await claimInbound(db, input)).kind).toBe('done');
        expect(rows.get(input.messageId).error).toContain('INBOUND_ATTACHMENT_FAILURE');
    });
    it('changed body on completed ID is visible hold without losing successful fence', async () => {
        const { db, rows } = fixture(); const claim = await claimInbound(db, input);
        if (claim.kind !== 'claimed') throw Error('claim');
        await completeInbound(db, claim, { ticketId: 'ticket' });
        expect((await claimInbound(db, { ...input, body: 'Changed' })).kind).toBe('held');
        expect(rows.get(input.messageId)).toMatchObject({ processed: true, ticketId: 'ticket' });
        expect(summarizeInboundState(rows.get(input.messageId))).toEqual({ state: 'held', reason: 'IDENTITY_CONFLICT' });
    });
    it('attachment bytes participate in identity', async () => {
        const { db } = fixture();
        const withAttachment = { ...input, attachments: [{ filename: 'a', contentType: 'text/plain', content: Buffer.from('a') }] };
        const claim = await claimInbound(db, withAttachment);
        if (claim.kind !== 'claimed') throw Error('claim');
        await completeInbound(db, claim, {});
        expect((await claimInbound(db, { ...withAttachment, attachments: [{ ...withAttachment.attachments[0], content: Buffer.from('b') }] })).kind).toBe('held');
    });
    it.each([false, true])('never replays or auto-acks legacy processed=%s', async processed => {
        const { db } = fixture({ id: 'legacy', ...input, processed, error: null });
        expect((await claimInbound(db, input)).kind).toBe('held');
    });
    it('collision fences active owner completion', async () => {
        const { db } = fixture(); const claim = await claimInbound(db, input);
        if (claim.kind !== 'claimed') throw Error('claim');
        await claimInbound(db, { ...input, body: 'different' });
        expect(await completeInbound(db, claim, {})).toBe(false);
    });
    it('holds ambiguous failures without replay or leaking arbitrary exception strings', async () => {
        const { db, rows } = fixture(); const claim = await claimInbound(db, input);
        if (claim.kind !== 'claimed') throw Error('claim');
        expect(await holdInbound(db, claim, 'secret-provider-error')).toBe(true);
        expect((await claimInbound(db, input)).kind).toBe('held');
        expect(rows.get(input.messageId).error).not.toContain('secret-provider-error');
    });
    it('records preparse holds idempotently', async () => {
        const { db, rows } = fixture();
        await recordInboundHold(db, { key: 'imap-local-1', reason: 'PARSE_FAILED' });
        await recordInboundHold(db, { key: 'imap-local-1', reason: 'PARSE_FAILED' });
        expect(rows.size).toBe(1);
        expect(summarizeInboundState([...rows.values()][0])).toEqual({ state: 'held', reason: 'PARSE_FAILED' });
    });
    it('propagates DB errors rather than treating them as duplicates', async () => {
        const { db } = fixture(); db.inboundEmailLog.create.mockRejectedValue(new Error('unavailable'));
        await expect(claimInbound(db, input)).rejects.toThrow('unavailable');
    });
    it.each(['', ' <id> ', 'id\r\ninjected', 'inbound-hold:sender-value', 'a'.repeat(256)])('rejects invalid identity before create (%s)', async messageId => {
        const { db } = fixture();
        await expect(claimInbound(db, { ...input, messageId })).rejects.toThrow();
        expect(db.inboundEmailLog.create).not.toHaveBeenCalled();
    });
    it('changed DSN classification cannot acknowledge a different processing outcome', async () => {
        const { db } = fixture(); const claim = await claimInbound(db, { ...input, classification: 'dsn' });
        if (claim.kind !== 'claimed') throw Error('claim');
        await completeInbound(db, claim, { reason: 'IGNORED_DSN' });
        expect((await claimInbound(db, { ...input, classification: 'message' })).kind).toBe('held');
    });
    it('collision CAS failure propagates rather than silently reporting an unrecorded hold', async () => {
        const { db } = fixture(); await claimInbound(db, input);
        db.inboundEmailLog.updateMany.mockResolvedValue({ count: 0 });
        await expect(claimInbound(db, { ...input, body: 'changed' })).rejects.toThrow('INBOUND_CLAIM_STATE_CHANGED');
    });
    it('maps pending and malformed legacy markers to safe operator summaries', () => {
        expect(summarizeInboundState({ processed: false, error: 'INBOUND_PROCESSING_V1:{}' })).toEqual({
            state: 'pending', reason: 'PROCESSING_OR_INTERRUPTED',
        });
        expect(summarizeInboundState({ processed: true, error: 'INBOUND_DONE_V1:{broken' })).toEqual({
            state: 'held', reason: 'LEGACY_UNVERIFIED',
        });
    });
    it('preserves legacy partial-attachment evidence when holding unverified identity', async () => {
        const { db, rows } = fixture({ id: 'legacy', ...input, processed: true,
            error: 'INBOUND_ATTACHMENT_FAILURE count=2 ticketMessageId=message-1' });
        expect((await claimInbound(db, input)).kind).toBe('held');
        const error = rows.get(input.messageId).error;
        expect(error).toContain('INBOUND_ATTACHMENT_FAILURE');
        expect(error).toContain('"failedAttachmentCount":2');
        expect(error).toContain('"ticketMessageId":"message-1"');
    });
});
