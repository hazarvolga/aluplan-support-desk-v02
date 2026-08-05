import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { RagMaintenanceService } from '../ai/rag-maintenance.service';

function hasArg(name: string): boolean {
    return process.argv.includes(name);
}

async function main() {
    const app = await NestFactory.createApplicationContext(AppModule, {
        bufferLogs: true,
    });

    try {
        const maintenance = app.get(RagMaintenanceService);
        await maintenance.runInfrastructureMaintenance({
            optimizeIndexes: !hasArg('--skip-indexes'),
            syncKnowledgePool: hasArg('--sync'),
        });
    } finally {
        await app.close();
    }
}

main().catch((error) => {
    console.error('RAG maintenance command failed:', error);
    process.exit(1);
});
