import { PrismaClient } from '@aluplan/database';
import { createCliLogger } from './common/utils/cli-logger';
const cliLogger = createCliLogger('CheckKnowledge');

const prisma = new PrismaClient();

async function main() {
    cliLogger.log('--- KNOWLEDGE SOURCE CHECK ---');
    const sources = await prisma.knowledgeSource.findMany({
        where: {
            OR: [
                { name: { contains: 'PythonPart', mode: 'insensitive' } },
                { name: { contains: 'Visual Scripting', mode: 'insensitive' } },
                { fileName: { contains: 'pythonpart', mode: 'insensitive' } }
            ]
        },
        include: { _count: { select: { embeddings: true } } }
    });

    cliLogger.log(`Found ${sources.length} sources related to Python/Visual Scripting.`);
    sources.forEach(s => {
        cliLogger.log(`- [${s.status}] ${s.name} (${s.fileName}): ${s._count.embeddings} chunks`);
    });

    cliLogger.log('\n--- EMBEDDING CONTENT SEARCH ---');
    const embeddings = await prisma.knowledgePoolEmbedding.findMany({
        where: {
            OR: [
                { content: { contains: 'PythonPart', mode: 'insensitive' } },
                { content: { contains: 'Visual Scripting', mode: 'insensitive' } }
            ]
        },
        take: 5,
        select: { content: true }
    });

    cliLogger.log(`Found ${embeddings.length} content chunks containing keywords (top 5 shown).`);
    embeddings.forEach((e, i) => {
        cliLogger.log(`--- Chunk ${i + 1} ---\n${e.content.substring(0, 150)}...\n`);
    });
}

main().catch((error) => cliLogger.error(error)).finally(() => prisma.$disconnect());
