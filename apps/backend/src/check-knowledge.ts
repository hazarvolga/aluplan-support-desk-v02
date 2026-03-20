import { PrismaClient } from '@aluplan/database';
const prisma = new PrismaClient();

async function main() {
    console.log('--- KNOWLEDGE SOURCE CHECK ---');
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

    console.log(`Found ${sources.length} sources related to Python/Visual Scripting.`);
    sources.forEach(s => {
        console.log(`- [${s.status}] ${s.name} (${s.fileName}): ${s._count.embeddings} chunks`);
    });

    console.log('\n--- EMBEDDING CONTENT SEARCH ---');
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

    console.log(`Found ${embeddings.length} content chunks containing keywords (top 5 shown).`);
    embeddings.forEach((e, i) => {
        console.log(`--- Chunk ${i + 1} ---\n${e.content.substring(0, 150)}...\n`);
    });
}

main().catch(console.error).finally(() => prisma.$disconnect());
