import { Injectable, Logger, OnModuleInit, OnModuleDestroy, Inject, forwardRef, ForbiddenException } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '../prisma/prisma.service';
import { SettingsService } from '../settings/settings.service';
import { TicketsService } from '../tickets/tickets.service';
import { _SIMPLE_MAP_CONFIG, SimpleImapConfig } from './interfaces/imap.interface';
import imaps from 'imap-simple';
import { simpleParser } from 'mailparser';
import { CommunicationChannel } from '@aluplan/database';
import { StorageService } from '../common/services/storage.service';
import { PiiMaskingService } from '../common/services/pii-masking.service';
import { isDeliveryStatusNotification } from './email-bounce.util';
import { createHash } from 'node:crypto';
import { claimInbound, completeInbound, holdInbound, recordInboundHold, inboundHoldMessageId } from './inbound-email-claim';

@Injectable()
export class EmailInboundService implements OnModuleInit, OnModuleDestroy {
    private readonly logger = new Logger(EmailInboundService.name);
    private isProcessing = false;
    private stopping = false;
    private activePoll: Promise<void> | undefined;

    constructor(
        private prisma: PrismaService,
        private settings: SettingsService,
        @Inject(forwardRef(() => TicketsService))
        private ticketsService: TicketsService,
        private storage: StorageService,
        private piiMaskingService: PiiMaskingService,
    ) { }

    onModuleInit() {
        this.logger.log('EmailInboundService initialized');
    }

    @Cron(CronExpression.EVERY_MINUTE, { waitForCompletion: true })
    async handleInboundEmails() {
        if (this.stopping || this.isProcessing) return;
        this.isProcessing = true;
        // Publish the tracked promise before any asynchronous work can start.
        this.activePoll = Promise.resolve().then(() => this.pollInboundEmails());
        try {
            await this.activePoll;
        } finally {
            this.activePoll = undefined;
            this.isProcessing = false;
        }
    }

    async onModuleDestroy() {
        this.stopping = true;
        await this.activePoll;
    }

    private async pollInboundEmails() {
        let connection: any;
        try {
            const config = await this.getImapConfig();
            if (!config) {
                this.logger.warn('IMAP not configured, skipping inbound email check');
                return;
            }
            connection = await imaps.connect({ imap: config });
            const box = await connection.openBox('INBOX');

            const searchCriteria = ['UNSEEN'];
            const fetchOptions = { bodies: ['HEADER', 'TEXT', ''], markSeen: false };

            const messages = await connection.search(searchCriteria, fetchOptions);

            for (const item of messages) {
                try {
                    const id = item.attributes?.uid;
                    const locator = `IMAP INBOX UID ${Number.isSafeInteger(id) ? id : 'unknown'}; UIDVALIDITY ${Number.isSafeInteger(box?.uidvalidity) ? box.uidvalidity : 'unknown'}`;
                    const reviewKey = `imap-hold:${createHash('sha256').update(JSON.stringify([
                        config.host, config.user, 'INBOX', box?.uidvalidity ?? 'unknown', id ?? 'unknown',
                    ])).digest('hex')}`;
                    // A previously held delivery needs reconciliation, not another parse/write attempt.
                    if (await this.prisma.inboundEmailLog.findUnique({ where: { messageId: inboundHoldMessageId(reviewKey) } })) continue;
                    if (!Number.isSafeInteger(box?.uidvalidity) || box.uidvalidity <= 0) {
                        await recordInboundHold(this.prisma, { key: reviewKey, reason: 'MISSING_IDENTITY', subject: locator });
                        continue;
                    }
                    const all = item.parts?.find((part: any) => part.which === '');
                    if (!all || !Number.isSafeInteger(id) || id <= 0) {
                        await recordInboundHold(this.prisma, { key: reviewKey, reason: 'MISSING_BODY', subject: locator });
                        continue;
                    }
                    let mail;
                    try {
                        mail = await simpleParser(all.body);
                    } catch {
                        await recordInboundHold(this.prisma, { key: reviewKey, reason: 'PARSE_FAILED', subject: locator });
                        this.logger.error('Inbound email parsing failed; delivery requires review.');
                        continue;
                    }
                    const messageId = item.parts.find((p: any) => p.which === 'HEADER')?.body['message-id']?.[0];
                    if (await this.processMail(mail, messageId, reviewKey, locator)) {
                        await connection.addFlags(id, '\\Seen');
                    }
                } catch {
                    // Includes failed ACKs: a durable completion fence makes the next ACK safe to retry.
                    this.logger.error('Inbound email delivery or acknowledgment failed; source mail retained.');
                }
            }
        } catch {
            this.logger.error('IMAP polling failed; source mail retained.');
        } finally {
            try {
                if (connection) await connection.end();
            } catch {
                this.logger.error('IMAP connection cleanup failed.');
            }
        }
    }

    async verifyImap(): Promise<{ available: boolean; message: string }> {
        try {
            const config = await this.getImapConfig();
            if (!config) {
                return { available: false, message: 'IMAP not configured' };
            }
            const connection: any = await imaps.connect({ imap: config });
            connection.end();
            return { available: true, message: 'Connection successful' };
        } catch (error: any) {
            this.logger.error(`IMAP Verification Error: ${error.message}`);
            return { available: false, message: error.message };
        }
    }

    private async getImapConfig(): Promise<SimpleImapConfig | null> {
        const host = await this.settings.getValue('email.imap.host');
        if (!host) return null;

        // node-imap autotls can fall back to plaintext when STARTTLS is absent.
        if ((await this.settings.getValue('email.imap.tls')) === 'false') {
            throw new Error('IMAP requires direct TLS; configure the TLS port (usually 993) and enable TLS');
        }

        return {
            host,
            port: parseInt((await this.settings.getValue('email.imap.port')) ?? '993', 10),
            user: (await this.settings.getValue('email.imap.user')) ?? '',
            password: (await this.settings.getValue('email.imap.pass')) ?? '',
            tls: true,
            authTimeout: 10000,
            tlsOptions: { 
                rejectUnauthorized: true,
                minVersion: 'TLSv1.2'
            }
        };
    }

    private async processMail(mail: any, messageId: string | undefined, reviewKey?: string, locator?: string): Promise<boolean> {
        const from = mail?.from?.value?.[0]?.address;
        const subject = mail?.subject || '';
        const body = mail?.text || mail?.html || '';

        if (typeof from !== 'string' || !from || typeof messageId !== 'string' || !messageId.trim()) {
            await recordInboundHold(this.prisma, {
                key: reviewKey ?? `imap-hold:${createHash('sha256').update(JSON.stringify([from, subject, body])).digest('hex')}`,
                reason: 'MISSING_IDENTITY',
                subject: locator,
            });
            return false;
        }
        if (typeof subject !== 'string' || typeof body !== 'string') {
            await recordInboundHold(this.prisma, {
                key: reviewKey ?? `imap-invalid:${createHash('sha256').update(JSON.stringify([messageId, from, subject, body])).digest('hex')}`,
                reason: 'INVALID_INPUT',
                subject: locator,
            });
            return false;
        }
        const isDsn = isDeliveryStatusNotification({ from, subject, body, headers: mail.headers });
        let claim;
        try {
            claim = await claimInbound(this.prisma, {
                messageId, from, subject, body, attachments: mail.attachments,
                classification: isDsn ? 'dsn' : 'message',
            });
        } catch (error) {
            if (!(error instanceof Error) || error.message !== 'INVALID_INBOUND_IDENTITY') throw error;
            await recordInboundHold(this.prisma, {
                key: reviewKey ?? `imap-invalid:${createHash('sha256').update(JSON.stringify([messageId, from, subject, body])).digest('hex')}`,
                reason: 'INVALID_INPUT',
                subject: locator,
            });
            return false;
        }
        if (claim.kind !== 'claimed') return claim.kind === 'done';

        let ticketId: string | null = null;
        let ticketMessageId: string | null = null;
        let failedAttachmentCount = 0;
        try {
            if (isDsn) {
                return await completeInbound(this.prisma, claim, { reason: 'IGNORED_DSN' });
            }
            const sender = await this.prisma.user.findUnique({
                where: { email: from }, include: { role: true },
            });
            if (!sender?.id || sender.status !== 'ACTIVE' || sender.deletedAt || !sender.role?.name?.trim()) {
                throw new ForbiddenException('INBOUND_SENDER_NOT_ELIGIBLE');
            }

            // Logic: Ticket Threading
            const ticketMatch = subject.match(/\[(SUP-\d+)\]/);

            if (ticketMatch) {
                const ticketNumber = ticketMatch[1];
                const ticket = await this.prisma.ticket.findUnique({ where: { ticketNumber } });
                if (ticket) {
                    if (ticket.userId !== sender.id) {
                        throw new ForbiddenException('INBOUND_TICKET_OWNER_MISMATCH');
                    }

                    ticketId = ticket.id;
                    const message = await this.ticketsService.addMessage(ticket.id, {
                        message: body,
                        isInternal: false,
                        channel: CommunicationChannel.EMAIL,
                    }, sender.id, 'CUSTOMER');
                    ticketMessageId = message.id;

                    // Handle attachments for threaded message
                    if (mail.attachments && mail.attachments.length > 0) {
                        for (const attachment of mail.attachments) {
                            try {
                                const key = await this.storage.uploadFile({
                                    buffer: attachment.content,
                                    originalname: attachment.filename || 'unnamed-file',
                                    mimetype: attachment.contentType
                                } as any, `tickets/${ticket.id}/messages/${message.id}`);

                                await this.prisma.attachment.create({
                                    data: {
                                        messageId: message.id,
                                        fileName: attachment.filename || 'unnamed-file',
                                        fileSize: attachment.size,
                                        mimeType: attachment.contentType,
                                        url: key,
                                    }
                                });
                            } catch {
                                failedAttachmentCount += 1;
                                this.logger.error('Inbound email attachment processing failed.');
                            }
                        }
                    }
                }
            }

            if (!ticketId) {
                // Email intake never provisions accounts or grants staff authority.
                const newTicket = await this.ticketsService.create({
                    subject,
                    description: body,
                    priority: 'MEDIUM',
                } as any, sender.id);
                ticketId = newTicket.id;
                const message = await this.prisma.ticketMessage.create({
                    data: {
                        ticketId: ticketId,
                        senderId: sender.id,
                        message: this.piiMaskingService.maskSensitiveData(mail.text || mail.html || '(No content)'),
                        channel: CommunicationChannel.EMAIL,
                    },
                });
                ticketMessageId = message.id;

                // Handle attachments
                if (mail.attachments && mail.attachments.length > 0) {
                    for (const attachment of mail.attachments) {
                        try {
                            const key = await this.storage.uploadFile({
                                buffer: attachment.content,
                                originalname: attachment.filename || 'unnamed-file',
                                mimetype: attachment.contentType
                            } as any, `tickets/${ticketId}/messages/${message.id}`);

                            await this.prisma.attachment.create({
                                data: {
                                    messageId: message.id,
                                    fileName: attachment.filename || 'unnamed-file',
                                    fileSize: attachment.size,
                                    mimeType: attachment.contentType,
                                    url: key,
                                }
                            });
                        } catch {
                            failedAttachmentCount += 1;
                            this.logger.error('Inbound email attachment processing failed.');
                        }
                    }
                }
            }

            return await completeInbound(this.prisma, claim, {
                ticketId, failedAttachmentCount, ticketMessageId: ticketMessageId ?? undefined,
            });
        } catch (error: any) {
            this.logger.error('Inbound email processing failed; review required before replay.');
            const reason = error instanceof ForbiddenException &&
                ['INBOUND_SENDER_NOT_ELIGIBLE', 'INBOUND_TICKET_OWNER_MISMATCH'].includes(error.message)
                ? error.message as 'INBOUND_SENDER_NOT_ELIGIBLE' | 'INBOUND_TICKET_OWNER_MISMATCH'
                : 'PROCESSING_FAILED';
            await holdInbound(this.prisma, claim, reason, { ticketId, ticketMessageId, failedAttachmentCount });
            return false;
        }
    }
}
