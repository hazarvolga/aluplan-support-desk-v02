import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { TicketsService } from '../tickets/tickets.service';
import { ConfigService } from '@nestjs/config';
import { OnEvent } from '@nestjs/event-emitter';

@Injectable()
export class WhatsAppService {
    private readonly logger = new Logger(WhatsAppService.name);

    constructor(
        private readonly prisma: PrismaService,
        private readonly ticketsService: TicketsService,
        private readonly configService: ConfigService,
    ) { }

    async handleIncoming(payload: any) {
        // Simple Meta API payload extraction
        const entry = payload.entry?.[0];
        const changes = entry?.changes?.[0];
        const value = changes?.value;
        const message = value?.messages?.[0];
        const _contact = value?.contacts?.[0];

        if (!message) return { status: 'no_message' };

        const fromPhone = message.from; // WhatsApp ID / Phone
        const text = message.text?.body;
        const cleanPhone = fromPhone.replace(/\D/g, '');

        // 1. Match customer by phone number (using contains or exact match after normalization)
        this.logger.debug(`🔍 Attempting to match profile for cleanPhone: ${cleanPhone}`);
        const profile = await this.prisma.customerProfile.findFirst({
            where: {
                phoneNumber: {
                    contains: cleanPhone
                }
            },
            include: { user: true }
        });

        if (!profile) {
            this.logger.warn(`❌ No customer profile found matching ${cleanPhone}`);
        } else {
            this.logger.debug(`✅ Matched profile for user: ${profile.user?.email} (${profile.userId})`);
        }

        // 3. Find active ticket for this user
        const ticket = await this.prisma.ticket.findFirst({
            where: {
                userId: profile?.userId,
                status: { notIn: ['RESOLVED', 'CLOSED'] },
                channel: 'WHATSAPP'
            },
            orderBy: { createdAt: 'desc' }
        });

        if (ticket) {
            // Append message to existing ticket
            await this.prisma.ticketMessage.create({
                data: {
                    ticketId: ticket.id,
                    senderId: profile?.userId,
                    message: text,
                    channel: 'WHATSAPP'
                }
            });
            this.logger.log(`🎫 Appended WhatsApp message to ticket ${ticket.ticketNumber}`);
        } else if (profile) {
            // Create new ticket
            const newTicket = await this.ticketsService.create({
                subject: `WhatsApp Talebi: ${text.substring(0, 50)}...`,
                description: text,
                priority: 'MEDIUM',
            }, profile.userId);

            // Update channel to WHATSAPP
            await this.prisma.ticket.update({
                where: { id: newTicket.id },
                data: { channel: 'WHATSAPP' }
            });

            this.logger.log(`🆕 Created new WhatsApp ticket ${newTicket.ticketNumber} for ${fromPhone}`);
        }

        return { status: 'success' };
    }

    async sendOutgoing(to: string, message: string) {
        const accessToken = this.configService.get<string>('WHATSAPP_ACCESS_TOKEN');
        const phoneId = this.configService.get<string>('WHATSAPP_PHONE_NUMBER_ID');

        if (!accessToken || !phoneId) {
            this.logger.warn('⚠️ WhatsApp credentials missing, cloud message not sent');
            return;
        }

        try {
            const response = await fetch(`https://graph.facebook.com/v17.0/${phoneId}/messages`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${accessToken}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    messaging_product: 'whatsapp',
                    to,
                    type: 'text',
                    text: { body: message }
                })
            });

            if (!response.ok) {
                const err = await response.json();
                throw new Error(`WhatsApp API Error: ${err.error?.message || JSON.stringify(err)}`);
            }

            this.logger.log(`📤 WhatsApp Message sent to ${to}`);
        } catch (error: any) {
            this.logger.error(`❌ Failed to send WhatsApp message: ${error.message}`);
        }
    }

    @OnEvent('ticket.message_added')
    async handleOutbound(payload: { ticket: any; message: any }) {
        const { ticket, message } = payload;

        // Condition: WhatsApp ticket + Agent reply + Not internal
        if (ticket.channel === 'WHATSAPP' && message.senderId !== ticket.userId && !message.isInternal) {
            this.logger.debug(`📡 Intercepted agent reply for WhatsApp ticket ${ticket.ticketNumber}`);

            const profile = await this.prisma.customerProfile.findUnique({
                where: { userId: ticket.userId }
            });

            if (profile?.phoneNumber) {
                await this.sendOutgoing(profile.phoneNumber, message.message);
            } else {
                this.logger.warn(`⚠️ Cannot send WhatsApp reply: Customer phone not found for user ${ticket.userId}`);
            }
        }
    }
}
