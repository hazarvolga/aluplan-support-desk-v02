import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '../prisma/prisma.service';
import { SettingsService } from '../settings/settings.service';
import { TicketsService } from '../tickets/tickets.service';
import { SIMPLE_MAP_CONFIG } from './interfaces/imap.interface';
import * as imaps from 'imap-simple';
import { simpleParser } from 'mailparser';

@Injectable()
export class EmailInboundService implements OnModuleInit {
    private readonly logger = new Logger(EmailInboundService.name);
    private isProcessing = false;

    constructor(
        private prisma: PrismaService,
        private settings: SettingsService,
        private ticketsService: TicketsService,
    ) { }

    onModuleInit() {
        this.logger.log('EmailInboundService initialized');
    }

    @Cron(CronExpression.EVERY_MINUTE)
    async handleInboundEmails() {
        if (this.isProcessing) return;

        try {
            const imapConfigSetting = await this.settings.get('email.imap.config', true).catch(() => null);
            if (!imapConfigSetting) return;

            const config = JSON.parse(imapConfigSetting.value);
            if (!config.host || !config.user || !config.password) return;

            this.isProcessing = true;
            this.logger.debug('Checking for inbound emails...');

            const connection = await imaps.connect({ imap: config });
            await connection.openBox('INBOX');

            const searchCriteria = ['UNSEEN'];
            const fetchOptions = { bodies: ['HEADER', 'TEXT', ''], markSeen: true };

            const messages = await connection.search(searchCriteria, fetchOptions);

            for (const item of messages) {
                const all = item.parts.find((part) => part.which === '');
                const id = item.attributes.uid;
                const messageId = item.parts.find(p => p.which === 'HEADER')?.body['message-id']?.[0];

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

        try {
            // Logic: Ticket Threading
            const ticketMatch = subject.match(/\[#SUP-(\d+)\]/);
            let ticketId = null;

            if (ticketMatch) {
                const ticketNumber = `SUP-${ticketMatch[1]}`;
                const ticket = await this.prisma.ticket.findUnique({ where: { ticketNumber } });
                if (ticket) {
                    // Identify sender
                    const sender = await this.prisma.user.findUnique({
                        where: { email: from },
                        include: { role: true }
                    });
                    const senderId = sender?.id || ticket.userId;
                    const role = sender?.role?.name || 'customer';

                    await this.ticketsService.addMessage(ticket.id, {
                        message: body,
                        isInternal: false,
                    }, senderId!, role);
                    ticketId = ticket.id;
                }
            }

            if (!ticketId) {
                // Create New Ticket
                // 1. Find or create user
                let user = await this.prisma.user.findUnique({ where: { email: from } });

                if (!user) {
                    // Create skeleton profile for new inbound email sender
                    user = await this.prisma.user.create({
                        data: {
                            email: from,
                            fullName: from.split('@')[0], // Use email prefix as temporary name
                            passwordHash: 'inbound-only', // System account
                            status: 'ACTIVE'
                        }
                    });
                    this.logger.log(`Created skeleton user for inbound email: ${from}`);
                }

                const newTicket = await this.ticketsService.create({
                    subject,
                    description: body,
                    priority: 'MEDIUM' as any,
                }, user.id);
                ticketId = newTicket.id;
            }

            await this.prisma.inboundEmailLog.update({
                where: { id: log.id },
                data: {
                    processed: true,
                    ticketId,
                    processedAt: new Date(),
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
