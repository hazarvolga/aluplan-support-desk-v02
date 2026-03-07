import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkFlags() {
    try {
        console.log("Checking knowledge base items for 'pafta çerçevesi'...");

        // 1. Check Articles
        const articles = await prisma.$queryRaw`
            SELECT id, title, is_internal, status 
            FROM knowledge_articles 
            WHERE title ILIKE '%pafta%' OR description ILIKE '%pafta%';
        `;
        console.log("Articles:", articles);

        // 2. Check general pool search
        const pools = await prisma.$queryRaw`
            SELECT s.name, s.type, s.status, s.trust_score
            FROM knowledge_pool_embeddings e
            JOIN knowledge_sources s ON s.id = e.source_id
            WHERE e.content ILIKE '%pafta çerçevesi%'
            LIMIT 5;
        `;
        console.log("Knowledge Pool items with 'pafta çerçevesi':", pools);

    } catch (e) {
        console.error("Error:", e);
    } finally {
        await prisma.$disconnect();
    }
}
checkFlags();
