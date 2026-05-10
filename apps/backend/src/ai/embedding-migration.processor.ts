import { Process, Processor } from '@nestjs/bullmq';
import { Injectable, Logger } from '@nestjs/common';
import { Job } from 'bullmq';
import { PrismaService } from '../prisma/prisma.service';
import { EmbeddingService } from './embedding.service';
import { OnEvent } from '@nestjs/event-emitter';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { EmbeddingVersionRegistry } from './embedding-version.registry';

export interface MigrationJobData {
  targetVersion: string;
  targetDimension: number;
  provider: string;
  model: string;
  batchSize: number;
  dryRun?: boolean;
  flushCache?: boolean;
}

@Processor('embedding-migration')
@Injectable()
export class EmbeddingMigrationProcessor {
  private readonly logger = new Logger(EmbeddingMigrationProcessor.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly embeddingService: EmbeddingService,
    private readonly registry: EmbeddingVersionRegistry,
    @InjectQueue('embedding-migration') private readonly migrationQueue: Queue
  ) {}

  @OnEvent('ai.embedding.provider_changed')
  async handleProviderChange(payload: { key: string; newValue: string; oldValue: string }) {
    this.logger.log(`Detected embedding provider/model change (${payload.key}: ${payload.oldValue} -> ${payload.newValue}). Scheduling migration.`);
    
    // Get the newly active version configuration
    const config = await this.registry.getActiveVersionConfig();
    
    // Flush the AI Response Cache immediately to prevent dimension mismatch errors on incoming queries
    await this.prisma.$executeRawUnsafe('TRUNCATE TABLE ai_response_cache;');
    this.logger.log(`AI Response Cache flushed due to embedding model change.`);

    // Enqueue the migration job
    await this.migrationQueue.add('migrate-vectors', {
      targetVersion: config.version,
      targetDimension: config.dimension,
      provider: config.provider,
      model: config.model,
      batchSize: 50, // Process 50 at a time to respect rate limits
      dryRun: false,
      flushCache: false // Already flushed
    } as MigrationJobData, {
      jobId: `migrate-${config.version}-${Date.now()}`,
      removeOnComplete: true
    });
  }

  @Process('migrate-vectors')
  async processMigration(job: Job<MigrationJobData>) {
    const { targetVersion, targetDimension, provider, model, batchSize, dryRun } = job.data;
    this.logger.log(`Starting embedding migration to version: ${targetVersion} (Dim: ${targetDimension}) [DryRun: ${dryRun}]`);

    let totalMigrated = 0;
    
    // 1. Process FAQ Entries
    totalMigrated += await this.processFaqEntries(targetVersion, targetDimension, batchSize, dryRun);
    
    // 2. Process KnowledgePoolEmbeddings
    totalMigrated += await this.processKnowledgePool(targetVersion, targetDimension, batchSize, dryRun);

    // 3. Process TicketEmbeddings (Optional / Based on policy, but doing it for completeness)
    totalMigrated += await this.processTicketEmbeddings(targetVersion, targetDimension, batchSize, dryRun);

    // 4. Process KnowledgeEmbeddings
    totalMigrated += await this.processKnowledgeEmbeddings(targetVersion, targetDimension, batchSize, dryRun);

    this.logger.log(`Migration completed for version ${targetVersion}. Total updated: ${totalMigrated}`);
    return { totalMigrated, targetVersion };
  }

  private async processFaqEntries(targetVersion: string, targetDimension: number, batchSize: number, dryRun: boolean): Promise<number> {
    let processed = 0;
    while (true) {
      const records = await this.prisma.faqEntry.findMany({
        where: { embeddingVersion: { not: targetVersion } },
        take: batchSize,
        select: { id: true, question: true }
      });

      if (records.length === 0) break;

      for (const record of records) {
        if (!dryRun) {
          try {
            const vector = await this.embeddingService.generateEmbedding(record.question);
            const vectorStr = `[${vector.join(',')}]`;
            
            await this.prisma.$executeRawUnsafe(
              `UPDATE faq_entries SET question_embedding = $1::vector, embedding_version = $2, embedding_dim = $3, migrated_at = NOW() WHERE id = $4`,
              vectorStr, targetVersion, targetDimension, record.id
            );
          } catch (e) {
            this.logger.error(`Failed to migrate FAQ ${record.id}`, e);
          }
          // Delay to respect rate limits (Gemini Free Tier constraint)
          await new Promise(resolve => setTimeout(resolve, 500)); 
        }
        processed++;
      }
    }
    this.logger.log(`Migrated ${processed} FAQ Entries`);
    return processed;
  }

  private async processKnowledgePool(targetVersion: string, targetDimension: number, batchSize: number, dryRun: boolean): Promise<number> {
    let processed = 0;
    while (true) {
      const records = await this.prisma.knowledgePoolEmbedding.findMany({
        where: { embeddingVersion: { not: targetVersion } },
        take: batchSize,
        select: { id: true, content: true }
      });

      if (records.length === 0) break;

      for (const record of records) {
        if (!dryRun) {
          try {
            const vector = await this.embeddingService.generateEmbedding(record.content);
            const vectorStr = `[${vector.join(',')}]`;
            
            await this.prisma.$executeRawUnsafe(
              `UPDATE knowledge_pool_embeddings SET embedding = $1::vector, embedding_version = $2, embedding_dim = $3, migrated_at = NOW() WHERE id = $4`,
              vectorStr, targetVersion, targetDimension, record.id
            );
          } catch (e) {
            this.logger.error(`Failed to migrate KnowledgePool ${record.id}`, e);
          }
          await new Promise(resolve => setTimeout(resolve, 500));
        }
        processed++;
      }
    }
    this.logger.log(`Migrated ${processed} Knowledge Pool Embeddings`);
    return processed;
  }

  private async processTicketEmbeddings(targetVersion: string, targetDimension: number, batchSize: number, dryRun: boolean): Promise<number> {
    let processed = 0;
    while (true) {
      // For tickets, we need the content. Since TicketEmbedding doesn't store content, 
      // we need to fetch the ticket description/subject.
      const records = await this.prisma.ticketEmbedding.findMany({
        where: { embeddingVersion: { not: targetVersion } },
        take: batchSize,
        include: { ticket: { select: { subject: true, description: true } } }
      });

      if (records.length === 0) break;

      for (const record of records) {
        if (!dryRun) {
          try {
            const content = `${record.ticket.subject}\n${record.ticket.description || ''}`;
            const vector = await this.embeddingService.generateEmbedding(content);
            const vectorStr = `[${vector.join(',')}]`;
            
            await this.prisma.$executeRawUnsafe(
              `UPDATE ticket_embeddings SET embedding = $1::vector, embedding_version = $2, embedding_dim = $3, migrated_at = NOW() WHERE id = $4`,
              vectorStr, targetVersion, targetDimension, record.id
            );
          } catch (e) {
            this.logger.error(`Failed to migrate TicketEmbedding ${record.id}`, e);
          }
          await new Promise(resolve => setTimeout(resolve, 500));
        }
        processed++;
      }
    }
    this.logger.log(`Migrated ${processed} Ticket Embeddings`);
    return processed;
  }

  private async processKnowledgeEmbeddings(targetVersion: string, targetDimension: number, batchSize: number, dryRun: boolean): Promise<number> {
    let processed = 0;
    while (true) {
      const records = await this.prisma.knowledgeEmbedding.findMany({
        where: { embeddingVersion: { not: targetVersion } },
        take: batchSize,
        select: { id: true, content: true }
      });

      if (records.length === 0) break;

      for (const record of records) {
        if (!dryRun) {
          try {
            const vector = await this.embeddingService.generateEmbedding(record.content);
            const vectorStr = `[${vector.join(',')}]`;
            
            await this.prisma.$executeRawUnsafe(
              `UPDATE knowledge_embeddings SET embedding = $1::vector, embedding_version = $2, embedding_dim = $3, migrated_at = NOW() WHERE id = $4`,
              vectorStr, targetVersion, targetDimension, record.id
            );
          } catch (e) {
            this.logger.error(`Failed to migrate KnowledgeEmbedding ${record.id}`, e);
          }
          await new Promise(resolve => setTimeout(resolve, 500));
        }
        processed++;
      }
    }
    this.logger.log(`Migrated ${processed} Knowledge Embeddings`);
    return processed;
  }
}
