import { createHash, randomUUID } from 'node:crypto';
import type { PrismaService } from '../prisma/prisma.service';

type InboundDb = Pick<PrismaService, 'inboundEmailLog'>;
export const INBOUND_PROCESSING_PREFIX = 'INBOUND_PROCESSING_V1:';
export const INBOUND_DONE_PREFIX = 'INBOUND_DONE_V1:';
export const INBOUND_HOLD_PREFIX = 'INBOUND_HOLD_V1:';
const reasons = [
    'PARSE_FAILED', 'MISSING_BODY', 'MISSING_IDENTITY', 'INVALID_INPUT',
    'PROCESSING_FAILED', 'FINALIZATION_FAILED', 'IDENTITY_CONFLICT',
    'LEGACY_UNVERIFIED', 'PROCESSING_OR_INTERRUPTED', 'INVALID_MARKER',
    'INBOUND_SENDER_NOT_ELIGIBLE', 'INBOUND_TICKET_OWNER_MISMATCH',
] as const;
export type HoldReason = typeof reasons[number];
type Attachment = { filename?: string; contentType?: string; content?: Buffer };
export type InboundClaimInput = {
    messageId: string; from: string; subject: string; body: string; attachments?: Attachment[];
    classification?: 'dsn' | 'message';
};
export type InboundClaim = { kind: 'claimed'; id: string; marker: string; fingerprint: string };
export type InboundClaimResult = InboundClaim | { kind: 'done'; id: string }
    | { kind: 'held'; id: string; reason: HoldReason };
type Marker = { owner?: string; fingerprint?: string; reason?: string; note?: string;
    failedAttachmentCount?: number; ticketMessageId?: string };
type ReviewRow = { processed: boolean; error?: string | null };

function safeReason(reason: string): HoldReason {
    return reasons.includes(reason as HoldReason) ? reason as HoldReason : 'PROCESSING_FAILED';
}

function readMarker(error: string | null | undefined, prefix: string): Marker | null {
    if (!error?.startsWith(prefix)) return null;
    try {
        const value = JSON.parse(error.slice(prefix.length));
        return value && typeof value === 'object' && !Array.isArray(value) ? value : null;
    } catch { return null; }
}

export function inboundFingerprint(input: InboundClaimInput): string {
    return createHash('sha256').update(JSON.stringify([
        input.from, input.subject, input.body, input.classification ?? 'message',
        (input.attachments ?? []).map(attachment => [
            attachment.filename ?? '', attachment.contentType ?? '',
            attachment.content?.length ?? 0,
            createHash('sha256').update(attachment.content ?? Buffer.alloc(0)).digest('hex'),
        ]),
    ])).digest('hex');
}

function isUniqueConflict(error: unknown): boolean {
    return typeof error === 'object' && error !== null && 'code' in error && error.code === 'P2002';
}

function validateInput(input: InboundClaimInput): void {
    if (typeof input.messageId !== 'string' || !input.messageId.trim() || input.messageId !== input.messageId.trim()
        || input.messageId.length > 255
        || /[\r\n\0]/.test(input.messageId) || input.messageId.startsWith('inbound-hold:')
        || typeof input.from !== 'string' || !input.from.trim() || input.from.length > 255
        || typeof input.subject !== 'string' || typeof input.body !== 'string'
        || (input.attachments !== undefined && (!Array.isArray(input.attachments)
            || input.attachments.some(a => !a || (a.content !== undefined && !Buffer.isBuffer(a.content)))))) {
        throw new Error('INVALID_INBOUND_IDENTITY');
    }
}

function retainedAttachmentEvidence(done: Marker | null, error?: string | null): Partial<Marker> {
    const legacy = error?.match(/^INBOUND_ATTACHMENT_FAILURE count=(\d+) ticketMessageId=([a-zA-Z0-9-]+)$/);
    if (done?.note !== 'INBOUND_ATTACHMENT_FAILURE' && !legacy) return {};
    const count = done?.failedAttachmentCount ?? Number(legacy?.[1]);
    const message = done?.ticketMessageId ?? legacy?.[2];
    return {
        note: 'INBOUND_ATTACHMENT_FAILURE',
        ...(Number.isSafeInteger(count) && count > 0 ? { failedAttachmentCount: count } : {}),
        ...(typeof message === 'string' && message.length <= 255 ? { ticketMessageId: message } : {}),
    };
}

/** Unique create is the claim. A false processed flag never grants permission to replay. */
export async function claimInbound(db: InboundDb, input: InboundClaimInput): Promise<InboundClaimResult> {
    validateInput(input);
    const fingerprint = inboundFingerprint(input);
    const marker = INBOUND_PROCESSING_PREFIX + JSON.stringify({ owner: randomUUID(), fingerprint });
    try {
        const row = await db.inboundEmailLog.create({ data: {
            messageId: input.messageId, from: input.from, subject: input.subject,
            processed: false, error: marker,
        } });
        return { kind: 'claimed', id: row.id, marker, fingerprint };
    } catch (error) {
        if (!isUniqueConflict(error)) throw error;
    }
    const row = await db.inboundEmailLog.findUnique({ where: { messageId: input.messageId } });
    if (!row) throw new Error('INBOUND_CLAIM_STATE_UNAVAILABLE');
    const done = readMarker(row.error, INBOUND_DONE_PREFIX);
    const pending = readMarker(row.error, INBOUND_PROCESSING_PREFIX);
    const held = readMarker(row.error, INBOUND_HOLD_PREFIX);
    if (row.processed && done?.fingerprint === fingerprint) return { kind: 'done', id: row.id };
    if (!row.processed && pending?.fingerprint === fingerprint && typeof pending.owner === 'string') {
        return { kind: 'held', id: row.id, reason: 'PROCESSING_OR_INTERRUPTED' };
    }
    if (held) return { kind: 'held', id: row.id, reason: safeReason(held.reason ?? '') };
    const previous = done ?? pending;
    const reason: HoldReason = previous?.fingerprint && previous.fingerprint !== fingerprint
        ? 'IDENTITY_CONFLICT' : 'LEGACY_UNVERIFIED';
    // Preserve completed ticket evidence, while making the collision visible. A racing
    // owner can no longer complete this exact claim after the conditional rewrite.
    const result = await db.inboundEmailLog.updateMany({
        where: { id: row.id, processed: row.processed, error: row.error },
        data: { error: INBOUND_HOLD_PREFIX + JSON.stringify({
            fingerprint: previous?.fingerprint, reason,
            ...retainedAttachmentEvidence(done, row.error),
        }) },
    });
    if (result.count !== 1) throw new Error('INBOUND_CLAIM_STATE_CHANGED');
    return { kind: 'held', id: row.id, reason };
}

export async function completeInbound(db: InboundDb, claim: InboundClaim, outcome: {
    ticketId?: string | null; reason?: string; failedAttachmentCount?: number; ticketMessageId?: string | null;
}): Promise<boolean> {
    const failedAttachmentCount = outcome.failedAttachmentCount ?? 0;
    const error = INBOUND_DONE_PREFIX + JSON.stringify({
        fingerprint: claim.fingerprint,
        ...(outcome.reason === 'IGNORED_DSN' ? { reason: outcome.reason } : {}),
        ...(failedAttachmentCount > 0 ? {
            note: 'INBOUND_ATTACHMENT_FAILURE', failedAttachmentCount,
            ticketMessageId: outcome.ticketMessageId ?? null,
        } : {}),
    });
    const result = await db.inboundEmailLog.updateMany({
        where: { id: claim.id, processed: false, error: claim.marker },
        data: { processed: true, processedAt: new Date(), ticketId: outcome.ticketId ?? null, error },
    });
    return result.count === 1;
}

export async function holdInbound(db: InboundDb, claim: InboundClaim, reason: string, outcome: {
    ticketId?: string | null; ticketMessageId?: string | null; failedAttachmentCount?: number;
} = {}): Promise<boolean> {
    // Internal, returned or ownership-checked IDs only. Unknown IDs must not erase evidence.
    const failedAttachmentCount = outcome.failedAttachmentCount ?? 0;
    const result = await db.inboundEmailLog.updateMany({
        where: { id: claim.id, processed: false, error: claim.marker },
        data: {
            ...(outcome.ticketId ? { ticketId: outcome.ticketId } : {}),
            error: INBOUND_HOLD_PREFIX + JSON.stringify({
                fingerprint: claim.fingerprint, reason: safeReason(reason),
                ...(outcome.ticketMessageId ? { ticketMessageId: outcome.ticketMessageId } : {}),
                ...(Number.isSafeInteger(failedAttachmentCount) && failedAttachmentCount > 0 ? {
                    note: 'INBOUND_ATTACHMENT_FAILURE', failedAttachmentCount,
                } : {}),
            }),
        },
    });
    return result.count === 1;
}

/** Separate namespace cannot collide with sender-supplied Message-ID claims. */
export function inboundHoldMessageId(key: string): string {
    return 'inbound-hold:' + createHash('sha256').update(key).digest('hex');
}

export async function recordInboundHold(db: InboundDb, input: {
    key: string; reason: string; from?: string; subject?: string;
}): Promise<void> {
    const messageId = inboundHoldMessageId(input.key);
    try {
        await db.inboundEmailLog.create({ data: {
            messageId, from: (input.from || 'unknown').slice(0, 255), subject: input.subject ?? null,
            processed: false, error: INBOUND_HOLD_PREFIX + JSON.stringify({ reason: safeReason(input.reason) }),
        } });
    } catch (error) { if (!isUniqueConflict(error)) throw error; }
}

/** Only fixed reasons escape to the operator API; no owner token or raw exception. */
export function summarizeInboundState(row: ReviewRow): { state: 'held' | 'pending' | 'done'; reason: string } {
    const held = readMarker(row.error, INBOUND_HOLD_PREFIX);
    if (held) return { state: 'held', reason: safeReason(held.reason ?? '') };
    if (!row.processed && readMarker(row.error, INBOUND_PROCESSING_PREFIX)) {
        return { state: 'pending', reason: 'PROCESSING_OR_INTERRUPTED' };
    }
    const done = readMarker(row.error, INBOUND_DONE_PREFIX);
    if (row.processed && done) return { state: 'done', reason: done.note === 'INBOUND_ATTACHMENT_FAILURE'
        ? 'INBOUND_ATTACHMENT_FAILURE' : 'COMPLETED' };
    return { state: 'held', reason: 'LEGACY_UNVERIFIED' };
}
