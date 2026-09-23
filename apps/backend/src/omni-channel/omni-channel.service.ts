import { Injectable, Logger, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { TicketsService } from '../tickets/tickets.service';
import { isDeliveryStatusNotification } from '../email/email-bounce.util';
import { createHash } from 'node:crypto';
import { claimInbound, completeInbound, holdInbound, recordInboundHold } from '../email/inbound-email-claim';

@Injectable()
export class OmniChannelService {
    private readonly logger = new Logger(OmniChannelService.name);

    constructor(
        private prisma: PrismaService,
        private ticketsService: TicketsService,
    ) { }

    async handleInboundEmailWebhook(payload: any) {
        if (!payload || typeof payload !== 'object' || Array.isArray(payload)) {
            throw new Error('INVALID_INBOUND_PAYLOAD');
        }
        // Extract basic mail info (assuming a generic/Mailgun/Resend style payload)
        const from = payload.from || payload.sender;
        const subject = payload.subject || 'No Subject';
        const body = payload.text || payload.body || payload['stripped-text'] || 'Empty Message';
        const messageId = payload.messageId || payload['Message-Id'];
        const headers = payload.headers || payload.Headers || payload;

        if (typeof from !== 'string' || !from || typeof messageId !== 'string' || !messageId.trim()) {
            await recordInboundHold(this.prisma, {
                key: `webhook-hold:${createHash('sha256').update(JSON.stringify([from, subject, body])).digest('hex')}`,
                reason: 'MISSING_IDENTITY',
            });
            return 'held';
        }
        if (typeof subject !== 'string' || typeof body !== 'string') {
            await recordInboundHold(this.prisma, {
                key: `webhook-invalid:${createHash('sha256').update(JSON.stringify([messageId, from, subject, body])).digest('hex')}`,
                reason: 'INVALID_INPUT',
            });
            return 'held';
        }
        const isDsn = isDeliveryStatusNotification({ from, subject, body, headers });
        let claim;
        try {
            claim = await claimInbound(this.prisma, { messageId, from, subject, body, classification: isDsn ? 'dsn' : 'message' });
        } catch (error) {
            if (!(error instanceof Error) || error.message !== 'INVALID_INBOUND_IDENTITY') throw error;
            await recordInboundHold(this.prisma, {
                key: `webhook-invalid:${createHash('sha256').update(JSON.stringify([messageId, from, subject, body])).digest('hex')}`,
                reason: 'INVALID_INPUT',
            });
            return 'held';
        }
        if (claim.kind !== 'claimed') return claim.kind === 'done' ? 'completed' : 'held';

        try {
            if (isDsn) {
                return await completeInbound(this.prisma, claim, { reason: 'IGNORED_DSN' }) ? 'completed' : 'held';
            }
            const sender = await this.prisma.user.findUnique({
                where: { email: from }, include: { role: true },
            });
            if (!sender?.id || sender.status !== 'ACTIVE' || sender.deletedAt || !sender.role?.name?.trim()) {
                throw new ForbiddenException('INBOUND_SENDER_NOT_ELIGIBLE');
            }

            // Thread detection - Support both [#SUP-123] and [SUP-123] formats
            const ticketMatch = subject.match(/\[#?SUP-(\d+)\]/i);
            let ticketId = null;

            if (ticketMatch) {
                const ticketNumber = `SUP-${ticketMatch[1]}`;
                const ticket = await this.prisma.ticket.findUnique({ where: { ticketNumber } });
                if (ticket) {
                    if (ticket.userId !== sender.id) {
                        throw new ForbiddenException('INBOUND_TICKET_OWNER_MISMATCH');
                    }
                    const role = 'customer'; // Default to customer role for webhook senders

                    await this.ticketsService.addMessage(ticket.id, {
                        message: body,
                        isInternal: false,
                    }, sender.id, role);
                    ticketId = ticket.id;
                }
            }

            if (!ticketId) {
                // Only an eligible existing account can open a ticket through email.
                const newTicket = await this.ticketsService.create({
                    subject,
                    description: body,
                    priority: 'MEDIUM' as any,
                }, sender.id);
                ticketId = newTicket.id;
            }

            return await completeInbound(this.prisma, claim, { ticketId }) ? 'completed' : 'held';
        } catch (error: any) {
            this.logger.error('Inbound webhook processing failed; review required before replay.');
            const reason = error instanceof ForbiddenException &&
                ['INBOUND_SENDER_NOT_ELIGIBLE', 'INBOUND_TICKET_OWNER_MISMATCH'].includes(error.message)
                ? error.message as 'INBOUND_SENDER_NOT_ELIGIBLE' | 'INBOUND_TICKET_OWNER_MISMATCH'
                : 'PROCESSING_FAILED';
            await holdInbound(this.prisma, claim, reason);
            return 'held';
        }
    }
}
