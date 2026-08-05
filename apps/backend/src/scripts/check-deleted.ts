import { PrismaClient } from '@aluplan/database';
import { createCliLogger } from '../common/utils/cli-logger';

const cliLogger = createCliLogger('CheckDeleted');

async function main() {
    const prisma = new PrismaClient();
    try {
        cliLogger.log('--- DATABASE SOFT-DELETE AUDIT ---');

        const tickets = await (prisma as any).ticket.count({ where: { deletedAt: { not: null } } });
        const users = await (prisma as any).user.count({ where: { deletedAt: { not: null } } });
        const teams = await (prisma as any).team.count({ where: { deletedAt: { not: null } } });
        const depts = await (prisma as any).department.count({ where: { deletedAt: { not: null } } });

        cliLogger.log(`Deleted Tickets: ${tickets}`);
        cliLogger.log(`Deleted Users: ${users}`);
        cliLogger.log(`Deleted Teams: ${teams}`);
        cliLogger.log(`Deleted Departments: ${depts}`);

        const totalTickets = await (prisma as any).ticket.count();
        cliLogger.log(`Total Tickets (including deleted): ${totalTickets}`);

    } catch (e) {
        cliLogger.error(e);
    } finally {
        await prisma.$disconnect();
    }
}

main();
