import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import * as crypto from 'crypto';
import { Prisma } from '@aluplan/database';
import { PrismaService } from '../prisma/prisma.service';
import { CrawlResult, CrawlService } from './crawl.service';
import { DiscoverGenericWebDto } from './dto/generic-crawl.dto';

type CandidateFormat = 'KNOWLEDGE_ARTICLE' | 'PDF';

type DiscoveredWebCandidate = {
    sourceUrl: string;
    title: string;
    format: CandidateFormat;
    language: string;
    categorySlug: string;
    crawlFilter: string;
    contentHash?: string;
    metadata: Prisma.InputJsonObject;
};

const GENERIC_WEB_SOURCE = 'generic_web';
const DEFAULT_MAX_DEPTH = 2;
const DEFAULT_MAX_CANDIDATES = 50;
const DISALLOWED_PATH_PATTERN = /\/(?:login|logout|admin|wp-admin|account|auth|session|signin|sign-in|signup|sign-up)(?:\/|$)/i;
const SKIPPED_EXTENSIONS = /\.(?:jpg|jpeg|png|gif|webp|svg|ico|css|js|map|woff2?|ttf|eot|zip|rar|7z|mp4|mov|avi|mp3|wav)(?:$|\?)/i;

@Injectable()
export class GenericWebCrawlerService {
    private readonly logger = new Logger(GenericWebCrawlerService.name);

    constructor(
        private readonly prisma: PrismaService,
        private readonly crawlService: CrawlService,
    ) { }

    async discover(dto: DiscoverGenericWebDto) {
        const startUrl = this.normalizeUrl(dto.startUrl);
        if (!startUrl) throw new BadRequestException('Invalid start URL');

        const start = new URL(startUrl);
        if (this.isLearnNowCourseUrl(start)) {
            throw new BadRequestException('LEARNNOW_COURSE_URLS_REQUIRE_ENROLLMENT');
        }
        const maxDepth = dto.maxDepth ?? DEFAULT_MAX_DEPTH;
        const maxCandidates = dto.maxCandidates ?? DEFAULT_MAX_CANDIDATES;
        const sameDomainOnly = dto.sameDomainOnly !== false;
        const dryRun = dto.dryRun !== false;
        const sourceName = dto.name?.trim() || start.hostname;

        const queue: Array<{ url: string; depth: number; parentUrl?: string }> = [{ url: startUrl, depth: 0 }];
        const visited = new Set<string>();
        const discovered: DiscoveredWebCandidate[] = [];

        while (queue.length > 0 && discovered.length < maxCandidates) {
            const current = queue.shift();
            if (!current) break;

            const normalized = this.normalizeUrl(current.url);
            if (!normalized || visited.has(normalized) || !this.isAllowedUrl(normalized, start, sameDomainOnly)) {
                continue;
            }
            visited.add(normalized);

            if (this.isPdfUrl(normalized)) {
                discovered.push(this.buildPdfCandidate(normalized, sourceName, startUrl, current.parentUrl));
                continue;
            }

            let result: CrawlResult;
            try {
                result = await this.crawlService.fetch(normalized);
            } catch (error: any) {
                this.logger.warn(`⚠️ Generic web crawl failed (${error.message}): ${normalized}`);
                continue;
            }

            discovered.push(this.buildPageCandidate(normalized, sourceName, startUrl, current.parentUrl, result));

            if (current.depth >= maxDepth) continue;
            const nextLinks = result.links?.length
                ? result.links
                : this.crawlService.extractLinksFromText(result.content, normalized);

            for (const link of nextLinks) {
                const nextUrl = this.normalizeUrl(link);
                if (!nextUrl || visited.has(nextUrl) || !this.isAllowedUrl(nextUrl, start, sameDomainOnly)) continue;
                queue.push({ url: nextUrl, depth: current.depth + 1, parentUrl: normalized });
            }
        }

        const unique = this.dedupeByUrl(discovered).slice(0, maxCandidates);
        if (dryRun) {
            return {
                dryRun: true,
                discovered: unique.length,
                candidates: unique,
            };
        }

        let inserted = 0;
        let skipped = 0;
        for (const candidate of unique) {
            const result = await this.upsertCandidate(candidate);
            if (result.inserted) inserted += 1;
            else skipped += 1;
        }

        return {
            dryRun: false,
            discovered: unique.length,
            inserted,
            skipped,
        };
    }

    private buildPageCandidate(
        sourceUrl: string,
        sourceName: string,
        startUrl: string,
        parentUrl: string | undefined,
        result: CrawlResult,
    ): DiscoveredWebCandidate {
        const title = this.cleanTitle(result.title) || this.titleFromUrl(sourceUrl);
        return {
            sourceUrl,
            title,
            format: 'KNOWLEDGE_ARTICLE',
            language: this.inferLanguage(sourceUrl),
            categorySlug: this.inferCategorySlug(`${title} ${sourceUrl}`),
            crawlFilter: 'generic_web',
            contentHash: result.hash,
            metadata: {
                source: GENERIC_WEB_SOURCE,
                sourceName,
                sourceType: 'knowledge_article',
                sourceUrl,
                discoveredFrom: startUrl,
                parentUrl: parentUrl ?? null,
                crawlerProvider: result.provider ?? 'basic',
                crawler: (result.metadata ?? {}) as Prisma.InputJsonObject,
                crawlFilter: 'generic_web',
            },
        };
    }

    private buildPdfCandidate(
        sourceUrl: string,
        sourceName: string,
        startUrl: string,
        parentUrl?: string,
    ): DiscoveredWebCandidate {
        const title = this.titleFromUrl(sourceUrl);
        return {
            sourceUrl,
            title,
            format: 'PDF',
            language: this.inferLanguage(sourceUrl),
            categorySlug: this.inferCategorySlug(`${title} ${sourceUrl}`),
            crawlFilter: 'generic_web_pdf',
            contentHash: crypto.createHash('sha256').update(sourceUrl).digest('hex'),
            metadata: {
                source: GENERIC_WEB_SOURCE,
                sourceName,
                sourceType: 'pdf',
                sourceUrl,
                discoveredFrom: startUrl,
                parentUrl: parentUrl ?? null,
                crawlFilter: 'generic_web_pdf',
            },
        };
    }

    private async upsertCandidate(candidate: DiscoveredWebCandidate): Promise<{ inserted: boolean }> {
        const existing = await this.prisma.$queryRawUnsafe<Array<{ id: string }>>(
            `SELECT id FROM crawl_candidates WHERE source_url = $1 LIMIT 1`,
            candidate.sourceUrl,
        );
        if (existing.length > 0) return { inserted: false };

        await this.prisma.$executeRawUnsafe(
            `INSERT INTO crawl_candidates (source, source_url, title, format, language, category_slug, content_hash, crawl_filter, metadata)
             VALUES ($1, $2, $3, $4::"CrawlCandidateFormat", $5, $6, $7, $8, $9::jsonb)`,
            GENERIC_WEB_SOURCE,
            candidate.sourceUrl,
            candidate.title,
            candidate.format,
            candidate.language,
            candidate.categorySlug,
            candidate.contentHash ?? null,
            candidate.crawlFilter,
            JSON.stringify(candidate.metadata),
        );
        return { inserted: true };
    }

    private isAllowedUrl(url: string, start: URL, sameDomainOnly: boolean): boolean {
        let parsed: URL;
        try {
            parsed = new URL(url);
        } catch {
            return false;
        }
        if (!['http:', 'https:'].includes(parsed.protocol)) return false;
        if (sameDomainOnly && parsed.hostname !== start.hostname) return false;
        if (this.isLearnNowCourseUrl(parsed)) return false;
        if (DISALLOWED_PATH_PATTERN.test(parsed.pathname)) return false;
        if (SKIPPED_EXTENSIONS.test(parsed.pathname) && !this.isPdfUrl(url)) return false;
        return true;
    }

    private isLearnNowCourseUrl(url: URL): boolean {
        return url.hostname === 'learnnow.allplan.com' && /^\/course(?:\/|$)/i.test(url.pathname);
    }

    private normalizeUrl(value: string): string | null {
        try {
            const url = new URL(value);
            if (!['http:', 'https:'].includes(url.protocol)) return null;
            url.hash = '';
            for (const key of Array.from(url.searchParams.keys())) {
                if (/^(utm_|fbclid$|gclid$|mc_)/i.test(key)) {
                    url.searchParams.delete(key);
                }
            }
            return url.toString();
        } catch {
            return null;
        }
    }

    private isPdfUrl(url: string): boolean {
        return /\.pdf(?:$|\?)/i.test(new URL(url).pathname);
    }

    private dedupeByUrl(candidates: DiscoveredWebCandidate[]): DiscoveredWebCandidate[] {
        const seen = new Set<string>();
        return candidates.filter(candidate => {
            if (seen.has(candidate.sourceUrl)) return false;
            seen.add(candidate.sourceUrl);
            return true;
        });
    }

    private cleanTitle(value: string): string {
        return value.replace(/\s+/g, ' ').trim();
    }

    private titleFromUrl(url: string): string {
        const parsed = new URL(url);
        const last = decodeURIComponent(parsed.pathname.split('/').filter(Boolean).pop() ?? parsed.hostname);
        return this.cleanTitle(last.replace(/\.(pdf|html?)$/i, '').replace(/[-_]+/g, ' ')) || parsed.hostname;
    }

    private inferLanguage(url: string): string {
        const pathSegment = new URL(url).pathname.split('/').filter(Boolean)[0];
        return /^[a-z]{2}$/i.test(pathSegment ?? '') ? pathSegment.toLowerCase() : 'en';
    }

    private inferCategorySlug(text: string): string {
        const normalized = text.toLowerCase();
        if (/(codemeter|license server|lizenzserver|licen[cs]e|access rights|zugriffsrechte)/.test(normalized)) {
            return 'license-server-codemeter';
        }
        if (/(workgroup|checkout|home-office|home office|offline|wgm)/.test(normalized)) {
            return 'network-workgroup';
        }
        if (/(install|setup|kurulum|installation)/.test(normalized)) {
            return 'installation-setup';
        }
        if (/(ifc|dwg|export|import)/.test(normalized)) {
            return 'export-import-ifc-dwg';
        }
        return 'uncategorized';
    }
}
