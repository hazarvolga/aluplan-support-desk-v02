import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { RAG_CONFIG } from '../config/rag.config';
import { DiagnosisResult } from './ai-diagnosis.service';

export interface ContextOptions {
    userId?: string;
    userQuery: string;
    kbContent: string;
    visualEvidence?: Array<{
        url: string;
        alt?: string;
        caption?: string;
        summary: string;
        sourceTitle: string;
        sourceId: string;
    }>;
    hotinfoSnapshot?: any;
    skipHotinfoProfile?: boolean;
    messages?: Array<{ role: string; content: string }>;
    diagnosis?: DiagnosisResult;
}

interface ContextSection {
    name: string;
    priority: number;
    content: string;
}

@Injectable()
export class PromptContextBuilderService {
    private readonly logger = new Logger(PromptContextBuilderService.name);

    constructor(private readonly prisma: PrismaService) { }

    async buildContext(options: ContextOptions): Promise<string> {
        const { userId, userQuery, kbContent, visualEvidence, hotinfoSnapshot, messages, diagnosis } = options;
        const sections: ContextSection[] = [];
        const P = RAG_CONFIG.CONTEXT.PRIORITIES;

        // 0. Approved Knowledge Source (most critical — placed first for LLM attention)
        if (kbContent && kbContent.trim()) {
            sections.push({
                name: 'APPROVED_KNOWLEDGE_SOURCE',
                priority: P.APPROVED_KNOWLEDGE_SOURCE,
                content: `[APPROVED KNOWLEDGE SOURCE]\n${kbContent}\n`,
            });
        }

        if (visualEvidence && visualEvidence.length > 0) {
            const visualContent = visualEvidence
                .slice(0, 4)
                .map((visual, index) => [
                    `${index + 1}. Source: ${visual.sourceTitle}`,
                    `   Image URL: ${visual.url}`,
                    visual.caption ? `   Caption: ${visual.caption}` : null,
                    visual.alt ? `   Alt: ${visual.alt}` : null,
                    `   Visual Summary: ${visual.summary}`,
                ].filter(Boolean).join('\n'))
                .join('\n\n');

            sections.push({
                name: 'VISUAL_EVIDENCE',
                priority: P.APPROVED_KNOWLEDGE_SOURCE - 0.5,
                content: [
                    '[VISUAL EVIDENCE FROM APPROVED SOURCES]',
                    'Use these source image summaries when they directly support the answer. Do not invent UI details that are not described here.',
                    visualContent,
                ].join('\n'),
            });
        }

        // 1. User Profile & Preferences & Hotinfo
        if (userId) {
            const user = await this.prisma.user.findUnique({
                where: { id: userId },
                include: { customerProfile: true }
            });
            if (user) {
                let profileContent = `[1. Kullanıcı Profili]\nAd: ${user.fullName}\nEmail: ${user.email}\n`;
                if (user.customerProfile) {
                    profileContent += `Firma: ${user.customerProfile.companyName || 'Bilinmiyor'}\nSektör: ${user.customerProfile.industry || 'Bilinmiyor'}\n`;
                }
                sections.push({ name: 'USER_PROFILE', priority: P.USER_PROFILE, content: profileContent });

                // Hotinfo
                if (!options.skipHotinfoProfile) {
                    const h = hotinfoSnapshot || user?.customerProfile?.hotinfoData;
                    if (h) {
                        const licenseContext = this.buildLicenseContext(h, userQuery);
                        let hotinfoContent = `[MÜŞTERİ SİSTEM BİLGİLERİ (HOTINFO)]
- Allplan Sürümü: ${h.allplanVersion || 'Bilinmiyor'} (Build: ${h.allplanBuildId || 'Bilinmiyor'})
- İşletim Sistemi: ${h.osVersion || 'Bilinmiyor'}
- İşlemci (CPU): ${h.cpu || 'Bilinmiyor'}
- Ekran Kartı (GPU): ${h.gpu || 'Bilinmiyor'} (Sürücü: ${h.gpuDriverVersion || 'Bilinmiyor'}, VRAM: ${h.vram || 'Bilinmiyor'})
- OpenGL: ${h.openglVersion || 'Bilinmiyor'}
- RAM: ${h.ram || 'Bilinmiyor'}
- Ekran Çözünürlüğü: ${h.screenResolution || 'Bilinmiyor'}
- ${licenseContext}
- Allplan Hotfix/Patch: ${h.allplanHotfix || 'Bilinmiyor'}
`;
                        if (h.graphicsCards && Array.isArray(h.graphicsCards) && h.graphicsCards.length > 0) {
                            hotinfoContent += `- Ekran Kartları Detayı:\n`;
                            h.graphicsCards.slice(0, 4).forEach((card: any, index: number) => {
                                hotinfoContent += `  ${index + 1}. ${card.name || 'Bilinmiyor'} | VRAM: ${card.vram || 'Bilinmiyor'} | RAM: ${card.ram || 'Bilinmiyor'} | Sürücü Tarihi: ${card.driverDate || 'Bilinmiyor'} | Sürücü Versiyonu: ${card.driverVersion || 'Bilinmiyor'} | Çözünürlük: ${card.resolution || h.screenResolution || 'Bilinmiyor'}\n`;
                            });
                        }
                        if (h.installedModules && h.installedModules.length > 0) {
                            hotinfoContent += `- Modüller/Worksets: ${h.installedModules.join(', ')}\n`;
                        }
                        if (h.drives && h.drives.length > 0) {
                            hotinfoContent += `- Diskler: ${h.drives.map((d: any) => `${d.root} (${d.free}/${d.total})`).join(', ')}\n`;
                        }
                        if (h.securityServices && h.securityServices.length > 0) {
                            hotinfoContent += `- Güvenlik/Antivirüs Servisleri: ${h.securityServices.join(', ')}\n`;
                        }
                        if (h.printers && h.printers.length > 0) {
                            hotinfoContent += `- Yazıcılar: ${h.printers.slice(0, 10).join(', ')}\n`;
                        }
                        if (h.defaultPrinter) {
                            hotinfoContent += `- Varsayılan Yazıcı: ${h.defaultPrinter}\n`;
                        }
                        if (h.registryPaths && Object.keys(h.registryPaths).length > 0) {
                            hotinfoContent += `- Kayıt Defteri Yolları: ${Object.entries(h.registryPaths).map(([k, v]) => `${k}=${v}`).join(' | ')}\n`;
                        }
                        if (h.conflictingProcesses && h.conflictingProcesses.length > 0) {
                            hotinfoContent += `- Olası Çakışmalar: ${h.conflictingProcesses.join(', ')}\n`;
                        }
                        if (h.errorTrace) {
                            const errorTrace = this.sanitizeHotinfoTrace(h.errorTrace, userQuery);
                            if (errorTrace) {
                                hotinfoContent += `- Hata Kaydı/Trace: ${errorTrace.length > 1200 ? `${errorTrace.slice(0, 1200)}... [trace truncated]` : errorTrace}\n`;
                            }
                        }
                        sections.push({ name: 'HOTINFO_DATA', priority: P.HOTINFO_DATA, content: hotinfoContent });
                    } else {
                        sections.push({
                            name: 'HOTINFO_DATA',
                            priority: P.HOTINFO_DATA,
                            content: `[MÜŞTERİ SİSTEM BİLGİLERİ (HOTINFO)]\nBulunamadı. (Kullanıcı henüz _hotinfo_.hxl dosyası yüklememiş)\n`,
                        });
                    }
                }

                // Previous Tickets
                if (user.customerProfile) {
                    const tickets = await this.prisma.ticket.findMany({
                        where: { userId: userId, status: { not: 'CLOSED' } },
                        orderBy: { createdAt: 'desc' },
                        take: 3
                    });
                    if (tickets.length > 0) {
                        let ticketContent = `[2. Açıktaki Destek Talepleri]\n`;
                        tickets.forEach(t => {
                            ticketContent += `- #${t.ticketNumber}: ${t.subject} (${t.status})\n`;
                        });
                        sections.push({ name: 'RECENT_TICKETS', priority: P.RECENT_TICKETS, content: ticketContent });
                    }
                }
            }
        }

        // 3. Active Query (The trigger for diagnosis)
        sections.push({
            name: 'USER_QUERY',
            priority: P.USER_QUERY,
            content: `[ACTIVE QUERY - LAST USER MESSAGE]\n${userQuery}\n`,
        });

        // 4. Message History (Past interactions)
        if (messages && messages.length > 0) {
            const pastMessages = messages.slice(0, -1);
            if (pastMessages.length > 0) {
                let historyPrefix = diagnosis?.isProblemShift
                    ? `### [📢 ÖNEMLİ: KONU DEĞİŞİKLİĞİ] - Aşağıdaki geçmiş mesajlar FARKLI bir konu ile ilgilidir ve teşhis için DİKKATE ALINMAMALIDIR.\n`
                    : '';

                const historyContent = `[CONVERSATION HISTORY - PAST MESSAGES]\n${historyPrefix}` +
                    pastMessages.map(m => `${m.role.toUpperCase()}: ${m.content}`).join('\n');
                sections.push({ name: 'MESSAGE_HISTORY', priority: P.RECENT_TICKETS + 5, content: historyContent });
            }
        }

        // 5. Technical Diagnosis (New Decision Layer)
        if (diagnosis) {
            let diagnosisContent = `[TECHNICAL DIAGNOSIS]\n`;
            diagnosisContent += `- Detected Product: ${diagnosis.productName}\n`;
            diagnosisContent += `- Matched Categories: ${diagnosis.categoryNames.join(', ') || 'N/A'}\n`;
            diagnosisContent += `- Detected Keywords: ${diagnosis.matchedKeywords.join(', ') || 'N/A'}\n`;
            diagnosisContent += `- Subject Change Detected (Problem Shift): ${diagnosis.isProblemShift ? 'YES' : 'NO'}\n`;

            if (diagnosis.suggestedCauses.length > 0) {
                diagnosisContent += `- Potential Root Causes:\n`;
                diagnosis.suggestedCauses.forEach(c => {
                    diagnosisContent += `  * ${c.title} (Likelihood Priority: ${c.priority}): ${c.why}\n`;
                });
            }
            sections.push({ name: 'DIAGNOSIS_ENGINE', priority: P.APPROVED_KNOWLEDGE_SOURCE - 1, content: diagnosisContent });
        }

        // 6. System Rules (Domain-Specific)
        const systemRulesLines = [
            'Yanıtların profesyonel, yapici ve cozum odakli olmalidir.',
            'Kurum kimligini (Aluplan Destek) koru.',
            'Bilgi kaynağında menu yolları veya buton adları varsa, bunları EKSİKSİZ ve KAYNAKTAKI DILDE ver.',
            'Çince, Japonca veya tanınmayan karakter kalıntılarını (Örn: 了解) yanıta EKLEME.',
            'KULLANICI SISTEM BILGILERI (Hotinfo) mevcutsa, yanıtı bu verilere göre özelleştir (Örn: Versiyon 2026 ise 2026 prosedürlerini ver, GPU eskiyse sürücü güncellemesi öner).',
            'Eğer bir ekran kartının VRAM değeri "Bilinmiyor (Kart Uyku Modunda)" ise donanım yetersizliği teşhisi koyma. Kullanıcıya, "Ekran kartınız uyku modunda olduğu için tam tarayamadım, Allplan açıkken Hotinfo dosyasını yeniden oluşturup gönderir misiniz?" şeklinde kibarca yönlendirme yap.',
            'Hotinfo içinde "Lisans dosyası okunamadı" veya _SEC.NSE gibi eski yerel lisans dosyası sinyalleri varsa bunu TEK BAŞINA lisans geçersizliği, deneme/öğrenci lisansı veya BIMPLUS/Share depolama limiti nedeni olarak kullanma. Modern Allplan Cloud/Wibu lisanslarında bu düşük güvenli legacy telemetridir; lisans kök nedeni ancak kullanıcı lisans soruyorsa ve bilgi kaynağı bunu destekliyorsa önerilebilir.',
            'Hata kodları yakalandığında "ERROR_LOG_PATTERNS" veri kümesine öncelik ver.',
            'Kaynaklarda tam metin eşleşmesi olmasa da en yakın prosedürü öner, tamamen cevapsız bırakma.'
        ];
        sections.push({
            name: 'SYSTEM_RULES',
            priority: P.SYSTEM_RULES,
            content: `[4. Sistem Kuralları]\n` + systemRulesLines.map(line => `- ${line}`).join('\n'),
        });

        // 5. Related Macros (limit exposure to conserve budget)
        const macros = await this.prisma.macro.findMany({ take: 2 });
        if (macros.length > 0) {
            let macroContent = `[5. İlgili Yanıt Şablonları (Macros)]\n`;
            macros.forEach(m => { macroContent += `- ${m.name}\n`; });
            sections.push({ name: 'MACROS', priority: P.MACROS, content: macroContent });
        }

        // BUILD with budget enforcement
        return this.assembleWithBudget(sections);
    }

    private buildLicenseContext(hotinfo: any, userQuery: string): string {
        const licenseType = hotinfo?.licenseType || hotinfo?.hotinfoLicense || hotinfo?.licenseNumber;
        if (!this.isLegacyUnreadableLicenseSignal(licenseType)) {
            return `Lisans Tipi: ${licenseType || 'Bilinmiyor'}`;
        }

        const asksLicense = this.isLicenseIntent(userQuery);
        return asksLicense
            ? 'Lisans Telemetrisi: Hotinfo eski yerel lisans dosyasını okuyamamış. Bu düşük güvenli bir sinyaldir; modern Cloud/Wibu lisanslarında lisans geçersizliği kanıtı değildir. Lisans yorumu yapmadan önce License Manager/BIMPLUS portalı gibi birincil lisans kaynağını doğrulat.'
            : 'Lisans Telemetrisi: Yerel lisans dosyası Hotinfo tarafından okunamadı; modern Cloud/Wibu lisanslarında bu tek başına lisans/abonelik veya BIMPLUS depolama limiti kanıtı değildir. Bu talepte kök neden olarak kullanma.';
    }

    private sanitizeHotinfoTrace(trace: unknown, userQuery: string): string {
        const value = String(trace || '');
        if (!value.trim()) return '';
        if (this.isLegacyUnreadableLicenseSignal(value) && !this.isLicenseIntent(userQuery)) {
            return 'Legacy yerel lisans trace sinyali mevcut; talep lisans odaklı olmadığı için kök neden olarak kullanılmamalı.';
        }
        return value;
    }

    private isLegacyUnreadableLicenseSignal(value: unknown): boolean {
        const normalized = String(value || '')
            .toLowerCase()
            .replace(/[ıİ]/g, 'i')
            .replace(/[şŞ]/g, 's')
            .replace(/[ğĞ]/g, 'g')
            .replace(/[üÜ]/g, 'u')
            .replace(/[öÖ]/g, 'o')
            .replace(/[çÇ]/g, 'c');

        return normalized.includes('lisans dosyasi okunamadi')
            || normalized.includes('_sec.nse')
            || /license file.*(unreadable|missing|not read|could not)/i.test(normalized);
    }

    private isLicenseIntent(query: string): boolean {
        const normalized = String(query || '')
            .toLowerCase()
            .replace(/[ıİ]/g, 'i')
            .replace(/[şŞ]/g, 's')
            .replace(/[ğĞ]/g, 'g')
            .replace(/[üÜ]/g, 'u')
            .replace(/[öÖ]/g, 'o')
            .replace(/[çÇ]/g, 'c');

        return /\b(lisans|license|codemeter|wibu|aktivasyon|activation|product key|license manager)\b/.test(normalized);
    }

    /**
     * Assemble context sections respecting both character and token budgets.
     * Higher-priority sections are included first; lower-priority ones are truncated or dropped.
     */
    private assembleWithBudget(sections: ContextSection[]): string {
        const C = RAG_CONFIG.CONTEXT;
        const maxTokens = C.MAX_CONTEXT_TOKENS;
        const CHARS_PER_TOKEN = 3.8; // Refined heuristic for technical multilingual text

        // Deduct reserves from the total budget
        const availableTokens = maxTokens - C.SYSTEM_RESERVE_TOKENS - C.HISTORY_RESERVE_TOKENS;

        // Sort by priority DESC (highest first)
        const sorted = [...sections].sort((a, b) => b.priority - a.priority);

        let currentTokens = 0;
        const included: string[] = [];

        for (const section of sorted) {
            const sectionTokens = Math.ceil(section.content.length / CHARS_PER_TOKEN);

            // Special handling for the Knowledge Source (can take its own specific max)
            if (section.name === 'APPROVED_KNOWLEDGE_SOURCE' && sectionTokens > C.DOCUMENT_CONTEXT_MAX_TOKENS) {
                const charsToKeep = Math.floor(C.DOCUMENT_CONTEXT_MAX_TOKENS * CHARS_PER_TOKEN);
                const truncatedKB = section.content.substring(0, charsToKeep) + '\n... [KB Truncated to fit Budget]\n';
                included.push(truncatedKB);
                currentTokens += C.DOCUMENT_CONTEXT_MAX_TOKENS;
                this.logger.debug(`✂️ KB Content capped at ${C.DOCUMENT_CONTEXT_MAX_TOKENS} tokens`);
                continue;
            }

            if (currentTokens + sectionTokens <= availableTokens) {
                included.push(section.content);
                currentTokens += sectionTokens;
            } else {
                // Section doesn't fit, try to partially include if it's high priority
                const remainingTokensForSection = availableTokens - currentTokens;

                if (remainingTokensForSection > 100 && section.priority >= 5) {
                    const charsToKeep = Math.floor(remainingTokensForSection * CHARS_PER_TOKEN) - 100;
                    const truncated = section.content.substring(0, charsToKeep) + '\n... [section truncated]\n';
                    included.push(truncated);
                    currentTokens += remainingTokensForSection;
                    this.logger.warn(`⚠️ High-priority section ${section.name} fits only partially. Truncated.`);
                } else {
                    this.logger.warn(`🚫 Section ${section.name} dropped due to token budget (${sectionTokens} tokens surplus)`);
                }

                // Once we start dropping or truncating significant portions, we stop to avoid context poisoning
                if (currentTokens >= availableTokens * 0.95) break;
            }
        }

        this.logger.log(`📊 Context Budget: ~${currentTokens}/${maxTokens} tokens used (${included.length}/${sections.length} sections)`);
        return included.join('\n');
    }
}
