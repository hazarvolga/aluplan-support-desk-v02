"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
async function check() {
    const settings = await prisma.setting.findMany({
        where: {
            key: {
                startsWith: 'ai.'
            }
        }
    });
    console.log(JSON.stringify(settings, null, 2));
}
check().catch(console.error).finally(() => prisma.$disconnect());
