import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';
import { Queue } from 'bullmq';
import { Redis } from 'ioredis';

const prisma = new PrismaClient();
const REDIS_URL = process.env.REDIS_URL || 'redis://localhost:6379';

async function main() {
    const KNOWLEDGE_PATH = process.env.KNOWLEDGE_BASE_PATH || path.join(__dirname, '../../../../Bilgi Bankası');

    console.log('🚀 Starting Intelligent Knowledge Ingestion...');

    // 1. Fetch Products and Categories
    const products = await prisma.product.findMany({
        where: { isActive: true },
        include: { categories: { where: { isActive: true } } }
    });

    console.log(`📦 Loaded ${products.length} products with their categories.`);

    // 2. Setup Redis Queue
    const redis = new Redis(REDIS_URL, { maxRetriesPerRequest: null });
    const syncQueue = new Queue('knowledge-sync', { connection: redis as any });

    // 3. Recursive Ingester
    let processedCount = 0;
    let skippedCount = 0;

    async function walk(dir: string) {
        const files = fs.readdirSync(dir);

        for (const file of files) {
            const fullPath = path.join(dir, file);
            const stat = fs.statSync(fullPath);

            if (stat.isDirectory()) {
                await walk(fullPath);
            } else {
                const ext = path.extname(file).toLowerCase();
                const supportedExts = ['.md', '.txt', '.pdf', '.csv'];

                if (!supportedExts.includes(ext)) {
                    skippedCount++;
                    continue;
                }

                // Read content for keyword matching (limit size for speed)
                let content = '';
                try {
                    if (['.md', '.txt', '.csv'].includes(ext)) {
                        content = fs.readFileSync(fullPath, { encoding: 'utf-8' }).slice(0, 10000);
                    }
                } catch (e) {
                    console.error(`❌ Error reading ${fullPath}:`, e.message);
                }

                // 4. Intelligent Classification
                const classification = classify(file, content, products);

                // 5. Create Database Record
                try {
                    // @ts-ignore
                    const source = await prisma.knowledgeSource.create({
                        data: {
                            name: file,
                            type: determineTypeFromExt(ext) as any,
                            fileName: file,
                            filePath: fullPath,
                            status: 'ACTIVE',
                            productId: classification.productId,
                            metadata: {
                                matchedCategory: classification.categoryName,
                                score: classification.score,
                                path: fullPath
                            }
                        }
                    });

                    // 6. Trigger BullMQ Sync
                    await syncQueue.add('sync-source', { sourceId: source.id }, {
                        attempts: 3,
                        backoff: { type: 'exponential', delay: 5000 },
                        removeOnComplete: true,
                    });

                    processedCount++;
                    if (processedCount % 50 === 0) {
                        console.log(`✅ Processed ${processedCount} files...`);
                    }
                } catch (e) {
                    console.error(`❌ Failed to ingest ${file}:`, e.message);
                }
            }
        }
    }

    await walk(KNOWLEDGE_PATH);

    console.log('\n--- Ingestion Completed ---');
    console.log(`Total Processed: ${processedCount}`);
    console.log(`Total Skipped: ${skippedCount}`);

    await prisma.$disconnect();
    await redis.quit();
}

function classify(fileName: string, content: string, products: any[]) {
    let bestMatch = {
        productId: null as string | null,
        categoryName: null as string | null,
        score: 0
    };

    const textToMatch = `${fileName} ${content}`.toLowerCase();

    for (const product of products) {
        // Check product name match
        if (textToMatch.includes(product.name.toLowerCase())) {
            const score = 10;
            if (score > bestMatch.score) {
                bestMatch = { productId: product.id, categoryName: null, score };
            }
        }

        for (const category of product.categories) {
            let categoryScore = 0;
            for (const keyword of category.keywords) {
                if (textToMatch.includes(keyword.toLowerCase())) {
                    categoryScore += 5;
                }
            }

            if (categoryScore > bestMatch.score) {
                bestMatch = { productId: product.id, categoryName: category.name, score: categoryScore };
            }
        }
    }

    return bestMatch;
}

function determineTypeFromExt(ext: string): string {
    switch (ext) {
        case '.pdf': return 'FILE_PDF';
        case '.md': return 'FILE_MD';
        case '.txt': return 'FILE_TXT';
        case '.csv': return 'FILE_CSV';
        default: return 'FILE_TXT';
    }
}

main().catch(e => {
    console.error('💥 Fatal error during ingestion:', e);
    process.exit(1);
});
