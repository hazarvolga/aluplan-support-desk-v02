import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class PromptsService {
    private readonly logger = new Logger(PromptsService.name);
    // Simple in-memory cache to reduce DB load
    private cache = new Map<string, string>();
    private cacheTTL = new Map<string, number>();

    constructor(private readonly prisma: PrismaService) { }

    async getPrompt(name: string, defaultContent: string): Promise<string> {
        const CACHE_TIME = 60000; // 1 minute
        if (this.cache.has(name) && this.cacheTTL.get(name)! > Date.now()) {
            return this.cache.get(name)!;
        }

        try {
            const template = await this.prisma.promptTemplate.findFirst({
                where: { name, isActive: true },
                orderBy: { version: 'desc' }
            });

            if (template) {
                this.cache.set(name, template.content);
                this.cacheTTL.set(name, Date.now() + CACHE_TIME);
                return template.content;
            }
        } catch (e) {
            this.logger.warn(`Failed to fetch prompt template ${name}: ${e.message}`);
        }

        // Auto-seed the database with the default prompt if it doesn't exist
        try {
            const exists = await this.prisma.promptTemplate.findFirst({ where: { name } });
            if (!exists) {
                await this.prisma.promptTemplate.create({
                    data: {
                        name,
                        content: defaultContent,
                        description: `Auto-generated default for ${name}`
                    }
                });
            } else if (name === 'SYSTEM_PROMPT_SUPPORT' && !exists.content.includes('[MÜŞTERİ SİSTEM BİLGİLERİ (HOTINFO)]')) {
                // FORCE UPDATE: Auto-heal the DB prompt template if it lacks the Hotinfo integration
                await this.prisma.promptTemplate.update({
                    where: { id: exists.id },
                    data: { content: defaultContent }
                });
            }
        } catch (_e) {
            // Ignore unique constraint or missing table errors temporarily
        }

        this.cache.set(name, defaultContent);
        this.cacheTTL.set(name, Date.now() + CACHE_TIME);
        return defaultContent;
    }

    async invalidateCache(name?: string) {
        if (name) {
            this.cache.delete(name);
            this.cacheTTL.delete(name);
        } else {
            this.cache.clear();
            this.cacheTTL.clear();
        }
    }
}
