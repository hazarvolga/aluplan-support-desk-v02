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
        this.logger.log(`🔍 Diagnosing query: "${query}" (History Size: ${history?.length || 0})`);

        let matchedProduct: any = null;
        let products: any[] = [];

        // 1. Fetch products
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

            if (!matchedProduct && (productMatch || categoryMatchCount > 0)) {
                if (!matchedProduct || productMatch) {
                    matchedProduct = product;
                }
            }
        }

        // 3. Detect Problem Shift
        let isProblemShift = false;
        if (history && history.length > 0 && detectedKeywords.length > 0) {
            const historyText = history.join(' ').toLowerCase();
            // Check if current keywords were present in history
            const contextOverlap = detectedKeywords.filter(k => historyText.includes(k.toLowerCase()));

            // If we have strong current keywords but NONE were in history, it's likely a shift
            if (contextOverlap.length === 0 && detectedKeywords.length >= 2) {
                isProblemShift = true;
                this.logger.warn(`🚀 Problem shift detected! New keywords: [${detectedKeywords.join(', ')}] not found in history.`);
            }
        }

        // 4. Generate "Suggested Causes"
        const suggestedCauses = await this.mapCauses(matchedProduct, lowerQuery);

        return {
            productId: matchedProduct?.id || null,
            productName: matchedProduct?.name || 'GENERIC',
            categoryNames: [...new Set(matchedCategories)],
            matchedKeywords: [...new Set(detectedKeywords)],
            suggestedCauses,
            isProblemShift
        };
    }

    private async mapCauses(product: any, lowerQuery: string) {
        const causes: Array<{ id: string; title: string; why: string; priority: number }> = [];
        const isGeneric = !product || product.name === 'GENERIC';

        // 1. Critical Failures (requires stronger signals for generic)
        if (lowerQuery.includes('çökme') || lowerQuery.includes('crash') ||
            (!isGeneric && (lowerQuery.includes('açılmıyor') || lowerQuery.includes('donuyor')))) {
            causes.push({
                id: 'startup_failure',
                title: 'Başlangıç Hatası / Çökme',
                why: 'Eksik bağımlılıklar, ekran kartı sürücüsü uyumsuzluğu veya kurulum dosyası hasarı.',
                priority: 1
            });
        }

        // 2. Licensing (Universal)
        if (lowerQuery.includes('lisans') || lowerQuery.includes('licens') || lowerQuery.includes('aktivasyon')) {
            causes.push({
                id: 'licensing_issue',
                title: 'Lisans Aktivasyon Sorunu',
                why: 'Lisans servisleri (Wibu/Dongle) durmuş olabilir veya lisans süresi dolmuş olabilir.',
                priority: 1
            });
        }

        // 3. Installation
        if (lowerQuery.includes('kurulum') || lowerQuery.includes('install') ||
            (!isGeneric && (lowerQuery.includes('yükle') || lowerQuery.includes('setup')))) {
            causes.push({
                id: 'installation_midway_failure',
                title: 'Kurulum / Yükleme Hatası',
                why: 'Kurulum paketi eksik olabilir veya yönetici izinleri yetersizdir.',
                priority: 1
            });
        }

        // 4. Product specific patterns
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

        return causes;
    }
}
