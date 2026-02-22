import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('Clearing knowledge base data...');

    // Delete embeddings first to avoid foreign key constraints
    await prisma.$executeRaw`TRUNCATE TABLE knowledge_pool_embeddings CASCADE`;
    await prisma.$executeRaw`TRUNCATE TABLE knowledge_embeddings CASCADE`;

    // Delete dependencies
    await prisma.knowledgeSourceSyncLog.deleteMany({});
    await prisma.knowledgeArticleVersion.deleteMany({});

    // Delete main entities
    await prisma.knowledgeArticle.deleteMany({});
    await prisma.knowledgeSource.deleteMany({});

    console.log('All knowledge base data cleared successfully.');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
