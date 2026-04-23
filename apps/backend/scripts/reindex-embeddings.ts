import { NestFactory } from '@nestjs/core';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';
import { EmbeddingService } from '../src/ai/embedding.service';
import { KnowledgePoolParserService } from '../src/knowledge-pool/knowledge-pool-parser.service';
import { KnowledgePoolService } from '../src/knowledge-pool/knowledge-pool.service';

async function bootstrap() {
    console.log('🚀 [REINDEX] Starting RAG Embeddings Re-indexing Script...');
    const app = await NestFactory.createApplicationContext(AppModule);
    const prisma = app.get(PrismaService);
    const embeddingService = app.get(EmbeddingService);
    const parserService = app.get(KnowledgePoolParserService);

    const dims = process.env.EMBEDDING_DIMENSIONS || '1536';
    console.log(`📏 [REINDEX] Target dimensions: ${dims}`);

    try {
        console.log('🧹 [REINDEX] Step 1: Clearing all old embedding tables...');

        await prisma.$executeRawUnsafe('TRUNCATE TABLE knowledge_embeddings CASCADE;');
        await prisma.$executeRawUnsafe('TRUNCATE TABLE knowledge_pool_embeddings CASCADE;');
        await prisma.$executeRawUnsafe('TRUNCATE TABLE ticket_embeddings CASCADE;');

        console.log('✅ [REINDEX] Tables cleared.');

        console.log('🔄 [REINDEX] Step 2: Re-indexing Official Knowledge Articles...');
        const resultArticles = await embeddingService.reindexAll();
        console.log(`✅ [REINDEX] Articles indexed: ${resultArticles.indexed} succeeded, ${resultArticles.failed} failed.`);

        console.log('🔄 [REINDEX] Step 3: Re-indexing Knowledge Pool (PDF/MD/Files) [DIRECT SYNC]...');
        const allPoolSources = await prisma.knowledgeSource.findMany();
        const activePoolSources = allPoolSources.filter((s: any) => s.status !== 'ARCHIVED');

        const smartChunker = await import('../src/knowledge-base/utils/smart-chunker');
        const hierarchicalChunk = smartChunker.hierarchicalChunk;

        let poolCount = 0;
        let chunkTotal = 0;
        let poolFailCount = 0;

        for (const source of activePoolSources) {
            console.log(`[REINDEX] Processing Source ${poolCount + poolFailCount + 1}/${activePoolSources.length}: ${source.name}`);
            try {
                if (!source.filePath) {
                    console.warn(`⚠️ [REINDEX] Skipping ${source.name}: No file path`);
                    continue;
                }

                // 1. Parse
                const content = await parserService.parseFile(source.type, source.filePath);

                // 2. Chunk
                const title = source.name || source.fileName || 'Untitled';
                const hierarchies = hierarchicalChunk(content, { title });

                // 3. Index
                for (const h of hierarchies) {
                    await embeddingService.indexPoolContent(source.id, h.parent, {
                        fileName: source.fileName,
                        type: 'parent',
                        status: 'ACTIVE'
                    });

                    for (const child of h.children) {
                        await embeddingService.indexPoolContent(source.id, child, {
                            fileName: source.fileName,
                            type: 'child',
                            status: 'ACTIVE'
                        });
                        chunkTotal++;
                    }
                }

                console.log(`✅ [REINDEX] Synced ${source.name}: ${hierarchies.length} chunks indexed.`);
                poolCount++;
            } catch (err: any) {
                console.error(`❌ [REINDEX] Failed to sync source ${source.name}:`, err.message);
                poolFailCount++;
            }
            await new Promise(r => setTimeout(r, 100));
        }
        console.log(`✅ [REINDEX] Knowledge Pool Sync: ${poolCount} sources, ${chunkTotal} children indexed.`);

        console.log('🔄 [REINDEX] Step 4: Re-indexing resolved tickets (Self-learning)...');
        const allResolvedTickets = await prisma.ticket.findMany({
            include: { messages: true }
        });
        const resolvedFiltered = allResolvedTickets.filter((t: any) => t.status === 'RESOLVED');

        let ticketCount = 0;
        let ticketFailCount = 0;
        for (const ticket of resolvedFiltered) {
            console.log(`[REINDEX] Processing Ticket ${ticketCount + ticketFailCount + 1}/${resolvedFiltered.length}: ${ticket.subject}`);
            try {
                const messages = (ticket as any).messages;
                if (messages && messages.length > 0) {
                    const content = messages.map((m: any) => m.message).join('\n');
                    await embeddingService.indexTicket(ticket.id, content.substring(0, 1500));
                    ticketCount++;
                }
            } catch (err: any) {
                console.error(`❌ [REINDEX] Failed to reindex ticket ${ticket.id}:`, err.message);
                ticketFailCount++;
            }
            await new Promise(r => setTimeout(r, 100));
        }

        console.log(`✅ [REINDEX] Tickets Indexed: ${ticketCount} succeeded, ${ticketFailCount} failed.`);
        console.log('🎉 [REINDEX] Migration Complete!');
    } catch (err: any) {
        console.error('❌ [REINDEX] FATAL ERROR:', err);
    } finally {
        await app.close();
        process.exit(0);
    }
}

bootstrap();
