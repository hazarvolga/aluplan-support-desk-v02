import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AiService } from '../ai/ai.service';
import { CrawledImage } from './crawl.service';

export interface VisualSummary {
    url: string;
    alt?: string;
    title?: string;
    caption?: string;
    mimeType?: string;
    summary: string;
}

interface EnrichInput {
    sourceUrl: string;
    title: string;
    content: string;
    images?: CrawledImage[];
    language?: string | null;
    existingMetadata?: Record<string, unknown>;
}

interface EnrichResult {
    content: string;
    summaries: VisualSummary[];
    metadata: Record<string, unknown>;
}

@Injectable()
export class VisualContentService {
    private readonly logger = new Logger(VisualContentService.name);

    constructor(
        private readonly config: ConfigService,
        private readonly aiService: AiService,
    ) {}

    async enrichUrlContent(input: EnrichInput): Promise<EnrichResult> {
        const existingSummaries = this.getExistingSummaries(input.existingMetadata);
        const selectedImages = this.selectImages(input.images ?? [], input.sourceUrl);

        if (!this.isEnabled() || selectedImages.length === 0) {
            return {
                content: input.content,
                summaries: existingSummaries,
                metadata: this.buildMetadata(existingSummaries, selectedImages.length, false),
            };
        }

        const summaries: VisualSummary[] = [];

        for (const image of selectedImages) {
            const cached = existingSummaries.find(summary => summary.url === image.url);
            if (cached) {
                summaries.push(cached);
                continue;
            }

            const summary = await this.summarizeImage(image, input);
            if (summary) summaries.push(summary);
        }

        const content = this.appendVisualSummaries(input.content, summaries);

        return {
            content,
            summaries,
            metadata: this.buildMetadata(summaries, selectedImages.length, true),
        };
    }

    private isEnabled(): boolean {
        const raw = this.config.get<string | boolean>('KNOWLEDGE_URL_VISION_ENABLED');
        if (typeof raw === 'boolean') return raw;
        if (raw === undefined || raw === null || raw === '') return true;
        return String(raw).toLowerCase() === 'true';
    }

    private selectImages(images: CrawledImage[], sourceUrl: string): CrawledImage[] {
        const maxImages = this.getPositiveInt('KNOWLEDGE_URL_VISION_MAX_IMAGES', 4);
        const sameHostOnly = this.getBoolean('KNOWLEDGE_URL_VISION_SAME_HOST_ONLY', true);
        const seen = new Set<string>();
        const sourceHost = this.safeHost(sourceUrl);

        return images
            .filter(image => {
                if (!image.url || seen.has(image.url)) return false;
                seen.add(image.url);

                const url = this.safeUrl(image.url);
                if (!url) return false;
                if (sameHostOnly && sourceHost && url.hostname !== sourceHost) return false;
                if (!/^https?:$/.test(url.protocol)) return false;
                if (this.looksDecorative(url, image)) return false;
                if (image.width && image.height && image.width < 160 && image.height < 160) return false;

                return true;
            })
            .slice(0, maxImages);
    }

    private async summarizeImage(image: CrawledImage, input: EnrichInput): Promise<VisualSummary | null> {
        try {
            const fetched = await this.fetchImage(image.url);
            if (!fetched) return null;

            const prompt = this.buildVisionPrompt(image, input);
            const response = await this.aiService.generate([
                { text: prompt },
                { inlineData: { mimeType: fetched.mimeType, data: fetched.base64 } },
            ], this.getPositiveInt('KNOWLEDGE_URL_VISION_TIMEOUT_MS', 45_000));

            const summary = this.cleanSummary(response);
            if (!summary) return null;

            return {
                url: image.url,
                alt: image.alt,
                title: image.title,
                caption: image.caption,
                mimeType: fetched.mimeType,
                summary,
            };
        } catch (error: any) {
            this.logger.warn(`⚠️ Visual summary skipped for ${image.url}: ${error.message}`);
            return null;
        }
    }

    private async fetchImage(url: string): Promise<{ mimeType: string; base64: string } | null> {
        const response = await fetch(url, {
            headers: { 'User-Agent': 'Mozilla/5.0 AluplanSupportBot/1.0' },
            signal: AbortSignal.timeout(this.getPositiveInt('KNOWLEDGE_URL_VISION_FETCH_TIMEOUT_MS', 12_000)),
        });

        if (!response.ok) return null;

        const mimeType = response.headers.get('content-type')?.split(';')[0]?.trim() || '';
        if (!mimeType.startsWith('image/') || mimeType === 'image/svg+xml') return null;

        const arrayBuffer = await response.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        const maxBytes = this.getPositiveInt('KNOWLEDGE_URL_VISION_MAX_IMAGE_BYTES', 2 * 1024 * 1024);
        if (buffer.length > maxBytes) {
            this.logger.warn(`⚠️ Visual summary skipped for ${url}: image too large (${buffer.length} bytes)`);
            return null;
        }

        return { mimeType, base64: buffer.toString('base64') };
    }

    private buildVisionPrompt(image: CrawledImage, input: EnrichInput): string {
        const language = input.language || 'tr';
        return [
            'You are extracting searchable technical evidence from an official Allplan support article image.',
            'Summarize only what is visible in the image. Do not invent UI labels or steps.',
            'Focus on menus, dialogs, buttons, warnings, selected options, highlighted fields, and workflow-relevant visual details.',
            'If the image is decorative, a logo, an icon, or not technically useful, reply exactly: NO_USEFUL_VISUAL_CONTENT.',
            `Write the useful summary in language code: ${language}.`,
            `Article title: ${input.title}`,
            `Image alt text: ${image.alt || '-'}`,
            `Image caption: ${image.caption || '-'}`,
            'Return 2-5 concise bullets. No markdown heading.',
        ].join('\n');
    }

    private cleanSummary(response: string | null): string | null {
        const summary = response?.trim();
        if (!summary || /^NO_USEFUL_VISUAL_CONTENT$/i.test(summary)) return null;
        return summary.slice(0, 1400);
    }

    private appendVisualSummaries(content: string, summaries: VisualSummary[]): string {
        if (summaries.length === 0) return content;

        const visualBlock = summaries
            .map((summary, index) => [
                `Visual ${index + 1}:`,
                summary.alt ? `Alt: ${summary.alt}` : null,
                summary.caption ? `Caption: ${summary.caption}` : null,
                `Summary: ${summary.summary}`,
            ].filter(Boolean).join('\n'))
            .join('\n\n');

        return `${content.trim()}\n\n---\nVISUAL EVIDENCE EXTRACTED FROM SOURCE IMAGES\n${visualBlock}`;
    }

    private buildMetadata(summaries: VisualSummary[], selectedImageCount: number, enabled: boolean): Record<string, unknown> {
        return {
            visualEnrichment: {
                enabled,
                selectedImageCount,
                summarizedImageCount: summaries.length,
                generatedAt: new Date().toISOString(),
            },
            visualSummaries: summaries,
        };
    }

    private getExistingSummaries(metadata?: Record<string, unknown>): VisualSummary[] {
        const summaries = metadata?.visualSummaries;
        if (!Array.isArray(summaries)) return [];

        return summaries
            .filter((summary): summary is VisualSummary => {
                return !!summary
                    && typeof summary === 'object'
                    && typeof (summary as any).url === 'string'
                    && typeof (summary as any).summary === 'string';
            });
    }

    private looksDecorative(url: URL, image: CrawledImage): boolean {
        const haystack = [
            url.pathname,
            image.alt,
            image.title,
            image.caption,
        ].filter(Boolean).join(' ').toLowerCase();

        return /logo|icon|favicon|sprite|avatar|tracking|pixel|blank|loader|spinner|social|share/.test(haystack);
    }

    private safeUrl(value: string): URL | null {
        try {
            return new URL(value);
        } catch {
            return null;
        }
    }

    private safeHost(value: string): string | null {
        return this.safeUrl(value)?.hostname ?? null;
    }

    private getPositiveInt(key: string, fallback: number): number {
        const value = Number(this.config.get(key));
        return Number.isFinite(value) && value > 0 ? Math.floor(value) : fallback;
    }

    private getBoolean(key: string, fallback: boolean): boolean {
        const raw = this.config.get<string | boolean>(key);
        if (typeof raw === 'boolean') return raw;
        if (raw === undefined || raw === null || raw === '') return fallback;
        return String(raw).toLowerCase() === 'true';
    }
}
