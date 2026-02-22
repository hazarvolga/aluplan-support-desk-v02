import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AiService } from './ai.service';
import { EmbeddingService, SearchResult } from './embedding.service';
import { ConfigService } from '@nestjs/config';

// Confidence bands — LOW/HIGH/MEDIUM from schema, NO_MATCH is local
export type ConfidenceBand = 'HIGH' | 'MEDIUM' | 'LOW' | 'NO_MATCH';

export interface AiQueryResult {
    query: string;
    answer: string | null;
    confidence: ConfidenceBand;
    sources: Array<{ articleId: string; title: string; similarity: number }>;
    interactionId: string;
    suggestTicket: boolean;
}

const SYSTEM_PROMPT = `Sen Aluplan destek asistanısın. 
KURALLAR:
1. YALNIZCA sana verilen ONAYLI BİLGİ KAYNAĞINI kullan.
2. Bilgi kaynağında yanıt yoksa: "Bu konuda bilgim yok, destek talebi oluşturmanızı öneririm." de.
3. Kısa, net ve profesyonel yanıt ver.
4. Asla bilgi uydurma.`;

@Injectable()
export class AiQueryService {
    private readonly logger = new Logger(AiQueryService.name);
    private readonly highThreshold: number;
    private readonly mediumThreshold: number;

    constructor(
        private readonly prisma: PrismaService,
        private readonly ai: AiService,
        private readonly embeddingService: EmbeddingService,
        private readonly config: ConfigService,
    ) {
        this.highThreshold = parseFloat(config.get('SIMILARITY_THRESHOLD_HIGH', '0.90'));
        this.mediumThreshold = parseFloat(config.get('SIMILARITY_THRESHOLD_MEDIUM', '0.75'));
    }

    async query(userQuery: string, userId?: string | null): Promise<AiQueryResult> {
        // 1. Semantic search
        const results: SearchResult[] = await this.embeddingService.search(userQuery);

        // 2. Determine confidence band
        const topResult = results[0] ?? null;
        let confidence: ConfidenceBand = 'NO_MATCH';
        let answer: string | null = null;

        if (topResult) {
            if (topResult.similarity >= this.highThreshold) confidence = 'HIGH';
            else if (topResult.similarity >= this.mediumThreshold) confidence = 'MEDIUM';
            else confidence = 'LOW';
        }

        // 3. Reformat via AI for HIGH/MEDIUM matches
        if (topResult && (confidence === 'HIGH' || confidence === 'MEDIUM')) {
            const aiResult = await this.ai.reformat(SYSTEM_PROMPT, userQuery, topResult.content);
            answer = aiResult?.response ?? topResult.content;
        }

        // 4. Log interaction (NO_MATCH → null in DB, schema only has HIGH/MEDIUM/LOW)
        const interaction = await this.prisma.aiInteraction.create({
            data: {
                userId,
                userQuery,
                responseGenerated: answer,
                confidenceBand: confidence === 'NO_MATCH' ? null : (confidence as 'HIGH' | 'MEDIUM' | 'LOW'),
                matchedArticleId: topResult?.sourceType === 'ARTICLE' ? topResult.articleId : undefined,
                similarityScore: topResult ? topResult.similarity : undefined,
                autoAnswered: answer !== null,
            },
        });

        const suggestTicket = confidence === 'NO_MATCH' || confidence === 'LOW';

        this.logger.log(
            `🤖 AI Query: "${userQuery.slice(0, 60)}" → ${confidence} (${topResult?.similarity?.toFixed(3) ?? 'n/a'}) [Src: ${topResult?.sourceType}]`,
        );

        return {
            query: userQuery,
            answer,
            confidence,
            sources: results.slice(0, 3).map((r) => ({
                articleId: r.articleId,
                title: r.title,
                similarity: r.similarity,
            })),
            interactionId: interaction.id,
            suggestTicket,
        };
    }

    async submitFeedback(
        interactionId: string,
        userId: string,
        rating: number,
        comment?: string,
    ) {
        return this.prisma.interactionFeedback.create({
            data: {
                interactionId,
                userId,
                rating,
                comment,
                isHelpful: rating >= 4,
            },
        });
    }

    async getPendingForReview(limit = 50): Promise<any[]> {
        return this.prisma.aiInteraction.findMany({
            where: {
                confidenceBand: 'LOW',
            },
            include: {
                user: { select: { id: true, fullName: true } },
                feedbacks: { select: { rating: true, comment: true } },
            },
            orderBy: { createdAt: 'desc' },
            take: limit,
        });
    }

    async summarizeTicket(ticketId: string): Promise<string> {
        const ticket = await this.prisma.ticket.findUniqueOrThrow({
            where: { id: ticketId },
            include: {
                messages: {
                    orderBy: { createdAt: 'asc' },
                    include: { sender: { select: { fullName: true } } }
                }
            }
        });

        const conversation = ticket.messages.map(m =>
            `${m.sender?.fullName || 'Sistem'}: ${m.message}`
        ).join('\n');

        const prompt = `Görevin: Aşağıdaki destek talebi yazışmalarını ajanlar için kısa (en fazla 3-4 cümle) ve profesyonel şekilde özetlemek.
Konu: ${ticket.subject}
Yazışmalar:
${conversation}

Özetle ve en kritik noktaları belirt:`;

        const result = await this.ai.reformat('', 'Lütfen bu talebi özetle.', prompt);
        return result?.response ?? 'Özet oluşturulamadı.';
    }

    /**
     * Hibrit RAG Mimarisi
     * Analyzes incoming ticket subject/description against:
     * 1. Static Product Categories
     * 2. Past high-rated tickets (Option A + C implementation)
     */
    async smartTagTicket(productId: string, text: string, hotinfoContext?: any): Promise<{ tags: string[] }> {
        try {
            const product = await this.prisma.product.findUnique({
                where: { id: productId },
                include: { categories: true }
            });

            if (!product || product.categories.length === 0) return { tags: [] };

            const pastMatches = await this.embeddingService.searchTickets(text, 2);
            const kbMatches = await this.embeddingService.search(text, 2);
            let contextStr = '';

            if (pastMatches.length > 0) {
                contextStr += '\nBENZER GEÇMİŞ BİLETLER:\n' + pastMatches.map(m => `- ${m.subject}`).join('\n');
            }
            if (kbMatches.length > 0) {
                contextStr += '\nBİLGİ HAVUZU REFERANSLARI:\n' + kbMatches.map(m => `- ${m.title}`).join('\n');
            }

            if (hotinfoContext) {
                const h = hotinfoContext;
                contextStr += `\nMÜŞTERİ SİSTEM BİLGİLERİ (HOTINFO):`;
                contextStr += `\n- Allplan: ${h.allplanVersion}${h.allplanEdition ? ` (${h.allplanEdition})` : ''}${h.allplanHotfix ? ` Hotfix: ${h.allplanHotfix}` : ''}`;
                contextStr += `\n- OS: ${h.osVersion}`;
                contextStr += `\n- CPU: ${h.cpu}`;
                contextStr += `\n- GPU: ${h.gpu}${h.gpuDriverVersion ? ` (Driver: ${h.gpuDriverVersion})` : ''}${h.openglVersion ? ` OpenGL: ${h.openglVersion}` : ''}`;
                contextStr += `\n- RAM: ${h.ram}${h.vram ? ` | VRAM: ${h.vram}` : ''}`;
                if (h.screenResolution) contextStr += `\n- Çözünürlük: ${h.screenResolution}`;
                if (h.diskInfo) contextStr += `\n- Disk: ${h.diskInfo}`;
                if (h.licenseType) contextStr += `\n- Lisans: ${h.licenseType}`;
                if (h.dotnetVersion) contextStr += `\n- .NET: ${h.dotnetVersion}`;
                if (h.installedModules?.length) contextStr += `\n- Modüller: ${h.installedModules.join(', ')}`;
                contextStr += '\n';
            }

            const allowedTags = product.categories.map((c: { name: string }) => c.name);
            const prompt = `Görevin: Aşağıdaki Müşteri Destek talebini analiz edip, İZİN VERİLEN KATEGORİLER listesinden EN UYGUN OLANI seçmek.
İZİN VERİLEN KATEGORİLER:
${allowedTags.join(', ')}
${contextStr}
MÜŞTERİ TALEBİ:
${text.substring(0, 1000)}
SADECE en uygun kategori adını yaz. Hiçbiri uymuyorsa "GENEL" yaz.`;

            const result = await this.ai.reformat('Sen akıllı bir etiketleme asistanısın. Sadece tek kelime/kalıp dönersin.', 'Analiz et', prompt);

            if (result?.response) {
                const suggested = result.response.trim();
                const isValid = allowedTags.some((t: string) => t.toLowerCase() === suggested.toLowerCase());
                if (isValid) {
                    const originalTag = allowedTags.find((t: string) => t.toLowerCase() === suggested.toLowerCase());
                    return { tags: [originalTag!] };
                }
            }
            return { tags: [] };
        } catch (error) {
            this.logger.error(`Error in smartTagTicket: ${error.message}`);
            return { tags: [] };
        }
    }

    async logSearchInteraction(query: string, userId?: string, results: SearchResult[] = [], productId?: string | null) {
        const topResult = results[0] ?? null;

        return this.prisma.aiInteraction.create({
            data: {
                userId,
                productId,
                userQuery: query,
                confidenceBand: topResult ? topResult.confidence : null,
                matchedArticleId: topResult?.sourceType === 'ARTICLE' ? topResult.articleId : undefined,
                similarityScore: topResult ? topResult.similarity : undefined,
                autoAnswered: false, // This was just a search
                userContext: { type: 'WIZARD_SEARCH', resultCount: results.length }
            },
        });
    }
}
