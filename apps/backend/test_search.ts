import { NestFactory } from '@nestjs/core';
import { AppModule } from './src/app.module';
import { EmbeddingService } from './src/ai/embedding.service';
import { AiQueryService } from './src/ai/ai-query.service';

async function bootstrap() {
    const app = await NestFactory.createApplicationContext(AppModule);
    const embeddingService = app.get(EmbeddingService);
    const aiQueryService = app.get(AiQueryService);

    const query = "Merhabalar yeni bir pafta çerçevesi oluşturmak istiyorum. Hazır şablonlar kenar genişlikleri istediğim gibi ayarlayamıyorum.  Yenisini nasıl oluşturabilirim. yada mevcut paftaların kenar kalınlıklarını nasıl değiştirebilirim.";

    console.log("=== Testing Raw Embedding Search (limit 5, no threshold filter inside node) ===");
    // Force SIMILARITY_THRESHOLD to 0 in environment? Unfortunately it's read by the class constructor... 
    // Let's just call the search method.

    const res = await embeddingService.search(query, 5, null, false);
    console.log("Search Results:", res.diagnostics);
    res.results.forEach((r, i) => {
        console.log(`[${i}] Score: ${r.similarity} | Type: ${r.sourceType} | Title: ${r.title}`);
    });

    console.log("\n=== Testing AI Query Flow ===");
    const result = await aiQueryService.query(query, null);
    console.log("AI Answer:", result.answer);
    console.log("Confidence:", result.confidence);

    await app.close();
}

bootstrap();
