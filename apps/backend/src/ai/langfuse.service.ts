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
}
