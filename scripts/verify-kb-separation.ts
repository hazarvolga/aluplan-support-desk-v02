import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function verifyKBSeparation() {
    console.log('🚀 Starting KB Pool Separation Verification...');

    // 1. Check for 'customer' and 'staff' users
    const customer = await prisma.user.findFirst({
        where: { roles: { some: { role: { name: 'customer' } } } },
        include: { userRoles: { include: { role: true } } }
    });

    const staff = await prisma.user.findFirst({
        where: { NOT: { roles: { some: { role: { name: 'customer' } } } } },
        include: { userRoles: { include: { role: true } } }
    });

    console.log(`User Check: Customer Found? ${!!customer} | Staff Found? ${!!staff}`);

    // 2. Check Article counts
    const internalCount = await prisma.knowledgeArticle.count({ where: { isInternal: true } });
    const externalCount = await prisma.knowledgeArticle.count({ where: { isInternal: false } });
    console.log(`Article Check: Internal: ${internalCount} | External: ${externalCount}`);

    // 3. Verify Source filtering (Pool)
    const poolSources = await prisma.knowledgeSource.count();
    console.log(`Pool Check: Total Internal Sources: ${poolSources}`);

    console.log('\n✅ Verification Script Ready. Run backend tests to confirm RAG behavior.');
}

verifyKBSeparation()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
