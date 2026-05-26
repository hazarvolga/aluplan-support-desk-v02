import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import axios from 'axios';
import { Prisma } from '@aluplan/database';
import { PrismaService } from '../prisma/prisma.service';
import { CrawlResult, CrawlService } from './crawl.service';
import { AllplanHelpCrawlMode, DiscoverAllplanHelpDto } from './dto/allplan-help-crawl.dto';

type CandidateFormat = 'KNOWLEDGE_ARTICLE';

type AllplanHelpLocation = {
    originalUrl: string;
    version: string;
    lcid: string;
    book: string;
    baseUrl: string;
    tocUrl: string;
    topicFile: string | null;
    canonicalTopicUrl: string | null;
};

type AllplanHelpTocNode = {
    id?: number | string;
    o?: number | string;
    text?: string;
    url?: string;
    node?: string;
    leaf?: boolean;
    hidden?: boolean;
    children?: AllplanHelpTocNode[];
};

type FlattenedHelpNode = {
    id?: string;
    objectId?: string;
    node?: string;
    title: string;
    url: string;
    topicFile: string;
    hidden: boolean;
    path: string[];
    children: FlattenedHelpNode[];
};

type DiscoveredAllplanHelpCandidate = {
    sourceUrl: string;
    title: string;
    format: CandidateFormat;
    language: string;
    categorySlug: string;
    crawlFilter: string;
    contentHash?: string;
    metadata: Prisma.InputJsonObject;
};

const ALLPLAN_HELP_SOURCE = 'allplan_help';
const DEFAULT_MAX_CANDIDATES = 50;

@Injectable()
export class AllplanHelpCrawlerService {
    private readonly logger = new Logger(AllplanHelpCrawlerService.name);

    constructor(
        private readonly prisma: PrismaService,
        private readonly crawlService: CrawlService,
    ) { }

    async discover(dto: DiscoverAllplanHelpDto) {
        const location = this.parseHelpUrl(dto.startUrl);
        const mode = dto.mode ?? (location.topicFile ? 'subtree' : 'fullBook');
        const maxCandidates = dto.maxCandidates ?? DEFAULT_MAX_CANDIDATES;
        const includeHidden = dto.includeHidden === true;
        const dryRun = dto.dryRun !== false;
        const sourceName = dto.name?.trim() || `Allplan Help ${location.version} ${location.book}`;

        const toc = await this.fetchToc(location.tocUrl);
        const flatNodes = this.flattenToc(toc).filter(node => includeHidden || !node.hidden);
        const selectedNodes = this.selectNodes(flatNodes, mode, location.topicFile)
            .filter(node => includeHidden || !node.hidden)
            .slice(0, maxCandidates);

        if (selectedNodes.length === 0 && location.canonicalTopicUrl) {
            selectedNodes.push({
                title: this.titleFromTopicFile(location.topicFile ?? location.canonicalTopicUrl),
                url: location.canonicalTopicUrl,
                topicFile: location.topicFile ?? this.topicFileFromUrl(location.canonicalTopicUrl),
                hidden: false,
                path: [this.titleFromTopicFile(location.topicFile ?? location.canonicalTopicUrl)],
                children: [],
            });
        }

        const discovered: DiscoveredAllplanHelpCandidate[] = [];
        for (const node of selectedNodes) {
            if (discovered.length >= maxCandidates) break;
            const sourceUrl = this.toTopicUrl(location.baseUrl, node.url);
            if (!sourceUrl) continue;

            try {
                const result = await this.crawlService.fetch(sourceUrl);
                discovered.push(this.buildCandidate({
                    location,
                    node,
                    sourceUrl,
                    result,
                    sourceName,
                    mode,
                }));
            } catch (error: any) {
                this.logger.warn(`⚠️ Allplan Help topic crawl failed (${error.message}): ${sourceUrl}`);
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

    private parseHelpUrl(value: string): AllplanHelpLocation {
        let url: URL;
        try {
            url = new URL(value);
        } catch {
            throw new BadRequestException('Invalid Allplan Help URL');
        }

        if (url.hostname !== 'help.allplan.com') {
            throw new BadRequestException('Only help.allplan.com URLs are supported by this crawler');
        }

        const segments = url.pathname.split('/').filter(Boolean);
        const rootIndex = segments.findIndex(segment => segment.toLowerCase() === 'allplan');
        if (rootIndex < 0 || segments.length < rootIndex + 4) {
            throw new BadRequestException('Unsupported Allplan Help URL structure');
        }

        const version = segments[rootIndex + 1];
        const lcid = segments[rootIndex + 2];
        const book = segments[rootIndex + 3];
        const fileName = segments[rootIndex + 4] ?? 'index.htm';
        const basePath = `/${segments.slice(0, rootIndex + 4).join('/')}/`;
        const baseUrl = new URL(basePath, url.origin).toString();
        const hashTopic = decodeURIComponent(url.hash.replace(/^#/, '')).trim();
        const topicFile = this.isTopicFile(hashTopic)
            ? hashTopic
            : this.isTopicFile(fileName) && !/^index\.htm$/i.test(fileName)
                ? fileName
                : null;

        return {
            originalUrl: value,
            version,
            lcid,
            book,
            baseUrl,
            tocUrl: new URL('toc.json', baseUrl).toString(),
            topicFile,
            canonicalTopicUrl: topicFile ? new URL(topicFile, baseUrl).toString() : null,
        };
    }

    private async fetchToc(tocUrl: string): Promise<AllplanHelpTocNode[]> {
        const response = await axios.get<AllplanHelpTocNode[] | { children?: AllplanHelpTocNode[] }>(tocUrl, {
            timeout: 20000,
            maxRedirects: 5,
            headers: { 'User-Agent': 'Mozilla/5.0 AluplanSupportBot/1.0' },
        });
        const data = response.data;
        if (Array.isArray(data)) return data;
        if (Array.isArray(data?.children)) return data.children;
        throw new BadRequestException('Allplan Help TOC could not be parsed');
    }

    private flattenToc(nodes: AllplanHelpTocNode[], path: string[] = []): FlattenedHelpNode[] {
        const flattened: FlattenedHelpNode[] = [];

        for (const node of nodes) {
            const title = this.cleanTitle(String(node.text ?? ''));
            const nodePath = title ? [...path, title] : path;
            const topicFile = this.toTopicFile(node.url ?? '');
            const children = (node.children ?? [])
                .map(child => this.toFlattenedTocNode(child, nodePath))
                .filter((child): child is FlattenedHelpNode => Boolean(child));

            if (title && topicFile) {
                flattened.push({
                    id: node.id == null ? undefined : String(node.id),
                    objectId: node.o == null ? undefined : String(node.o),
                    node: node.node,
                    title,
                    url: topicFile,
                    topicFile,
                    hidden: node.hidden === true,
                    path: nodePath,
                    children,
                });
            }

            flattened.push(...children);
        }

        return flattened;
    }

    private toFlattenedTocNode(node: AllplanHelpTocNode, path: string[] = []): FlattenedHelpNode | null {
        const title = this.cleanTitle(String(node.text ?? ''));
        const nodePath = title ? [...path, title] : path;
        const topicFile = this.toTopicFile(node.url ?? '');
        const children = (node.children ?? [])
            .map(child => this.toFlattenedTocNode(child, nodePath))
            .filter((child): child is FlattenedHelpNode => Boolean(child));

        if (!title || !topicFile) return null;

        return {
            id: node.id == null ? undefined : String(node.id),
            objectId: node.o == null ? undefined : String(node.o),
            node: node.node,
            title,
            url: topicFile,
            topicFile,
            hidden: node.hidden === true,
            path: nodePath,
            children,
        };
    }

    private selectNodes(nodes: FlattenedHelpNode[], mode: AllplanHelpCrawlMode, topicFile: string | null): FlattenedHelpNode[] {
        if (mode === 'fullBook') return nodes;
        if (!topicFile) return nodes.slice(0, 1);

        const target = nodes.find(node => node.topicFile === topicFile);
        if (!target) return [];
        if (mode === 'topic') return [target];

        const descendants = this.collectDescendants(target);
        return [target, ...descendants];
    }

    private collectDescendants(node: FlattenedHelpNode): FlattenedHelpNode[] {
        return node.children.flatMap(child => [child, ...this.collectDescendants(child)]);
    }

    private buildCandidate(params: {
        location: AllplanHelpLocation;
        node: FlattenedHelpNode;
        sourceUrl: string;
        result: CrawlResult;
        sourceName: string;
        mode: AllplanHelpCrawlMode;
    }): DiscoveredAllplanHelpCandidate {
        const title = this.cleanTitle(params.result.title) || params.node.title;
        const categorySlug = this.inferCategorySlug(params.node.path.join(' '));
        const imageCount = params.result.images?.length ?? 0;

        return {
            sourceUrl: params.sourceUrl,
            title,
            format: 'KNOWLEDGE_ARTICLE',
            language: this.languageFromLcid(params.location.lcid),
            categorySlug,
            crawlFilter: params.mode,
            contentHash: params.result.hash,
            metadata: {
                source: ALLPLAN_HELP_SOURCE,
                sourceName: params.sourceName,
                sourceType: 'knowledge_article',
                sourceUrl: params.sourceUrl,
                discoveredFrom: params.location.originalUrl,
                crawlFilter: params.mode,
                crawlerProvider: params.result.provider ?? 'basic',
                crawler: (params.result.metadata ?? {}) as Prisma.InputJsonObject,
                visualAssets: params.result.images?.slice(0, 24).map(image => ({
                    url: image.url,
                    alt: image.alt ?? null,
                    title: image.title ?? null,
                    caption: image.caption ?? null,
                    width: image.width ?? null,
                    height: image.height ?? null,
                    source: ALLPLAN_HELP_SOURCE,
                })) ?? [],
                reviewQuality: {
                    sourceType: 'allplan_help',
                    contentLength: params.result.content.length,
                    imageCount,
                    readyForImport: params.result.content.length >= 120,
                    reasonCode: params.result.content.length >= 120 ? 'ARTICLE_CONTENT_READY' : 'CONTENT_TOO_SHORT',
                },
                allplanHelp: {
                    version: params.location.version,
                    lcid: params.location.lcid,
                    language: this.languageFromLcid(params.location.lcid),
                    book: params.location.book,
                    topicFile: params.node.topicFile,
                    tocNodeId: params.node.id ?? null,
                    tocObjectId: params.node.objectId ?? null,
                    tocNode: params.node.node ?? null,
                    tocPath: params.node.path,
                    hidden: params.node.hidden,
                    canonicalTopicUrl: params.sourceUrl,
                },
            },
        };
    }

    private async upsertCandidate(candidate: DiscoveredAllplanHelpCandidate): Promise<{ inserted: boolean }> {
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
                ALLPLAN_HELP_SOURCE,
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
            ALLPLAN_HELP_SOURCE,
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

    private async findDuplicateKnowledgeSource(sourceUrl: string, contentHash?: string | null) {
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

    private toTopicUrl(baseUrl: string, topicFile: string): string | null {
        const normalized = this.toTopicFile(topicFile);
        if (!normalized) return null;
        return new URL(normalized, baseUrl).toString();
    }

    private toTopicFile(value: string): string | null {
        const clean = String(value ?? '').trim().replace(/^#/, '');
        if (!this.isTopicFile(clean)) return null;
        return clean;
    }

    private topicFileFromUrl(value: string): string {
        return new URL(value).pathname.split('/').filter(Boolean).pop() ?? value;
    }

    private isTopicFile(value: string): boolean {
        return /^[A-Za-z0-9._-]+\.html?$/i.test(value) && !/^toc\.html?$/i.test(value);
    }

    private titleFromTopicFile(value: string): string {
        return this.cleanTitle(value.replace(/\.(html?|xhtml)$/i, '').replace(/[-_]+/g, ' '));
    }

    private dedupeByUrl(candidates: DiscoveredAllplanHelpCandidate[]): DiscoveredAllplanHelpCandidate[] {
        const seen = new Set<string>();
        return candidates.filter(candidate => {
            if (seen.has(candidate.sourceUrl)) return false;
            seen.add(candidate.sourceUrl);
            return true;
        });
    }

    private cleanTitle(value: string): string {
        return String(value ?? '').replace(/\s+/g, ' ').trim();
    }

    private languageFromLcid(lcid: string): string {
        const map: Record<string, string> = {
            '1031': 'de',
            '1033': 'en',
            '1034': 'es',
            '1036': 'fr',
            '1040': 'it',
            '1043': 'nl',
            '1029': 'cs',
            '1051': 'sk',
            '1055': 'tr',
        };
        return map[lcid] ?? 'en';
    }

    private inferCategorySlug(text: string): string {
        const normalized = text.toLowerCase();
        if (/(license|licence|lizenz|codemeter|product key|activation|lisans)/.test(normalized)) {
            return 'license-server-codemeter';
        }
        if (/(install|setup|installation|upgrade|update|kurulum)/.test(normalized)) {
            return 'installation-setup';
        }
        if (/(workgroup|network|server|checkout|home.office|vpn)/.test(normalized)) {
            return 'network-workgroup';
        }
        if (/(ifc|dwg|export|import|exchange)/.test(normalized)) {
            return 'export-import-ifc-dwg';
        }
        if (/(reinforcement|fixture|precast|engineering|donatı|armatür)/.test(normalized)) {
            return 'engineering-modeling';
        }
        return 'allplan-help';
    }
}
