import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { Langfuse } from 'langfuse';
import { SettingsService } from '../settings/settings.service';

@Injectable()
export class LangfuseService implements OnModuleInit {
    private readonly logger = new Logger(LangfuseService.name);
    private langfuse: Langfuse | null = null;

    constructor(private readonly settings: SettingsService) { }

    async onModuleInit() {
        await this.initialize();
    }

    private async initialize() {
        const publicKey = await this.settings.getValue('ai.langfuse.public_key');
        const secretKey = await this.settings.getValue('ai.langfuse.secret_key');
        const host = (await this.settings.getValue('ai.langfuse.host')) || 'https://cloud.langfuse.com';

        if (publicKey && secretKey) {
            this.langfuse = new Langfuse({
                publicKey,
                secretKey,
                baseUrl: host,
            });
            this.logger.log('🚀 Langfuse Observability initialized');
        } else {
            this.logger.warn('⚠️ Langfuse credentials missing. Observability disabled.');
        }
    }

    getLangfuse(): Langfuse | null {
        return this.langfuse;
    }

    async trace(name: string, input: any, output?: any, metadata?: any) {
        if (!this.langfuse) return null;

        try {
            const trace = this.langfuse.trace({
                name,
                input,
                output,
                metadata,
            });
            await this.langfuse.flushAsync();
            return trace;
        } catch (error) {
            this.logger.error('Langfuse trace error', error.stack);
            return null;
        }
    }

    /**
     * Record a retrieval span for a RAG search step.
     * Non-blocking: callers should fire-and-forget with .catch(() => {}).
     */
    async traceRetrieval(options: {
        traceId?: string;
        query: string;
        hypotheticalDoc?: string;
        expandedTerms?: string[];
        chunksRetrieved: number;
        topScore: number;
        cacheHit: boolean;
        chunkIds: string[];
    }): Promise<void> {
        if (!this.langfuse) return;
        try {
            const trace = options.traceId
                ? this.langfuse.trace({ id: options.traceId })
                : this.langfuse.trace({ name: 'rag-retrieval' });

            const span = trace.span({
                name: 'retrieval',
                input: {
                    query: options.query,
                    expandedTerms: options.expandedTerms,
                    hypotheticalDoc: options.hypotheticalDoc?.slice(0, 200),
                },
                metadata: {
                    chunksRetrieved: options.chunksRetrieved,
                    topScore: options.topScore,
                    cacheHit: options.cacheHit,
                    hybridSearchUsed: true,
                },
            });
            span.end({ output: { chunkIds: options.chunkIds.slice(0, 10) } });
            await this.langfuse.flushAsync();
        } catch (error) {
            this.logger.error('Langfuse traceRetrieval error', (error as Error).stack);
        }
    }

    async addEvent(
        traceId: string,
        eventName: string,
        payload: Record<string, unknown>
    ): Promise<void> {
        if (!this.langfuse) return;
        try {
            const trace = this.langfuse.trace({ id: traceId });
            trace.event({
                name: eventName,
                input: payload,
            });
            await this.langfuse.flushAsync();
        } catch (error) {
            this.logger.error(`Langfuse addEvent error [${eventName}]`, (error as Error).stack);
        }
    }
}
