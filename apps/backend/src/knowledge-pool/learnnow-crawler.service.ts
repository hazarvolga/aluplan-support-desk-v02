import { Injectable, Logger, BadRequestException, ConflictException, NotFoundException } from '@nestjs/common';
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
import { OutboundUrlSafetyService } from './outbound-url-safety.service';
import { LearnNowRequestPacer } from './learnnow-request-pacer.service';

type CandidateStatus =
    | 'PENDING_REVIEW'
    | 'APPROVED'
    | 'IMPORTING'
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
    imported_source_id: string | null;
    import_started_at: Date | null;
    metadata: Record<string, unknown> | null;
};

export type DiscoveredCandidate = {
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
const HTML_RESPONSE_LIMIT_BYTES = 2 * 1024 * 1024;
const PDF_RESPONSE_LIMIT_BYTES = 50 * 1024 * 1024;
const IMPORT_LEASE_MS = 15 * 60 * 1000;
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
        private readonly urlSafety: OutboundUrlSafetyService,
        private readonly requestPacer: LearnNowRequestPacer,
    ) { }

    async discover(dto: DiscoverLearnNowDto) {
        if (dto.dryRun === false) {
            throw new BadRequestException('Saving discovery is only available through the rate-limited Learn Now crawl run endpoint');
        }
        const formats: LearnNowCrawlFormat[] = dto.formats?.length ? dto.formats : ['knowledge_article', 'pdf'];
        const maxPages = Math.min(dto.maxPages ?? 1, 1);
        const maxCandidates = Math.min(dto.maxCandidates ?? 5, 5);
        const dryRun = true;
        const search = dto.search?.trim() ?? '';
        const session = await this.createLearnNowSession();

        const discovered: DiscoveredCandidate[] = [];
        for (const format of formats) {
            for (let page = 0; page < maxPages && discovered.length < maxCandidates; page += 1) {
                const url = this.buildSearchUrl(format, search, page);
                const html = await this.fetchSearchHtml(url, session);
                const htmlCandidates = this.extractCandidates(html, format, url);
                discovered.push(...htmlCandidates);

            }
        }

        const unique = this.dedupeByUrl(discovered).slice(0, maxCandidates);
        return {
            dryRun,
            discovered: unique.length,
            candidates: unique,
        };
    }

    async stageCandidate(candidate: DiscoveredCandidate, runKey?: string): Promise<{ inserted: boolean }> {
        this.assertPublicLearnNowUrl(candidate.sourceUrl);
        if (runKey) {
            const previous = await this.getStageResult(candidate.sourceUrl, runKey);
            if (previous !== null) return { inserted: previous };
        }

        const enrichedCandidate = await this.enrichCandidateForReview(candidate);
        return this.upsertCandidate(enrichedCandidate, runKey);
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

        if (candidate.status === 'IMPORTING') {
            return this.resumeStaleImport(candidate);
        }

        if (candidate.status === 'IMPORTED') {
            return { skipped: true, reason: 'ALREADY_IMPORTED', candidateId: id };
        }
        if (candidate.status === 'SKIPPED_DUPLICATE') {
            return {
                skipped: true,
                reason: 'ALREADY_DUPLICATE',
                candidateId: id,
                sourceId: candidate.imported_source_id,
            };
        }
        if (candidate.status !== 'APPROVED') {
            throw new BadRequestException('Only approved crawler candidates can be imported');
        }

        if (this.requiresTranscript(candidate.crawl_filter ?? '', this.getCandidateSourceType(candidate))
            && !this.hasImportableTranscript(candidate)) {
            throw new BadRequestException('Learn Now video candidates require an available transcript before import');
        }

        if (!this.isReviewReady(candidate)) {
            throw new BadRequestException('Candidate review quality is not ready for import');
        }

        await this.validateCandidateImportUrl(candidate);

        const claimed = await this.prisma.$executeRawUnsafe<number>(
            `UPDATE crawl_candidates
             SET status = 'IMPORTING'::"CrawlCandidateStatus",
                 import_started_at = CURRENT_TIMESTAMP,
                 rejection_reason = NULL,
                 updated_at = CURRENT_TIMESTAMP
             WHERE id = $1::uuid
               AND status = 'APPROVED'::"CrawlCandidateStatus"
               AND metadata->'reviewQuality'->>'readyForImport' = 'true'`,
            candidate.id,
        );
        if (Number(claimed) !== 1) {
            const current = await this.findCandidate(candidate.id);
            if (current?.status === 'IMPORTED') {
                return { skipped: true, reason: 'ALREADY_IMPORTED', candidateId: id };
            }
            if (current?.status === 'SKIPPED_DUPLICATE') {
                return {
                    skipped: true,
                    reason: 'ALREADY_DUPLICATE',
                    candidateId: id,
                    sourceId: current.imported_source_id,
                };
            }
            throw new ConflictException('Crawler candidate import is already in progress or no longer approved');
        }

        try {
            if (candidate.format === 'PDF') {
                return await this.importPdfCandidate(candidate);
            }
            return await this.importArticleCandidate(candidate);
        } catch (error: any) {
            await this.recordImportError(candidate.id, error?.message ?? 'Candidate import failed');
            throw error;
        }
    }

    async approveCandidate(id: string): Promise<{ success: true; status: 'APPROVED' }> {
        const rows = await this.prisma.$queryRawUnsafe<Array<{ id: string }>>(
            `UPDATE crawl_candidates
             SET status = 'APPROVED'::"CrawlCandidateStatus",
                 rejection_reason = NULL,
                 updated_at = CURRENT_TIMESTAMP
             WHERE id = $1::uuid
               AND status = 'PENDING_REVIEW'::"CrawlCandidateStatus"
               AND metadata->'reviewQuality'->>'readyForImport' = 'true'
             RETURNING id`,
            id,
        );
        if (rows.length === 0) {
            throw new BadRequestException('Only ready pending-review candidates can be approved');
        }
        return { success: true, status: 'APPROVED' };
    }

    async rejectCandidate(id: string, reason: string): Promise<{ success: true; status: 'REJECTED' }> {
        const normalizedReason = reason.trim();
        if (!normalizedReason || normalizedReason.length > 500) {
            throw new BadRequestException('Rejection reason must contain between 1 and 500 characters');
        }
        const rows = await this.prisma.$queryRawUnsafe<Array<{ id: string }>>(
            `UPDATE crawl_candidates
             SET status = 'REJECTED'::"CrawlCandidateStatus",
                 rejection_reason = $2,
                 updated_at = CURRENT_TIMESTAMP
             WHERE id = $1::uuid
               AND status IN ('PENDING_REVIEW', 'APPROVED')
             RETURNING id`,
            id,
            normalizedReason,
        );
        if (rows.length === 0) {
            throw new BadRequestException('Only pending-review or approved candidates can be rejected');
        }
        return { success: true, status: 'REJECTED' };
    }

    async deleteCandidate(id: string): Promise<{ success: boolean; count: number }> {
        const [candidateId] = this.normalizeCandidateIds([id]);
        const deleted = await this.prisma.$executeRawUnsafe<number>(
            `DELETE FROM crawl_candidates
             WHERE id = $1::uuid
               AND status <> 'IMPORTING'::"CrawlCandidateStatus"`,
            candidateId,
        );

        if (Number(deleted) === 0) {
            const rows = await this.prisma.$queryRawUnsafe<Array<{ status: CandidateStatus }>>(
                `SELECT status FROM crawl_candidates WHERE id = $1::uuid LIMIT 1`,
                candidateId,
            );
            if (rows[0]?.status === 'IMPORTING') {
                throw new ConflictException('Importing crawler candidates cannot be deleted');
            }
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
        return this.prisma.$transaction(async (transaction) => {
            const locked = await transaction.$queryRawUnsafe<Array<{ id: string; status: CandidateStatus }>>(
                `SELECT id, status FROM crawl_candidates
                 WHERE id IN (${placeholders})
                 ORDER BY id
                 FOR UPDATE`,
                ...candidateIds,
            );

            if (locked.some(candidate => candidate.status === 'IMPORTING')) {
                throw new ConflictException('Importing crawler candidates cannot be deleted');
            }

            if (locked.length === 0) {
                return { success: true, count: 0 };
            }

            const lockedIds = locked.map(candidate => candidate.id);
            const lockedPlaceholders = lockedIds.map((_, index) => `$${index + 1}::uuid`).join(', ');
            const deleted = await transaction.$executeRawUnsafe<number>(
                `DELETE FROM crawl_candidates WHERE id IN (${lockedPlaceholders})`,
                ...lockedIds,
            );

            return { success: true, count: Number(deleted) };
        });
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
        const response = await this.getWithSafeRedirects<ArrayBuffer>(candidate.source_url, {
            responseType: 'arraybuffer',
            timeout: 30000,
            headers: { 'User-Agent': 'Mozilla/5.0 AluplanSupportBot/1.0' },
            maxContentLength: PDF_RESPONSE_LIMIT_BYTES,
            maxBodyLength: PDF_RESPONSE_LIMIT_BYTES,
        }, candidate.source === LEARNNOW_SOURCE ? 'learnnow' : 'public');

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

        let source: { id: string };
        try {
            source = await this.prisma.knowledgeSource.create({
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
        } catch (error) {
            await this.storageService.deleteFile(storageKey).catch(() => undefined);
            throw error;
        }

        try {
            await this.checkpointImportSource(candidate.id, source.id, hash);
        } catch (error) {
            await this.prisma.knowledgeSource.delete({ where: { id: source.id } }).catch(() => undefined);
            await this.storageService.deleteFile(storageKey).catch(() => undefined);
            throw error;
        }
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
        const response = await this.getWithSafeRedirects<string>(`${LEARNNOW_BASE_URL}/int`, {
            timeout: 15000,
            headers: { 'User-Agent': 'Mozilla/5.0 AluplanSupportBot/1.0' },
            maxContentLength: HTML_RESPONSE_LIMIT_BYTES,
            maxBodyLength: HTML_RESPONSE_LIMIT_BYTES,
        }, 'learnnow');
        this.collectSetCookies(response.headers?.['set-cookie'], cookies);
        return { cookies };
    }

    private async fetchSearchHtml(url: string, session: LearnNowSession): Promise<string> {
        const parsed = new URL(url);
        if (parsed.hostname !== 'learnnow.allplan.com') {
            throw new BadRequestException('Only learnnow.allplan.com crawl discovery is allowed');
        }

        const response = await this.getWithSafeRedirects<string>(url, {
            timeout: 15000,
            headers: {
                'User-Agent': 'Mozilla/5.0 AluplanSupportBot/1.0',
                Cookie: this.serializeCookies(session.cookies),
            },
            maxContentLength: HTML_RESPONSE_LIMIT_BYTES,
            maxBodyLength: HTML_RESPONSE_LIMIT_BYTES,
        }, 'learnnow');
        return response.data;
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

    private toLearnNowUrl(href: string): string | null {
        if (!href || href.startsWith('#') || href.startsWith('mailto:')) return null;
        try {
            const url = new URL(href, LEARNNOW_BASE_URL);
            if (url.protocol !== 'https:' || url.hostname !== 'learnnow.allplan.com' || url.port || url.username || url.password) return null;
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

    private async upsertCandidate(candidate: DiscoveredCandidate, runKey?: string): Promise<{ inserted: boolean }> {
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
                JSON.stringify(this.withRunMarker(candidate.metadata, runKey, false)),
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
                JSON.stringify(this.withRunMarker(candidate.metadata, runKey, false)),
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
            JSON.stringify(this.withRunMarker(candidate.metadata, runKey, true)),
        );
        return { inserted: true };
    }

    async getStageResult(sourceUrl: string, runKey: string): Promise<boolean | null> {
        this.assertPublicLearnNowUrl(sourceUrl);
        const rows = await this.prisma.$queryRawUnsafe<Array<{ inserted: boolean }>>(
            `SELECT (metadata->>'crawlRunInserted')::boolean AS inserted
             FROM crawl_candidates
             WHERE source_url = $1
               AND metadata->>'crawlRunKey' = $2
             LIMIT 1`,
            sourceUrl,
            runKey,
        );
        return rows[0]?.inserted ?? null;
    }

    private withRunMarker(
        metadata: Prisma.InputJsonObject,
        runKey: string | undefined,
        inserted: boolean,
    ): Prisma.InputJsonObject {
        if (!runKey) return metadata;
        return { ...metadata, crawlRunKey: runKey, crawlRunInserted: inserted };
    }

    private assertPublicLearnNowUrl(value: string): void {
        let url: URL;
        try {
            url = new URL(value);
        } catch {
            throw new BadRequestException('Invalid Learn Now candidate URL');
        }
        if (url.protocol !== 'https:' || url.hostname !== 'learnnow.allplan.com' || url.port || url.username || url.password) {
            throw new BadRequestException('Only public HTTPS learnnow.allplan.com candidate URLs are allowed');
        }
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
                    language: this.authoritativeLanguage(learnNow, candidate.language),
                    categorySlug: this.authoritativeCategorySlug(learnNow, candidate.categorySlug),
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

    private getCandidateSourceType(candidate: CrawlCandidateRecord): string {
        const reviewQuality = candidate.metadata?.reviewQuality;
        if (reviewQuality && typeof reviewQuality === 'object' && !Array.isArray(reviewQuality)) {
            const sourceType = (reviewQuality as Record<string, unknown>).sourceType;
            if (typeof sourceType === 'string') return sourceType;
        }
        return candidate.crawl_filter ?? '';
    }

    private hasImportableTranscript(candidate: CrawlCandidateRecord): boolean {
        const reviewQuality = candidate.metadata?.reviewQuality;
        if (!reviewQuality || typeof reviewQuality !== 'object' || Array.isArray(reviewQuality)) return false;
        const quality = reviewQuality as Record<string, unknown>;
        return quality.transcriptStatus === 'AVAILABLE' && quality.readyForImport === true;
    }

    private isReviewReady(candidate: CrawlCandidateRecord): boolean {
        const reviewQuality = candidate.metadata?.reviewQuality;
        return Boolean(
            reviewQuality
            && typeof reviewQuality === 'object'
            && !Array.isArray(reviewQuality)
            && (reviewQuality as Record<string, unknown>).readyForImport === true,
        );
    }

    private async validateCandidateImportUrl(candidate: CrawlCandidateRecord): Promise<void> {
        if (candidate.source === LEARNNOW_SOURCE) {
            await this.urlSafety.validateLearnNowUrl(candidate.source_url);
            return;
        }
        if (candidate.source === 'allplan_help' || candidate.source === 'generic_web') {
            await this.urlSafety.validatePublicHttpsUrl(candidate.source_url);
            return;
        }
        throw new BadRequestException(`Unsupported crawler candidate source: ${candidate.source}`);
    }

    private async findCandidate(id: string): Promise<CrawlCandidateRecord | null> {
        const rows = await this.prisma.$queryRawUnsafe<CrawlCandidateRecord[]>(
            `SELECT id, source, source_url, title, format, status, language, category_slug, content_hash, crawl_filter, rejection_reason, imported_source_id, import_started_at, metadata
             FROM crawl_candidates
             WHERE id = $1::uuid
             LIMIT 1`,
            id,
        );
        return rows[0] ?? null;
    }

    private async markCandidate(id: string, status: CandidateStatus, sourceId?: string | null, reason?: string) {
        const updated = await this.prisma.$executeRawUnsafe<number>(
            `UPDATE crawl_candidates
             SET status = $2::"CrawlCandidateStatus",
                 imported_source_id = COALESCE($3::uuid, imported_source_id),
                 imported_at = CASE WHEN $2 = 'IMPORTED' THEN CURRENT_TIMESTAMP ELSE imported_at END,
                 import_started_at = CASE
                     WHEN $2 IN ('IMPORTED', 'SKIPPED_DUPLICATE', 'FAILED') THEN NULL
                     ELSE import_started_at
                 END,
                 rejection_reason = COALESCE($4, rejection_reason),
                 updated_at = CURRENT_TIMESTAMP
             WHERE id = $1::uuid
               AND (
                   $2::"CrawlCandidateStatus" NOT IN ('IMPORTED', 'SKIPPED_DUPLICATE', 'FAILED')
                   OR status = 'IMPORTING'::"CrawlCandidateStatus"
               )`,
            id,
            status,
            sourceId ?? null,
            reason ?? null,
        );
        if (['IMPORTED', 'SKIPPED_DUPLICATE', 'FAILED'].includes(status) && Number(updated) !== 1) {
            throw new ConflictException('Crawler candidate terminal transition lost its import claim');
        }
    }

    private async checkpointImportSource(candidateId: string, sourceId: string, contentHash?: string): Promise<void> {
        const updated = await this.prisma.$executeRawUnsafe<number>(
            `UPDATE crawl_candidates
             SET imported_source_id = $2::uuid,
                 content_hash = COALESCE($3, content_hash),
                 updated_at = CURRENT_TIMESTAMP
             WHERE id = $1::uuid
               AND status = 'IMPORTING'::"CrawlCandidateStatus"`,
            candidateId,
            sourceId,
            contentHash ?? null,
        );
        if (Number(updated) !== 1) {
            throw new ConflictException('Crawler candidate lost its import claim before source checkpoint');
        }
    }

    private async recordImportError(candidateId: string, reason: string): Promise<void> {
        await this.prisma.$executeRawUnsafe(
            `UPDATE crawl_candidates
             SET rejection_reason = $2,
                 updated_at = CURRENT_TIMESTAMP
             WHERE id = $1::uuid
               AND status = 'IMPORTING'::"CrawlCandidateStatus"`,
            candidateId,
            reason.slice(0, 1000),
        );
    }

    private async resumeStaleImport(candidate: CrawlCandidateRecord): Promise<any> {
        const startedAt = candidate.import_started_at?.getTime() ?? Date.now();
        if (Date.now() - startedAt < IMPORT_LEASE_MS) {
            throw new ConflictException('Crawler candidate import is already in progress');
        }

        const sourceId = candidate.imported_source_id
            ?? (await this.findDuplicateKnowledgeSource(candidate.source_url, candidate.content_hash))?.id
            ?? null;
        if (sourceId) {
            await this.knowledgePoolService.triggerSync(sourceId);
            await this.markCandidate(candidate.id, 'IMPORTED', sourceId);
            return { imported: true, resumed: true, candidateId: candidate.id, sourceId };
        }

        const released = await this.prisma.$executeRawUnsafe<number>(
            `UPDATE crawl_candidates
             SET status = 'APPROVED'::"CrawlCandidateStatus",
                 import_started_at = NULL,
                 rejection_reason = NULL,
                 updated_at = CURRENT_TIMESTAMP
             WHERE id = $1::uuid
               AND status = 'IMPORTING'::"CrawlCandidateStatus"
               AND import_started_at < CURRENT_TIMESTAMP - INTERVAL '15 minutes'`,
            candidate.id,
        );
        if (Number(released) !== 1) {
            throw new ConflictException('Crawler candidate import lease is no longer recoverable');
        }
        return this.importCandidate(candidate.id);
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

    private authoritativeLanguage(learnNow: Record<string, unknown>, fallback: string): string {
        const value = typeof learnNow.language === 'string' ? learnNow.language.trim().toLowerCase() : '';
        return /^[a-z]{2,3}(?:-[a-z0-9]{2,8})?$/.test(value) ? value : fallback;
    }

    private authoritativeCategorySlug(learnNow: Record<string, unknown>, fallback: string): string {
        const categories = Array.isArray(learnNow.humanReadableCategories)
            ? learnNow.humanReadableCategories
            : Array.isArray(learnNow.categories)
                ? learnNow.categories
                : [];
        const authoritative = categories
            .filter((value): value is string => typeof value === 'string' && value.trim().length > 0)
            .join(' ')
            .replace(/::/g, ' ')
            .normalize('NFKD')
            .replace(/[\u0300-\u036f]/g, '')
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/^-+|-+$/g, '')
            .slice(0, 100);
        return authoritative || fallback;
    }

    private async getWithSafeRedirects<T>(
        initialUrl: string,
        config: Record<string, unknown>,
        policy: 'learnnow' | 'public',
    ): Promise<{ data: T; headers: Record<string, any>; status?: number }> {
        let currentUrl = initialUrl;
        for (let redirectCount = 0; redirectCount <= 5; redirectCount += 1) {
            let httpsAgent;
            if (policy === 'learnnow') {
                ({ httpsAgent } = await this.urlSafety.validateLearnNowUrl(currentUrl));
                await this.requestPacer.waitForTurn();
            } else {
                ({ httpsAgent } = await this.urlSafety.validatePublicHttpsUrl(currentUrl));
            }
            const response = await axios.get<T>(currentUrl, {
                ...config,
                httpsAgent,
                maxRedirects: 0,
                validateStatus: status => status >= 200 && status < 400,
            });
            const status = response.status ?? 200;
            const location = response.headers?.location;
            if (status < 300 || status >= 400 || !location) return response as any;
            currentUrl = new URL(String(location), currentUrl).toString();
        }
        throw new BadRequestException('Too many outbound redirects');
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
