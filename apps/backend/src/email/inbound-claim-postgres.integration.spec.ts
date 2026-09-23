import { randomUUID } from 'node:crypto';
import { PrismaClient } from '@aluplan/database';
import { PrismaPg } from '@prisma/adapter-pg';
import { claimInbound, completeInbound, holdInbound, InboundClaim } from './inbound-email-claim';

// Dedicated disposable database only. No application bootstrap or environment DB URL.
const run = process.env.MAIL_CLAIM_POSTGRES === 'synthetic-local-only' ? describe : describe.skip;
function client() {
    return new PrismaClient({ adapter: new PrismaPg({
        host: '127.0.0.1', port: 15432, database: 'claim_test', user: 'claim_test',
        password: 'SyntheticClaimOnly-20260923', max: 10, connectionTimeoutMillis: 5000,
        options: '-c statement_timeout=10000 -c lock_timeout=8000',
    }) });
}
function input() {
    return { messageId: `<${randomUUID()}@example.invalid>`, from: 'synthetic@example.invalid',
        subject: 'Synthetic claim', body: 'Synthetic body' };
}
function claimed(value: Awaited<ReturnType<typeof claimInbound>>): InboundClaim {
    expect(value.kind).toBe('claimed');
    if (value.kind !== 'claimed') throw new Error('Expected exclusive claim');
    return value;
}

run('actual PostgreSQL inbound claims (not ticket transaction acceptance)', () => {
    jest.setTimeout(30000);
    let a: PrismaClient;
    let b: PrismaClient;
    beforeAll(async () => {
        a = client(); b = client();
        const identity = await a.$queryRaw<Array<{ db: string; role: string; version: string }>>`
            SELECT current_database() AS db, current_user AS role, current_setting('server_version') AS version`;
        expect(identity[0]).toEqual({ db: 'claim_test', role: 'claim_test', version: expect.stringMatching(/^17\./) });
        expect(await a.inboundEmailLog.count()).toBe(0);
    });
    afterAll(async () => { await Promise.all([a?.$disconnect(), b?.$disconnect()]); });

    it('grants one owner across two clients racing on the same unique message ID', async () => {
        const mail = input();
        let release!: () => void;
        let announce!: () => void;
        const gate = new Promise<void>(resolve => { release = resolve; });
        const entered = new Promise<void>(resolve => { announce = resolve; });
        const owner = a.$transaction(async tx => {
            const result = claimed(await claimInbound(tx as never, mail));
            announce();
            await gate;
            return result;
        }, { timeout: 15000 });
        // Surface setup errors instead of waiting forever for the test barrier.
        await Promise.race([entered, owner.then(() => undefined)]);
        const competitors = Array.from({ length: 6 }, () => claimInbound(b as never, mail));
        const competingResults = Promise.all(competitors);
        const settlement = Promise.allSettled([owner, competingResults, ...competitors]);
        try {
            let waiting = false;
            for (let i = 0; i < 20; i++) {
                const locks = await a.$queryRaw<Array<{ n: bigint }>>`
                    SELECT count(*) AS n FROM pg_stat_activity
                    WHERE datname = current_database() AND wait_event_type = 'Lock'`;
                if (Number(locks[0].n) > 0) { waiting = true; break; }
                await new Promise(resolve => setTimeout(resolve, 50));
            }
            expect(waiting).toBe(true);
        } finally { release(); await settlement; }
        const winner = await owner;
        expect((await competingResults).map(result => result.kind)).toEqual(Array(6).fill('held'));
        expect(await a.inboundEmailLog.count({ where: { messageId: mail.messageId } })).toBe(1);
        expect(await completeInbound(a as never, winner, {})).toBe(true);
        expect((await claimInbound(b as never, mail)).kind).toBe('done');
    });

    it('allows only one competing terminal update and rejects stale owner updates', async () => {
        const mail = input();
        const owner = claimed(await claimInbound(a as never, mail));
        const ticketId = randomUUID();
        const [completed, held] = await Promise.all([
            completeInbound(a as never, owner, { ticketId }),
            holdInbound(b as never, owner, 'PROCESSING_FAILED'),
        ]);
        expect(Number(completed) + Number(held)).toBe(1);
        const row = await a.inboundEmailLog.findUniqueOrThrow({ where: { messageId: mail.messageId } });
        expect(row.processed).toBe(completed);
        expect(row.ticketId).toBe(completed ? ticketId : null);
        expect(row.error).toContain(completed ? 'INBOUND_DONE_V1:' : 'INBOUND_HOLD_V1:');
        expect(await completeInbound(a as never, owner, {})).toBe(false);
        expect(await holdInbound(b as never, owner, 'PROCESSING_FAILED')).toBe(false);
        expect(await b.inboundEmailLog.findUniqueOrThrow({ where: { messageId: mail.messageId } })).toEqual(row);
    });

    it('fences conflicting payloads and retains completed attachment-failure evidence', async () => {
        const mail = input();
        const owner = claimed(await claimInbound(a as never, mail));
        expect(await claimInbound(b as never, { ...mail, body: 'Conflicting body' })).toHaveProperty('reason', 'IDENTITY_CONFLICT');
        expect(await completeInbound(a as never, owner, {})).toBe(false);
        const completedMail = input();
        const completedOwner = claimed(await claimInbound(a as never, completedMail));
        const ticketId = randomUUID(); const ticketMessageId = randomUUID();
        expect(await completeInbound(a as never, completedOwner, { ticketId, ticketMessageId, failedAttachmentCount: 1 })).toBe(true);
        expect(await claimInbound(b as never, { ...completedMail, body: 'Conflicting body' })).toHaveProperty('reason', 'IDENTITY_CONFLICT');
        const row = await b.inboundEmailLog.findUniqueOrThrow({ where: { messageId: completedMail.messageId } });
        expect(row).toEqual(expect.objectContaining({ processed: true, ticketId }));
        expect(row.error).toContain(ticketMessageId);
        expect(row.error).toContain('"failedAttachmentCount":1');
        expect((await claimInbound(a as never, completedMail)).kind).toBe('held');
    });

    it('retains an interrupted owner across client replacement without reacquiring it', async () => {
        const mail = input();
        const transient = client();
        try { claimed(await claimInbound(transient as never, mail)); }
        finally { await transient.$disconnect(); }
        const before = await a.inboundEmailLog.findUniqueOrThrow({ where: { messageId: mail.messageId } });
        expect(await claimInbound(b as never, mail)).toEqual({ kind: 'held', id: before.id, reason: 'PROCESSING_OR_INTERRUPTED' });
        expect(await b.inboundEmailLog.findUniqueOrThrow({ where: { messageId: mail.messageId } })).toEqual(before);
    });
});
