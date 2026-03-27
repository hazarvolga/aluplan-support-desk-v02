import { PrismaClient } from '@aluplan/database';

async function main() {
    const prisma = new PrismaClient();
    try {
        console.log('--- DATABASE SOFT-DELETE AUDIT ---');

        const tickets = await (prisma as any).ticket.count({ where: { deletedAt: { not: null } } });
        const users = await (prisma as any).user.count({ where: { deletedAt: { not: null } } });
        const teams = await (prisma as any).team.count({ where: { deletedAt: { not: null } } });
        const depts = await (prisma as any).department.count({ where: { deletedAt: { not: null } } });

        console.log(`Deleted Tickets: ${tickets}`);
        console.log(`Deleted Users: ${users}`);
        console.log(`Deleted Teams: ${teams}`);
        console.log(`Deleted Departments: ${depts}`);

        const totalTickets = await (prisma as any).ticket.count();
        console.log(`Total Tickets (including deleted): ${totalTickets}`);

    } catch (e) {
        console.error(e);
    } finally {
        await prisma.$disconnect();
    }
}

main();
