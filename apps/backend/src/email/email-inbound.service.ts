import { Injectable, Logger, OnModuleInit, Inject, forwardRef, ForbiddenException } from '@nestjs/common';
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

@Injectable()
export class EmailInboundService implements OnModuleInit {
    private readonly logger = new Logger(EmailInboundService.name);
    private isProcessing = false;

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

    @Cron(CronExpression.EVERY_MINUTE)
    async handleInboundEmails() {
        if (this.isProcessing) return;

        this.isProcessing = true;
        try {
            const config = await this.getImapConfig();
            if (!config) {
                this.logger.warn('IMAP not configured, skipping inbound email check');
                return;
            }
            const connection: any = await imaps.connect({ imap: config });
            await connection.openBox('INBOX');

            const searchCriteria = ['UNSEEN'];
            const fetchOptions = { bodies: ['HEADER', 'TEXT', ''], markSeen: true };

            const messages = await connection.search(searchCriteria, fetchOptions);

            for (const item of messages) {
                const all = item.parts.find((part: any) => part.which === '');
                const id = item.attributes.uid;
                const messageId = item.parts.find((p: any) => p.which === 'HEADER')?.body['message-id']?.[0];

                if (!all) continue;

                const mail = await simpleParser(all.body);
                await this.processMail(mail, messageId || `imap-${id}`);
            }

            connection.end();
        } catch (error: any) {
            this.logger.error(`IMAP Error: ${error.message}`);
        } finally {
            this.isProcessing = false;
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

    private async processMail(mail: any, messageId: string) {
        const from = mail.from?.value[0]?.address;
        const subject = mail.subject || '';
        const body = mail.text || mail.html || '';

        if (!from) return;

        // Check if duplicate
        const existing = await this.prisma.inboundEmailLog.findUnique({
            where: { messageId },
        });

        if (existing && existing.processed) return;

        const log = await this.prisma.inboundEmailLog.upsert({
            where: { messageId },
            update: {},
            create: {
                messageId,
                from,
                subject,
                processed: false,
            },
        });

        if (isDeliveryStatusNotification({ from, subject, body, headers: mail.headers })) {
            await this.prisma.inboundEmailLog.update({
                where: { id: log.id },
                data: {
                    processed: true,
                    processedAt: new Date(),
                    error: 'Ignored delivery status notification',
                },
            });
            this.logger.warn(`Ignored delivery status notification ${messageId} from ${from}`);
            return;
        }

        try {
            const sender = await this.prisma.user.findUnique({
                where: { email: from }, include: { role: true },
            });
            if (!sender?.id || sender.status !== 'ACTIVE' || sender.deletedAt || !sender.role?.name?.trim()) {
                throw new ForbiddenException('INBOUND_SENDER_NOT_ELIGIBLE');
            }

            // Logic: Ticket Threading
            const ticketMatch = subject.match(/\[(SUP-\d+)\]/);
            let ticketId = null;
            let ticketMessageId: string | null = null;
            let failedAttachmentCount = 0;

            if (ticketMatch) {
                const ticketNumber = ticketMatch[1];
                const ticket = await this.prisma.ticket.findUnique({ where: { ticketNumber } });
                if (ticket) {
                    if (ticket.userId !== sender.id) {
                        throw new ForbiddenException('INBOUND_TICKET_OWNER_MISMATCH');
                    }

                    const message = await this.ticketsService.addMessage(ticket.id, {
                        message: body,
                        isInternal: false,
                        channel: CommunicationChannel.EMAIL,
                    }, sender.id, 'CUSTOMER');
                    ticketId = ticket.id;
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

            await this.prisma.inboundEmailLog.update({
                where: { id: log.id },
                data: {
                    processed: true,
                    ticketId,
                    processedAt: new Date(),
                    // Keep the duplicate fence: the message exists even when some files failed.
                    error: failedAttachmentCount > 0
                        ? `INBOUND_ATTACHMENT_FAILURE count=${failedAttachmentCount} ticketMessageId=${ticketMessageId}`
                        : null,
                },
            });
        } catch (error: any) {
            this.logger.error(`Failed to process email ${messageId}: ${error.message}`);
            await this.prisma.inboundEmailLog.update({
                where: { id: log.id },
                data: { error: error.message },
            });
        }
    }
}
