const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient({
    datasources: {
        db: {
            url: "postgresql://postgres:changeme@localhost:5432/aluplan_support?schema=public"
        }
    }
});

async function checkData() {
    try {
        console.log("Checking Knowledge Embeddings...");
        const count = await prisma.$queryRaw`SELECT COUNT(*) FROM knowledge_embeddings;`;
        console.log("Knowledge Embeddings Count:", count);

        const poolCount = await prisma.$queryRaw`SELECT COUNT(*) FROM knowledge_pool_embeddings;`;
        console.log("Knowledge Pool Embeddings Count:", poolCount);

        const items = await prisma.$queryRaw`SELECT id, content FROM knowledge_pool_embeddings WHERE content ILIKE '%pafta çerçevesi%' LIMIT 5;`;
        console.log("Pool items with 'pafta çerçevesi':", items.length);
        if (items.length > 0) {
            console.log("Sample content:", items[0].content.substring(0, 100));
        }

    } catch (e) {
        console.error("Error:", e);
    } finally {
        await prisma.$disconnect();
    }
}
checkData();
