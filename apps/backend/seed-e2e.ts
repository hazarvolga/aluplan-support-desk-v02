import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
    try {
        const hashedPassword = await bcrypt.hash('pass123', 10);
        let adminRole = await prisma.role.findFirst({ where: { name: 'ADMIN' } });

        if (!adminRole) {
            console.log('ADMIN role missing, creating...');
            adminRole = await prisma.role.create({
                data: {
                    name: 'ADMIN',
                    description: 'Administrator'
                }
            });
        }

        const user = await prisma.user.upsert({
            where: { email: 'e2e-test@aluplan.com' },
            update: { password: hashedPassword, roleId: adminRole.id, status: 'ACTIVE' },
            create: {
                email: 'e2e-test@aluplan.com',
                password: hashedPassword,
                firstName: 'E2E',
                lastName: 'TestAdmin',
                status: 'ACTIVE',
                roleId: adminRole.id,
            }
        });
        console.log(`Seeded E2E user: ${user.email}`);
    } catch (e) {
        console.error(e);
    } finally {
        await prisma.$disconnect();
    }
}

main();
