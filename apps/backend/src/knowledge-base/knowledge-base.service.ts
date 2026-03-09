import {
    Injectable,
    NotFoundException,
    BadRequestException,
    Logger,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { EmbeddingService } from '../ai/embedding.service';
import { AiService } from '../ai/ai.service';
import { CreateArticleDto, UpdateArticleDto, ReviewArticleDto, SubmitFeedbackDto } from './dto/article.dto';

// ArticleStatus from schema: DRAFT | REVIEW | PUBLISHED | ARCHIVED
// We use string literals to avoid Prisma client import resolution order issues.
// The real Prisma enum only enforces at the DB level.
type ArtStatus = 'DRAFT' | 'REVIEW' | 'PUBLISHED' | 'ARCHIVED';

function makeSlug(title: string): string {
    return title.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '') + '-' + Date.now();
}

@Injectable()
export class KnowledgeBaseService {
    private readonly logger = new Logger(KnowledgeBaseService.name);

    constructor(
        private readonly prisma: PrismaService,
        private readonly embeddingService: EmbeddingService,
        private readonly aiService: AiService,
    ) { }

    // ─── CATEGORIES ─────────────────────────────────────────
    async listCategories() {
        return this.prisma.category.findMany({
            where: { parentId: null },
            include: {
                children: true,
                _count: { select: { articles: true } },
            },
            orderBy: { name: 'asc' },
        });
    }

    async createCategory(data: { name: string; parentId?: string }) {
        const slug = makeSlug(data.name);
        return this.prisma.category.create({ data: { ...data, slug } });
    }

    // ─── ARTICLES ───────────────────────────────────────────
    async findAll(params: {
        status?: ArtStatus;
        categoryId?: string;
        search?: string;
        page?: number;
        limit?: number;
        includeInternal?: boolean;
    }) {
        const { status, categoryId, search, page = 1, limit = 20, includeInternal = false } = params;

        const where: any = {
            // Exclude bulk-imported reference documents (seeded from Bilgi Bankası).
            // These are AI retrieval sources, not admin-authored KB articles.
            isAutoImported: false,
            ...(status && { status }),
            ...(categoryId && { categoryId }),
            ...(search && {
                OR: [
                    { title: { contains: search, mode: 'insensitive' } },
                    { tags: { has: search } },
                ],
            }),
        };

        if (!includeInternal) {
            where.isInternal = false;
        }

        const [data, total] = await Promise.all([
            this.prisma.knowledgeArticle.findMany({
                where,
                include: {
                    creator: { select: { id: true, fullName: true, avatarUrl: true } },
                    category: { select: { id: true, name: true } },
                    _count: { select: { versions: true } },
                },
                orderBy: { updatedAt: 'desc' },
                skip: (page - 1) * limit,
                take: limit,
            }),
            this.prisma.knowledgeArticle.count({
                where,
            }),
        ]);

        return { data, total, page, limit, pages: Math.ceil(total / limit) };
    }

    async findOne(id: string) {
        const article = await this.prisma.knowledgeArticle.findUnique({
            where: { id },
            include: {
                creator: { select: { id: true, fullName: true, avatarUrl: true } },
                category: true,
                versions: { orderBy: { version: 'desc' } },
            },
        });
        if (!article) throw new NotFoundException('Article not found');
        return article;
    }

    // ─── CREATE ─────────────────────────────────────────────
    async create(dto: CreateArticleDto, createdBy: string) {
        const plainText = dto.content.replace(/[#*`_~>\[\]()-]/g, ' ').replace(/\s+/g, ' ').trim();
        const slug = makeSlug(dto.title);

        const article = await this.prisma.knowledgeArticle.create({
            data: {
                title: dto.title,
                slug,
                tags: dto.tags ?? [],
                language: dto.language ?? 'tr',
                status: 'DRAFT',
                isInternal: dto.isInternal ?? false,
                createdBy,
                categoryId: dto.categoryId,
                versions: {
                    create: {
                        version: 1,
                        title: dto.title,
                        content: dto.content,
                        contentPlain: plainText,
                        changeSummary: 'İlk versiyon',
                        createdBy,
                    },
                },
            },
            include: { versions: true },
        });

        this.logger.log(`📝 Article created: "${dto.title}"`);
        return article;
    }

    // ─── UPDATE (creates new version) ───────────────────────
    async update(id: string, dto: UpdateArticleDto, userId: string) {
        const article = await this.findOne(id);

        if (dto.title || dto.categoryId || dto.tags) {
            await this.prisma.knowledgeArticle.update({
                where: { id },
                data: {
                    ...(dto.title && { title: dto.title }),
                    ...(dto.categoryId && { categoryId: dto.categoryId }),
                    ...(dto.tags && { tags: dto.tags }),
                    ...(dto.isInternal !== undefined && { isInternal: dto.isInternal }),
                    ...(article.status === 'PUBLISHED' && { status: 'DRAFT' }),
                },
            });
        }

        if (dto.content) {
            const latestVersion = article.versions[0];
            const nextNum = (latestVersion?.version ?? 0) + 1;
            const plain = dto.content.replace(/[#*`_~>\[\]()-]/g, ' ').replace(/\s+/g, ' ').trim();

            await this.prisma.knowledgeArticleVersion.create({
                data: {
                    articleId: id,
                    version: nextNum,
                    title: dto.title ?? article.title,
                    content: dto.content,
                    contentPlain: plain,
                    changeSummary: dto.changeSummary ?? `v${nextNum}`,
                    createdBy: userId,
                },
            });
        }

        return this.findOne(id);
    }

    // ─── SUBMIT FOR REVIEW ──────────────────────────────────
    async submitForReview(id: string) {
        const article = await this.findOne(id);

        if (article.status !== 'DRAFT') {
            throw new BadRequestException(`Article is ${article.status}, only DRAFT can be submitted`);
        }

        return this.prisma.knowledgeArticle.update({
            where: { id },
            data: { status: 'REVIEW' },
        });
    }

    // ─── REVIEW (approve / reject) ──────────────────────────
    async review(id: string, dto: ReviewArticleDto, reviewerId: string) {
        const article = await this.findOne(id);

        // Provide warning but do not strictly prevent admins from publishing directly from DRAFT
        if (article.status !== 'REVIEW' && article.status !== 'DRAFT') {
            this.logger.warn(`Article ${id} is being published from status ${article.status}`);
        }

        if (dto.approved) {
            const updated = await this.prisma.knowledgeArticle.update({
                where: { id },
                data: {
                    status: 'PUBLISHED',
                    approvedAt: new Date(),
                    approvedBy: reviewerId,
                    approved: true,
                },
                include: { versions: { orderBy: { version: 'desc' }, take: 1 } },
            });

            const latestVersion = updated.versions[0];
            if (latestVersion) {
                this.embeddingService
                    .indexArticle(id, latestVersion.id, updated.title, latestVersion.content)
                    .catch((err) => this.logger.error('Embedding index failed:', err));
            }

            this.logger.log(`✅ Article "${article.title}" published`);
            return updated;
        } else {
            return this.prisma.knowledgeArticle.update({
                where: { id },
                data: { status: 'DRAFT' },
            });
        }
    }

    // ─── ARCHIVE ────────────────────────────────────────────
    async archive(id: string) {
        return this.prisma.knowledgeArticle.update({
            where: { id },
            data: { status: 'ARCHIVED' },
        });
    }

    // ─── KEYWORD SEARCH ─────────────────────────────────────
    async keywordSearch(query: string, limit = 10, includeInternal = false) {
        const where: any = {
            status: 'PUBLISHED',
            OR: [
                { title: { contains: query, mode: 'insensitive' } },
                { tags: { has: query } },
            ],
        };

        if (!includeInternal) {
            where.isInternal = false;
        }

        return this.prisma.knowledgeArticle.findMany({
            where,
            include: {
                versions: { orderBy: { version: 'desc' }, take: 1 },
            },
            take: limit,
        });
    }
    // ─── ANALYTICS & FEEDBACK ─────────────────────────────
    async incrementViewCount(id: string) {
        return this.prisma.knowledgeArticle.update({
            where: { id },
            data: { viewCount: { increment: 1 } },
        });
    }

    async submitFeedback(id: string, dto: SubmitFeedbackDto, userId?: string) {
        await this.findOne(id); // Verify existence

        return (this.prisma as any).articleFeedback.create({
            data: {
                articleId: id,
                userId,
                isHelpful: dto.isHelpful,
                comment: dto.comment,
            },
        });
    }

    async getAnalytics(id: string) {
        const [feedbackStats, views] = await Promise.all([
            (this.prisma as any).articleFeedback.groupBy({
                by: ['isHelpful'],
                where: { articleId: id },
                _count: true,
            }),
            this.prisma.knowledgeArticle.findUnique({
                where: { id },
                select: { viewCount: true },
            }),
        ]);

        const stats = feedbackStats as { isHelpful: boolean; _count: number }[];
        const helpfulCount = stats.find((f) => f.isHelpful)?._count ?? 0;
        const unhelpfulCount = stats.find((f) => !f.isHelpful)?._count ?? 0;

        return {
            views: views?.viewCount ?? 0,
            helpfulCount,
            unhelpfulCount,
            score: helpfulCount + unhelpfulCount > 0
                ? (helpfulCount / (helpfulCount + unhelpfulCount)) * 100
                : 100,
        };
    }

    async getGlobalAnalytics() {
        const [mostViewed, feedBackStats] = await Promise.all([
            this.prisma.knowledgeArticle.findMany({
                orderBy: { viewCount: 'desc' },
                take: 5,
                select: { id: true, title: true, viewCount: true, status: true },
            }),
            (this.prisma as any).articleFeedback.groupBy({
                by: ['articleId', 'isHelpful'],
                _count: true,
            }),
        ]);

        // Process feedback stats into a usable map
        const performanceMap: Record<string, { helpful: number; unhelpful: number }> = {};
        feedBackStats.forEach((stat: any) => {
            if (!performanceMap[stat.articleId]) performanceMap[stat.articleId] = { helpful: 0, unhelpful: 0 };
            if (stat.isHelpful) performanceMap[stat.articleId].helpful = stat._count;
            else performanceMap[stat.articleId].unhelpful = stat._count;
        });

        return {
            mostViewed,
            performance: Object.entries(performanceMap)
                .map(([id, stats]) => ({
                    id,
                    ...stats,
                    total: stats.helpful + stats.unhelpful,
                    score: (stats.helpful / (stats.helpful + stats.unhelpful)) * 100,
                }))
                .filter(p => p.total > 0)
                .sort((a, b) => a.score - b.score) // Show least helpful first
                .slice(0, 5),
        };
    }

    // ─── VERSION COMPARISON ───────────────────────────────
    async compareVersions(articleId: string, v1: number, v2: number) {
        const versions = await this.prisma.knowledgeArticleVersion.findMany({
            where: {
                articleId,
                version: { in: [v1, v2] },
            },
            orderBy: { version: 'asc' },
        });

        if (versions.length < 2) {
            throw new BadRequestException('Need two versions to compare');
        }

        const older = versions[0];
        const newer = versions[1];

        return {
            older: { version: older.version, title: older.title, content: older.content },
            newer: { version: newer.version, title: newer.title, content: newer.content },
        };
    }

    async suggestArticleCategory(title: string, content: string) {
        const categories = await this.prisma.category.findMany({ select: { name: true } });
        const catNames = categories.map((c) => c.name);

        if (catNames.length === 0) return 'GENEL';

        return this.aiService.suggestCategory(title, content, catNames);
    }
}
