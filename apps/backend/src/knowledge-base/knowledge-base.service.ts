import {
    Injectable,
    NotFoundException,
    BadRequestException,
    Logger,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { EmbeddingService } from '../ai/embedding.service';
import { CreateArticleDto, UpdateArticleDto, ReviewArticleDto } from './dto/article.dto';

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
    }) {
        const { status, categoryId, search, page = 1, limit = 20 } = params;

        const [data, total] = await Promise.all([
            this.prisma.knowledgeArticle.findMany({
                where: {
                    ...(status && { status }),
                    ...(categoryId && { categoryId }),
                    ...(search && {
                        OR: [
                            { title: { contains: search, mode: 'insensitive' } },
                            { tags: { has: search } },
                        ],
                    }),
                },
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
                where: {
                    ...(status && { status }),
                    ...(categoryId && { categoryId }),
                },
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
    async submitForReview(id: string, _userId?: string) {
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

        if (article.status !== 'REVIEW') {
            throw new BadRequestException('Article is not in REVIEW status');
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
                    .indexArticle(id, latestVersion.id, latestVersion.content)
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
    async keywordSearch(query: string, limit = 10) {
        return this.prisma.knowledgeArticle.findMany({
            where: {
                status: 'PUBLISHED',
                OR: [
                    { title: { contains: query, mode: 'insensitive' } },
                    { tags: { has: query } },
                ],
            },
            include: {
                versions: { orderBy: { version: 'desc' }, take: 1 },
            },
            take: limit,
        });
    }
}
