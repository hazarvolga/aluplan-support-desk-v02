import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { TicketsService } from '../tickets/tickets.service';

@Injectable()
export class OmniChannelService {
    private readonly logger = new Logger(OmniChannelService.name);

    constructor(
        private prisma: PrismaService,
        private ticketsService: TicketsService,
    ) { }

    async handleInboundEmailWebhook(payload: any) {
        // Extract basic mail info (assuming a generic/Mailgun/Resend style payload)
        const from = payload.from || payload.sender;
        const subject = payload.subject || 'No Subject';
        const body = payload.text || payload.body || payload['stripped-text'] || 'Empty Message';
        const messageId = payload.messageId || payload['Message-Id'] || `webhook-${Date.now()}`;

        if (!from) {
            this.logger.warn('Inbound webhook missing "from" field.');
            return;
        }

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
            // Thread detection
            const ticketMatch = subject.match(/\[#SUP-(\d+)\]/);
            let ticketId = null;

            if (ticketMatch) {
                const ticketNumber = `SUP-${ticketMatch[1]}`;
                const ticket = await this.prisma.ticket.findUnique({ where: { ticketNumber } });
                if (ticket) {
                    const sender = await this.prisma.user.findUnique({
                        where: { email: from },
                        include: { userRoles: { include: { role: true } } }
                    });
                    const senderId = sender?.id || ticket.userId;
                    const role = (sender as any)?.userRoles?.[0]?.role?.name || 'customer';

                    await this.ticketsService.addMessage(ticket.id, {
                        message: body,
                        isInternal: false,
                    }, senderId!, role);
                    ticketId = ticket.id;
                }
            }

            if (!ticketId) {
                // Find or create customer
                let user = await this.prisma.user.findUnique({ where: { email: from } });

                if (!user) {
                    user = await this.prisma.user.create({
                        data: {
                            email: from,
                            fullName: from.split('@')[0],
                            passwordHash: 'webhook-inbound-only',
                            userRoles: {
                                create: {
                                    role: { connect: { name: 'customer' } }
                                }
                            }
                        }
                    });
                    this.logger.log(`Created skeleton user for webhook email: ${from}`);
                }

                const newTicket = await this.ticketsService.create({
                    subject,
                    description: body,
                    priority: 'MEDIUM' as any,
                }, user.id);
                ticketId = newTicket.id;
            }

            // Mark as processed
            await this.prisma.inboundEmailLog.update({
                where: { id: log.id },
                data: {
                    processed: true,
                    ticketId,
                    processedAt: new Date(),
                },
            });
            this.logger.log(`Processed inbound email ${messageId} -> Ticket ${ticketId}`);
        } catch (error: any) {
            this.logger.error(`Failed to process email ${messageId}: ${error.message}`);
            await this.prisma.inboundEmailLog.update({
                where: { id: log.id },
                data: { error: error.message },
            });
        }
    }
}
