import { Injectable, Logger, BadRequestException, NotFoundException } from '@nestjs/common';
import axios from 'axios';
import * as cheerio from 'cheerio';
import * as crypto from 'crypto';
import sanitize from 'sanitize-filename';
import { KnowledgeSourceStatus, KnowledgeSourceType, Prisma } from '@aluplan/database';
import { PrismaService } from '../prisma/prisma.service';
import { StorageService } from '../common/services/storage.service';
import { KnowledgePoolService } from './knowledge-pool.service';
import { DiscoverLearnNowDto, LearnNowCrawlFormat } from './dto/learnnow-crawl.dto';
import { CrawlService } from './crawl.service';

type CandidateStatus =
    | 'PENDING_REVIEW'
    | 'APPROVED'
    | 'IMPORTED'
    | 'SKIPPED_DUPLICATE'
    | 'REJECTED'
    | 'FAILED';

type CandidateFormat = 'KNOWLEDGE_ARTICLE' | 'PDF';
type LearnNowFilterValue =
    | 'knowledge_article'
    | 'pdf'
    | 'explainer_video'
    | 'recording';

type CrawlCandidateRecord = {
    id: string;
    source: string;
    source_url: string;
    title: string;
    format: CandidateFormat;
    status: CandidateStatus;
    language: string | null;
    category_slug: string | null;
    content_hash: string | null;
    crawl_filter: string | null;
    rejection_reason: string | null;
    metadata: Record<string, unknown> | null;
};

type DiscoveredCandidate = {
    sourceUrl: string;
    title: string;
    format: CandidateFormat;
    language: string;
    categorySlug: string;
    crawlFilter: string;
    contentHash?: string;
    metadata: Prisma.InputJsonObject;
};

type CandidateReviewDecision = {
    readyForImport: boolean;
    reasonCode:
    | 'ARTICLE_CONTENT_READY'
    | 'MEDIA_TRANSCRIPT_READY'
    | 'TRANSCRIPT_REQUIRED'
    | 'CONTENT_TOO_SHORT'
    | 'PDF_VALIDATED_ON_IMPORT'
    | 'NEEDS_CONTENT_REVIEW';
};

type DuplicateKnowledgeSource = {
    id: string;
    reason: 'Knowledge source URL already exists' | 'Knowledge source content hash already exists';
};

type LearnNowSession = {
    cookies: Map<string, string>;
};

const LEARNNOW_BASE_URL = 'https://learnnow.allplan.com';
const LEARNNOW_SOURCE = 'allplan_learnnow';
const LEARNNOW_FORMAT_FILTERS: Record<LearnNowCrawlFormat, LearnNowFilterValue> = {
    knowledge_article: 'knowledge_article',
    pdf: 'pdf',
    technical_manual: 'pdf',
    explaining_video: 'explainer_video',
    recorded_online_session: 'recording',
};

@Injectable()
export class LearnNowCrawlerService {
    private readonly logger = new Logger(LearnNowCrawlerService.name);

    constructor(
        private readonly prisma: PrismaService,
        private readonly storageService: StorageService,
        private readonly knowledgePoolService: KnowledgePoolService,
        private readonly crawlService: CrawlService,
    ) { }

    async discover(dto: DiscoverLearnNowDto) {
        const formats: LearnNowCrawlFormat[] = dto.formats?.length ? dto.formats : ['knowledge_article', 'pdf'];
        const maxPages = dto.maxPages ?? 1;
        const maxCandidates = dto.maxCandidates ?? 50;
        const dryRun = dto.dryRun !== false;
        const search = dto.search?.trim() ?? '';
        const session = await this.createLearnNowSession();

        const discovered: DiscoveredCandidate[] = [];
        for (const format of formats) {
            for (let page = 0; page < maxPages && discovered.length < maxCandidates; page += 1) {
                const url = this.buildSearchUrl(format, search, page);
                const html = await this.fetchSearchHtml(url, session);
                const htmlCandidates = this.extractCandidates(html, format, url);
                discovered.push(...htmlCandidates);

                if (htmlCandidates.length === 0) {
                    discovered.push(...await this.discoverWithCrawler(url, format));
                }
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
            const enrichedCandidate = await this.enrichCandidateForReview(candidate);
            const result = await this.upsertCandidate(enrichedCandidate);
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

    async listCandidates(status?: CandidateStatus, source?: string) {
        const rows = await this.prisma.$queryRawUnsafe<CrawlCandidateRecord[]>(
            `SELECT id, source, source_url, title, format, status, language, category_slug, content_hash, crawl_filter, rejection_reason, metadata
             FROM crawl_candidates
             WHERE ($1::text IS NULL OR source = $1)
               AND ($2::text IS NULL OR status::text = $2::text)
             ORDER BY crawled_at DESC
             LIMIT 200`,
            source ?? null,
            status ?? null,
        );
        return rows.map(this.mapCandidateRow);
    }

    async importCandidate(id: string) {
        const candidate = await this.findCandidate(id);
        if (!candidate) throw new NotFoundException('Crawler candidate not found');

        if (candidate.status === 'IMPORTED') {
            return { skipped: true, reason: 'ALREADY_IMPORTED', candidateId: id };
        }

        if (candidate.format === 'PDF') {
            return this.importPdfCandidate(candidate);
        }

        return this.importArticleCandidate(candidate);
    }

    async deleteCandidate(id: string): Promise<{ success: boolean; count: number }> {
        const [candidateId] = this.normalizeCandidateIds([id]);
        const deleted = await this.prisma.$executeRawUnsafe<number>(
            `DELETE FROM crawl_candidates WHERE id = $1::uuid`,
            candidateId,
        );

        if (Number(deleted) === 0) {
            throw new NotFoundException('Crawler candidate not found');
        }

        return { success: true, count: Number(deleted) };
    }

    async bulkDeleteCandidates(ids: string[]): Promise<{ success: boolean; count: number }> {
        const candidateIds = this.normalizeCandidateIds(ids);
        if (candidateIds.length === 0) {
            return { success: true, count: 0 };
        }

        const placeholders = candidateIds.map((_, index) => `$${index + 1}::uuid`).join(', ');
        const deleted = await this.prisma.$executeRawUnsafe<number>(
            `DELETE FROM crawl_candidates WHERE id IN (${placeholders})`,
            ...candidateIds,
        );

        return { success: true, count: Number(deleted) };
    }

    private async importArticleCandidate(candidate: CrawlCandidateRecord) {
        const existing = await this.findDuplicateKnowledgeSource(candidate.source_url, candidate.content_hash);
        if (existing) {
            await this.markCandidate(candidate.id, 'SKIPPED_DUPLICATE', existing.id, existing.reason);
            return {
                skipped: true,
                reason: existing.reason.includes('hash') ? 'DUPLICATE_HASH' : 'DUPLICATE_URL',
                sourceId: existing.id,
            };
        }

        const creation = await this.knowledgePoolService.createImportedUrlSource({
            name: candidate.title,
            type: KnowledgeSourceType.URL,
            url: candidate.source_url,
        }, {
            language: candidate.language ?? 'en',
            lastHash: candidate.content_hash,
            metadata: this.buildImportMetadata(candidate, 'knowledge_article'),
        });

        if (!creation.created) {
            await this.markCandidate(candidate.id, 'SKIPPED_DUPLICATE', creation.source.id, 'Knowledge source URL already exists');
            return { skipped: true, reason: 'DUPLICATE_URL', sourceId: creation.source.id };
        }

        const source = creation.source;
        await this.markCandidate(candidate.id, 'IMPORTED', source.id);
        return { imported: true, candidateId: candidate.id, sourceId: source.id };
    }

    private async importPdfCandidate(candidate: CrawlCandidateRecord) {
        const response = await axios.get<ArrayBuffer>(candidate.source_url, {
            responseType: 'arraybuffer',
            timeout: 30000,
            maxRedirects: 5,
            headers: { 'User-Agent': 'Mozilla/5.0 AluplanSupportBot/1.0' },
            validateStatus: status => status >= 200 && status < 400,
        });

        const buffer = Buffer.from(response.data);
        const contentType = String(response.headers['content-type'] ?? '').toLowerCase();
        const looksLikePdf = contentType.includes('pdf') || buffer.subarray(0, 4).toString() === '%PDF';
        if (!looksLikePdf) {
            await this.markCandidate(candidate.id, 'FAILED', null, 'PDF candidate did not return PDF content');
            throw new BadRequestException('PDF candidate did not return PDF content');
        }

        const hash = crypto.createHash('sha256').update(buffer).digest('hex');
        const existing = await this.prisma.knowledgeSource.findFirst({
            where: { lastHash: hash },
        });
        if (existing) {
            await this.markCandidate(candidate.id, 'SKIPPED_DUPLICATE', existing.id, 'Knowledge source content hash already exists');
            return { skipped: true, reason: 'DUPLICATE_HASH', sourceId: existing.id };
        }

        const fileName = `${sanitize(candidate.title).slice(0, 180) || 'allplan-learnnow'}.pdf`;
        const storageKey = await this.storageService.uploadFile({
            originalname: fileName,
            mimetype: 'application/pdf',
            buffer,
            size: buffer.length,
        } as Express.Multer.File, 'knowledge-pool');

        const source = await this.prisma.knowledgeSource.create({
            data: {
                name: candidate.title,
                type: KnowledgeSourceType.FILE_PDF,
                fileName,
                filePath: storageKey,
                status: KnowledgeSourceStatus.ACTIVE,
                language: candidate.language ?? 'en',
                lastHash: hash,
                metadata: this.buildImportMetadata(candidate, 'pdf'),
            },
        });

        await this.knowledgePoolService.triggerSync(source.id);
        await this.markCandidate(candidate.id, 'IMPORTED', source.id);
        return { imported: true, candidateId: candidate.id, sourceId: source.id };
    }

    private buildSearchUrl(format: LearnNowCrawlFormat, search: string, page: number): string {
        const url = new URL('/course/search.php', LEARNNOW_BASE_URL);
        url.searchParams.set('type', 'resource');
        url.searchParams.set('sort_by', 'score:desc');
        url.searchParams.set('search', search);
        url.searchParams.append('filter[format][]', LEARNNOW_FORMAT_FILTERS[format] ?? format);
        if (page > 0) url.searchParams.set('page', String(page));
        return url.toString();
    }

    private async createLearnNowSession(): Promise<LearnNowSession> {
        const cookies = new Map<string, string>();
        const response = await axios.get<string>(`${LEARNNOW_BASE_URL}/int`, {
            timeout: 15000,
            maxRedirects: 5,
            headers: { 'User-Agent': 'Mozilla/5.0 AluplanSupportBot/1.0' },
        });
        this.collectSetCookies(response.headers?.['set-cookie'], cookies);
        return { cookies };
    }

    private async fetchSearchHtml(url: string, session: LearnNowSession): Promise<string> {
        const parsed = new URL(url);
        if (parsed.hostname !== 'learnnow.allplan.com') {
            throw new BadRequestException('Only learnnow.allplan.com crawl discovery is allowed');
        }

        const response = await axios.get<string>(url, {
            timeout: 15000,
            maxRedirects: 5,
            headers: {
                'User-Agent': 'Mozilla/5.0 AluplanSupportBot/1.0',
                Cookie: this.serializeCookies(session.cookies),
            },
        });
        return response.data;
    }

    private async discoverWithCrawler(crawlUrl: string, format: LearnNowCrawlFormat): Promise<DiscoveredCandidate[]> {
        try {
            const result = await this.crawlService.fetch(crawlUrl);
            const candidates = this.extractMarkdownCandidates(result.content, format, crawlUrl);
            if (candidates.length > 0) {
                this.logger.log(`✅ Crawler discovered ${candidates.length} Learn Now ${format} candidates via ${result.provider ?? 'basic'}`);
            }
            return candidates.map(candidate => ({
                ...candidate,
                metadata: {
                    ...candidate.metadata,
                    crawlerProvider: result.provider ?? 'basic',
                    crawler: (result.metadata ?? {}) as Prisma.InputJsonObject,
                },
            }));
        } catch (error: any) {
            this.logger.warn(`⚠️ Learn Now crawler discovery fallback failed (${error.message}): ${crawlUrl}`);
            return [];
        }
    }

    private extractCandidates(html: string, format: LearnNowCrawlFormat, crawlUrl: string): DiscoveredCandidate[] {
        const $ = cheerio.load(html);
        const candidates: DiscoveredCandidate[] = [];
        const candidateFormat = this.toCandidateFormat(format);

        $('a[href]').each((_, el) => {
            const href = String($(el).attr('href') ?? '');
            const sourceUrl = this.toLearnNowUrl(href);
            if (!sourceUrl || !this.isAllowedResultUrl(sourceUrl, candidateFormat)) return;

            const title = this.cleanTitle($(el).text()) || this.titleFromUrl(sourceUrl);
            if (!title || title.length < 3) return;

            candidates.push({
                sourceUrl,
                title,
                format: candidateFormat,
                language: this.inferLanguage(sourceUrl),
                categorySlug: this.inferCategorySlug(`${title} ${sourceUrl}`),
                crawlFilter: format,
                metadata: {
                    source: LEARNNOW_SOURCE,
                    sourceType: format,
                    candidateFormat,
                    sourceUrl,
                    crawlFilter: format,
                    discoveredFrom: crawlUrl,
                },
            });
        });

        return candidates;
    }

    private extractMarkdownCandidates(markdown: string, format: LearnNowCrawlFormat, crawlUrl: string): DiscoveredCandidate[] {
        const candidateFormat = this.toCandidateFormat(format);
        const candidates: DiscoveredCandidate[] = [];
        const seen = new Set<string>();
        const linkPattern = /\[([^\]]{3,240})\]\((https?:\/\/learnnow\.allplan\.com\/[^)\s]+)\)/gi;

        for (const match of markdown.matchAll(linkPattern)) {
            const title = this.cleanTitle(match[1]);
            const sourceUrl = this.toLearnNowUrl(match[2]);
            if (!sourceUrl || seen.has(sourceUrl) || !this.isAllowedResultUrl(sourceUrl, candidateFormat)) continue;
            seen.add(sourceUrl);

            candidates.push({
                sourceUrl,
                title: title || this.titleFromUrl(sourceUrl),
                format: candidateFormat,
                language: this.inferLanguage(sourceUrl),
                categorySlug: this.inferCategorySlug(`${title} ${sourceUrl}`),
                crawlFilter: format,
                metadata: {
                    source: LEARNNOW_SOURCE,
                    sourceType: format,
                    candidateFormat,
                    sourceUrl,
                    crawlFilter: format,
                    discoveredFrom: crawlUrl,
                    discoveredVia: 'crawler_markdown',
                },
            });
        }

        return candidates;
    }

    private toLearnNowUrl(href: string): string | null {
        if (!href || href.startsWith('#') || href.startsWith('mailto:')) return null;
        try {
            const url = new URL(href, LEARNNOW_BASE_URL);
            if (url.hostname !== 'learnnow.allplan.com') return null;
            if (this.isEnrollmentCourseUrl(url)) return null;
            if (this.isTotaraHowtoResource(url)) {
                const id = url.searchParams.get('id');
                url.search = '';
                if (id) url.searchParams.set('id', id);
                url.searchParams.set('source', 'howto');
            }
            url.hash = '';
            return url.toString();
        } catch {
            return null;
        }
    }

    private isAllowedResultUrl(url: string, format: CandidateFormat): boolean {
        const parsed = new URL(url);
        if (this.isEnrollmentCourseUrl(parsed)) return false;
        if (format === 'PDF') {
            return parsed.pathname.endsWith('.pdf') || parsed.pathname.includes('/mod/resource/view.php');
        }

        return this.isTotaraHowtoResource(parsed);
    }

    private isEnrollmentCourseUrl(url: URL): boolean {
        return url.hostname === 'learnnow.allplan.com' && /^\/course(?:\/|$)/i.test(url.pathname);
    }

    private collectSetCookies(setCookieHeader: string[] | string | undefined, cookies: Map<string, string>): void {
        const entries = Array.isArray(setCookieHeader)
            ? setCookieHeader
            : setCookieHeader
                ? [setCookieHeader]
                : [];

        for (const entry of entries) {
            const [nameValue] = entry.split(';');
            const separatorIndex = nameValue.indexOf('=');
            if (separatorIndex <= 0) continue;
            cookies.set(nameValue.slice(0, separatorIndex).trim(), nameValue.slice(separatorIndex + 1).trim());
        }
    }

    private serializeCookies(cookies: Map<string, string>): string {
        return Array.from(cookies.entries())
            .map(([name, value]) => `${name}=${value}`)
            .join('; ');
    }

    private async upsertCandidate(candidate: DiscoveredCandidate): Promise<{ inserted: boolean }> {
        const duplicate = await this.findDuplicateKnowledgeSource(candidate.sourceUrl, candidate.contentHash ?? null);
        const existing = await this.prisma.$queryRawUnsafe<Array<{ id: string }>>(
            `SELECT id FROM crawl_candidates WHERE source_url = $1 LIMIT 1`,
            candidate.sourceUrl,
        );
        if (existing.length > 0) {
            await this.prisma.$executeRawUnsafe(
                `UPDATE crawl_candidates
                 SET title = $2,
                     content_hash = COALESCE($3, content_hash),
                     metadata = COALESCE(metadata, '{}'::jsonb) || $4::jsonb,
                     status = CASE
                         WHEN $5::uuid IS NOT NULL THEN 'SKIPPED_DUPLICATE'::"CrawlCandidateStatus"
                         ELSE status
                     END,
                     imported_source_id = COALESCE($5::uuid, imported_source_id),
                     rejection_reason = CASE
                         WHEN $5::uuid IS NOT NULL THEN $6
                         ELSE rejection_reason
                     END,
                     updated_at = CURRENT_TIMESTAMP
                 WHERE id = $1::uuid`,
                existing[0].id,
                candidate.title,
                candidate.contentHash ?? null,
                JSON.stringify(candidate.metadata),
                duplicate?.id ?? null,
                duplicate?.reason ?? null,
            );
            return { inserted: false };
        }

        if (duplicate) {
            await this.prisma.$executeRawUnsafe(
                `INSERT INTO crawl_candidates
                    (source, source_url, title, format, status, language, category_slug, content_hash, crawl_filter, rejection_reason, imported_source_id, metadata)
                 VALUES ($1, $2, $3, $4::"CrawlCandidateFormat", 'SKIPPED_DUPLICATE'::"CrawlCandidateStatus", $5, $6, $7, $8, $9, $10::uuid, $11::jsonb)`,
                LEARNNOW_SOURCE,
                candidate.sourceUrl,
                candidate.title,
                candidate.format,
                candidate.language,
                candidate.categorySlug,
                candidate.contentHash ?? null,
                candidate.crawlFilter,
                duplicate.reason,
                duplicate.id,
                JSON.stringify(candidate.metadata),
            );
            return { inserted: false };
        }

        await this.prisma.$executeRawUnsafe(
            `INSERT INTO crawl_candidates (source, source_url, title, format, language, category_slug, content_hash, crawl_filter, metadata)
             VALUES ($1, $2, $3, $4::"CrawlCandidateFormat", $5, $6, $7, $8, $9::jsonb)`,
            LEARNNOW_SOURCE,
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

    private async findDuplicateKnowledgeSource(sourceUrl: string, contentHash?: string | null): Promise<DuplicateKnowledgeSource | null> {
        const byUrl = await this.prisma.knowledgeSource.findFirst({
            where: { url: sourceUrl },
            select: { id: true },
        });
        if (byUrl) {
            return { id: byUrl.id, reason: 'Knowledge source URL already exists' };
        }

        if (!contentHash) return null;

        const byHash = await this.prisma.knowledgeSource.findFirst({
            where: { lastHash: contentHash },
            select: { id: true },
        });
        if (byHash) {
            return { id: byHash.id, reason: 'Knowledge source content hash already exists' };
        }

        return null;
    }

    private async enrichCandidateForReview(candidate: DiscoveredCandidate): Promise<DiscoveredCandidate> {
        if (candidate.sourceUrl.includes('/totara/engage/resources/howto/index.php')) {
            try {
                const result = await this.crawlService.fetch(candidate.sourceUrl);
                const learnNow = (result.metadata?.learnNow ?? {}) as Record<string, unknown>;
                const transcriptStatus = typeof learnNow.transcriptStatus === 'string'
                    ? learnNow.transcriptStatus
                    : 'NOT_APPLICABLE';
                const contentLength = result.content.length;
                const imageCount = result.images?.length ?? 0;
                const transcriptLength = typeof learnNow.transcriptLength === 'number'
                    ? learnNow.transcriptLength
                    : 0;
                const reviewDecision = this.evaluateReviewQuality({
                    candidate,
                    sourceType: String(learnNow.type ?? candidate.crawlFilter),
                    contentLength,
                    transcriptStatus,
                });

                return {
                    ...candidate,
                    title: result.title || candidate.title,
                    contentHash: result.hash,
                    metadata: {
                        ...candidate.metadata,
                        crawlerProvider: result.provider ?? 'basic',
                        crawler: (result.metadata ?? {}) as Prisma.InputJsonObject,
                        reviewQuality: {
                            sourceType: learnNow.type ?? candidate.crawlFilter,
                            contentLength,
                            imageCount,
                            transcriptStatus,
                            transcriptLanguage: learnNow.transcriptLanguage ?? null,
                            transcriptLength,
                            readyForImport: reviewDecision.readyForImport,
                            reasonCode: reviewDecision.reasonCode,
                        },
                    },
                };
            } catch (error: any) {
                this.logger.warn(`⚠️ Learn Now candidate enrichment failed (${error.message}): ${candidate.sourceUrl}`);
                return {
                    ...candidate,
                    metadata: {
                        ...candidate.metadata,
                        reviewQuality: {
                            sourceType: candidate.crawlFilter,
                            readyForImport: false,
                            enrichmentError: error.message,
                        },
                    },
                };
            }
        }

        return this.withDefaultReviewQuality(candidate);
    }

    private withDefaultReviewQuality(candidate: DiscoveredCandidate): DiscoveredCandidate {
        const reviewDecision = this.evaluateReviewQuality({
            candidate,
            sourceType: candidate.crawlFilter,
            contentLength: null,
            transcriptStatus: null,
        });

        return {
            ...candidate,
            metadata: {
                ...candidate.metadata,
                reviewQuality: {
                    sourceType: candidate.crawlFilter,
                    candidateFormat: candidate.format,
                    readyForImport: reviewDecision.readyForImport,
                    reasonCode: reviewDecision.reasonCode,
                },
            },
        };
    }

    private evaluateReviewQuality(params: {
        candidate: DiscoveredCandidate;
        sourceType: string;
        contentLength: number | null;
        transcriptStatus: string | null;
    }): CandidateReviewDecision {
        if (params.candidate.format === 'PDF') {
            return {
                readyForImport: true,
                reasonCode: 'PDF_VALIDATED_ON_IMPORT',
            };
        }

        const contentLength = params.contentLength ?? 0;
        if (params.contentLength !== null && contentLength < 250) {
            return {
                readyForImport: false,
                reasonCode: 'CONTENT_TOO_SHORT',
            };
        }

        if (this.requiresTranscript(params.candidate.crawlFilter, params.sourceType)) {
            if (params.transcriptStatus === 'AVAILABLE') {
                return {
                    readyForImport: true,
                    reasonCode: 'MEDIA_TRANSCRIPT_READY',
                };
            }

            return {
                readyForImport: false,
                reasonCode: 'TRANSCRIPT_REQUIRED',
            };
        }

        if (params.contentLength !== null) {
            return {
                readyForImport: true,
                reasonCode: 'ARTICLE_CONTENT_READY',
            };
        }

        return {
            readyForImport: false,
            reasonCode: 'NEEDS_CONTENT_REVIEW',
        };
    }

    private requiresTranscript(crawlFilter: string, sourceType: string): boolean {
        const normalized = new Set([
            crawlFilter,
            sourceType,
        ].map(value => value.toLowerCase().replace(/-/g, '_')));

        return normalized.has('explaining_video')
            || normalized.has('explainer_video')
            || normalized.has('recorded_online_session')
            || normalized.has('recording');
    }

    private async findCandidate(id: string): Promise<CrawlCandidateRecord | null> {
        const rows = await this.prisma.$queryRawUnsafe<CrawlCandidateRecord[]>(
            `SELECT id, source, source_url, title, format, status, language, category_slug, content_hash, crawl_filter, rejection_reason, metadata
             FROM crawl_candidates
             WHERE id = $1::uuid
             LIMIT 1`,
            id,
        );
        return rows[0] ?? null;
    }

    private async markCandidate(id: string, status: CandidateStatus, sourceId?: string | null, reason?: string) {
        await this.prisma.$executeRawUnsafe(
            `UPDATE crawl_candidates
             SET status = $2::"CrawlCandidateStatus",
                 imported_source_id = COALESCE($3::uuid, imported_source_id),
                 imported_at = CASE WHEN $2 = 'IMPORTED' THEN CURRENT_TIMESTAMP ELSE imported_at END,
                 rejection_reason = COALESCE($4, rejection_reason),
                 updated_at = CURRENT_TIMESTAMP
             WHERE id = $1::uuid`,
            id,
            status,
            sourceId ?? null,
            reason ?? null,
        );
    }

    private normalizeCandidateIds(ids: string[] | undefined): string[] {
        if (!Array.isArray(ids)) {
            throw new BadRequestException('ids must be an array');
        }

        const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
        const unique = [...new Set(ids.map(id => String(id ?? '').trim()).filter(Boolean))];
        const invalid = unique.find(id => !uuidPattern.test(id));
        if (invalid) {
            throw new BadRequestException(`Invalid crawler candidate id: ${invalid}`);
        }

        return unique;
    }

    private buildImportMetadata(candidate: CrawlCandidateRecord, sourceType: 'knowledge_article' | 'pdf'): Prisma.InputJsonObject {
        const candidateMetadata = (candidate.metadata ?? {}) as Record<string, unknown>;
        const candidateSourceType = typeof candidateMetadata.sourceType === 'string'
            ? candidateMetadata.sourceType
            : sourceType;

        return {
            ...candidateMetadata,
            source: candidate.source,
            sourceType: candidateSourceType,
            sourceUrl: candidate.source_url,
            categorySlug: candidate.category_slug ?? 'uncategorized',
            crawlFilter: candidate.crawl_filter ?? sourceType,
            ingestionMode: 'bulk-safe',
            useAiPreprocessing: false,
            crawledAt: new Date().toISOString(),
        };
    }

    private mapCandidateRow(row: CrawlCandidateRecord) {
        return {
            id: row.id,
            source: row.source,
            sourceUrl: row.source_url,
            title: row.title,
            format: row.format,
            status: row.status,
            language: row.language,
            categorySlug: row.category_slug,
            contentHash: row.content_hash,
            crawlFilter: row.crawl_filter,
            rejectionReason: row.rejection_reason,
            metadata: row.metadata,
        };
    }

    private dedupeByUrl(candidates: DiscoveredCandidate[]): DiscoveredCandidate[] {
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
        return parsed.searchParams.get('id')
            ? `Learn Now Resource ${parsed.searchParams.get('id')}`
            : parsed.pathname.split('/').filter(Boolean).pop() ?? 'Learn Now Resource';
    }

    private inferLanguage(url: string): string {
        const match = url.match(/learnnow\.allplan\.com\/([a-z]{2})(?:\/|$)/i);
        return match?.[1]?.toLowerCase() ?? 'en';
    }

    private toCandidateFormat(format: LearnNowCrawlFormat): CandidateFormat {
        return format === 'pdf' || format === 'technical_manual' ? 'PDF' : 'KNOWLEDGE_ARTICLE';
    }

    private isTotaraHowtoResource(url: URL): boolean {
        return url.pathname.includes('/totara/engage/resources/howto/index.php')
            && Boolean(url.searchParams.get('id'));
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
