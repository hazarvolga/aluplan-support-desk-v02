import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

export interface DiagnosisResult {
    productId: string | null;
    productName: string | null;
    categoryNames: string[];
    matchedKeywords: string[];
    suggestedCauses: Array<{ id: string; title: string; why: string; priority: number }>;
    isProblemShift?: boolean;
}

@Injectable()
export class AiDiagnosisService {
    private readonly logger = new Logger(AiDiagnosisService.name);

    constructor(private readonly prisma: PrismaService) { }

    /**
     * Performs a technical diagnosis analysis based on user query and system metadata.
     */
    async analyze(query: string, history?: string[], productId?: string | null): Promise<DiagnosisResult> {
        this.logger.log(`🔍 Diagnosing query: "${query}" (Product ID Filter: ${productId || 'None'})`);

        let matchedProduct: any = null;
        let products: any[] = [];

        // 1. Fetch products (either one specific or all for heuristic matching)
        if (productId && productId !== 'general') {
            const p = await this.prisma.product.findUnique({
                where: { id: productId },
                include: { categories: { where: { isActive: true } } },
            });
            if (p) {
                matchedProduct = p;
                products = [p];
            }
        }

        if (!matchedProduct) {
            products = await this.prisma.product.findMany({
                where: { isActive: true },
                include: { categories: { where: { isActive: true } } },
            });
        }

        const matchedCategories: string[] = [];
        const detectedKeywords: string[] = [];
        const lowerQuery = query.toLowerCase();

        // 2. keyword-based classification
        for (const product of products) {
            const productMatch = lowerQuery.includes(product.name.toLowerCase());
            let categoryMatchCount = 0;

            for (const cat of product.categories) {
                const overlappingKeywords = cat.keywords.filter((k: string) => lowerQuery.includes(k.toLowerCase()));
                if (overlappingKeywords.length > 0) {
                    matchedCategories.push(cat.name);
                    detectedKeywords.push(...overlappingKeywords);
                    categoryMatchCount++;
                }
            }

            // Only perform primary product matching if we haven't already fixed it via productId
            if (!matchedProduct && (productMatch || categoryMatchCount > 0)) {
                // Heuristic: Prefer the product that has explicit name match or most category keyword matches
                if (!matchedProduct || productMatch) {
                    matchedProduct = product;
                }
            }
        }

        // 3. Generate "Suggested Causes" based on patterns
        // Note: In a production scale, this could be a dynamic lookup in a "DiagnosticLibrary" table.
        // For now, we derive it from the matched product and common technical keywords.
        const suggestedCauses = await this.mapCauses(matchedProduct, lowerQuery);

        return {
            productId: matchedProduct?.id || null,
            productName: matchedProduct?.name || 'GENERIC',
            categoryNames: [...new Set(matchedCategories)],
            matchedKeywords: [...new Set(detectedKeywords)],
            suggestedCauses,
        };
    }

    private async mapCauses(product: any, lowerQuery: string) {
        const causes: Array<{ id: string; title: string; why: string; priority: number }> = [];

        // Generic patterns
        if (lowerQuery.includes('açılmıyor') || lowerQuery.includes('crash') || lowerQuery.includes('donuyor')) {
            causes.push({
                id: 'startup_failure',
                title: 'Başlangıç Hatası / Çökme',
                why: 'Eksik bağımlılıklar, ekran kartı sürücüsü uyumsuzluğu veya kurulum dosyası hasarı.',
                priority: 1
            });
        }

        if (lowerQuery.includes('lisans') || lowerQuery.includes('licens')) {
            causes.push({
                id: 'licensing_issue',
                title: 'Lisans Aktivasyon Sorunu',
                why: 'Wibu Codemeter servisi durmuş olabilir veya lisans süresi dolmuş olabilir.',
                priority: 1
            });
        }

        if (lowerQuery.includes('kur') || lowerQuery.includes('install') || lowerQuery.includes('setup') || lowerQuery.includes('yükle') || lowerQuery.includes('yarıda')) {
            causes.push({
                id: 'installation_midway_failure',
                title: 'Kurulum / Yükleme Hatası',
                why: 'Kurulum paketi eksik inmiş olabilir, yönetici izinleri yetersizdir veya disk alanı dolmuştur.',
                priority: 1
            });
        }

        // Product specific patterns (e.g. SCIA Engineer context from user's sample)
        if (product?.name === 'SCIA Engineer') {
            if (lowerQuery.includes('fem') || lowerQuery.includes('mesh')) {
                causes.push({
                    id: 'fem_mesh_instability',
                    title: 'FEM Mesh Kararsızlığı',
                    why: 'Yanlış mesnet koşulları veya düğüm noktası çakışması.',
                    priority: 2
                });
            }
        }

        // Dynamic fallback: If we found articles with specific tags, we could inject them as causes too
        // For brevity in first version, we keep these core patterns.

        return causes;
    }
}
