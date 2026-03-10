
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
async function main() {
    console.log('--- Raw Prisma Check ---');
    try {
        const user = await prisma.user.findUnique({ where: { email: 'hazarvolga@gmail.com' } });
        console.log('User found:', !!user);
        if (user) {
            console.log('Email:', user.email);
            console.log('Status:', user.status);
            console.log('DeletedAt:', user.deletedAt);
        }
        const allUsers = await prisma.user.findMany({ select: { email: true } });
        console.log('All Users in DB:', allUsers.map(u => u.email));
    } catch (e: any) {
        console.error('Prisma Error:', e.message);
    }
}
main().finally(() => prisma.$disconnect());
