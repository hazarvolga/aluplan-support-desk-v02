import { Factory } from 'fishery';
import { faker } from '@faker-js/faker';
import { PrismaService } from '../../src/prisma/prisma.service';
import { TicketStatus, TicketPriority, CommunicationChannel } from '@prisma/client';

export const ticketFactory = Factory.define<{
    subject: string;
    description?: string;
    status: TicketStatus;
    priority: TicketPriority;
    channel: CommunicationChannel;
    userId?: string;
}>(({ onCreate }) => {
    onCreate(async (ticket) => {
        const prisma = new PrismaService();
        return prisma.ticket.create({
            data: {
                ticketNumber: `TKT-${faker.string.alphanumeric(8).toUpperCase()}`,
                ...ticket,
            },
        });
    });

    return {
        subject: faker.lorem.sentence(),
        description: faker.lorem.paragraph(),
        status: TicketStatus.OPEN,
        priority: TicketPriority.MEDIUM,
        channel: CommunicationChannel.WEB,
    };
});
