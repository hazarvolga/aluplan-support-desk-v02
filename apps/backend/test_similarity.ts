import { NestFactory } from '@nestjs/core';
import { AppModule } from './src/app.module';
import { EmbeddingService } from './src/ai/embedding.service';

async function bootstrap() {
    const app = await NestFactory.createApplicationContext(AppModule);
    const embeddingService = app.get(EmbeddingService);
    const query = "Merhabalar yeni bir pafta çerçevesi oluşturmak istiyorum. Hazır şablonlar kenar genişlikleri istediğim gibi ayarlayamıyorum. Yenisini nasıl oluşturabilirim. yada mevcut paftaların kenar kalınlıklarını nasıl değiştirebilirim.";

    console.log("=== Testing Vector Similarity directly ===");
    const ai = app.get('AiService');
    const prisma = app.get('PrismaService');
    const embResult = await ai.embed(query);
    const vectorStr = JSON.stringify(embResult.embedding);

    const rows = await prisma.$queryRawUnsafe(`
      SELECT 
          kpe.content, 
          1 - (kpe.embedding <=> '${vectorStr}'::vector) AS similarity
      FROM knowledge_pool_embeddings kpe
      WHERE kpe.metadata->>'type' = 'parent'
      ORDER BY similarity DESC
      LIMIT 3
  `);

    console.log("Top matches in knowledge pool:");
    rows.forEach((r, i) => {
        console.log(`[${i}] Score: ${r.similarity}`);
        console.log(`    Content: ${r.content.substring(0, 100)}...\n`);
    });

    await app.close();
}

bootstrap();
