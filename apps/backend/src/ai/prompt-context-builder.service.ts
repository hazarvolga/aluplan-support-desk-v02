import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { RAG_CONFIG } from '../config/rag.config';
import { DiagnosisResult } from './ai-diagnosis.service';

export interface ContextOptions {
    userId?: string;
    userQuery: string;
    kbContent: string;
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
        const { userId, userQuery, kbContent, hotinfoSnapshot, messages, diagnosis } = options;
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
                        const hotinfoContent = `[MÜŞTERİ SİSTEM BİLGİLERİ (HOTINFO)]
- Allplan Sürümü: ${h.allplanVersion || 'Bilinmiyor'}
- İşletim Sistemi: ${h.osVersion || 'Bilinmiyor'}
- İşlemci (CPU): ${h.cpu || 'Bilinmiyor'}
- Ekran Kartı (GPU): ${h.gpu || 'Bilinmiyor'} (Sürücü: ${h.gpuDriverVersion || 'Bilinmiyor'})
- RAM: ${h.ram || 'Bilinmiyor'}
- Ekran Çözünürlüğü: ${h.screenResolution || 'Bilinmiyor'}
`;
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

    /**
     * Assemble context sections respecting the total character budget.
     * Higher-priority sections are included first; lower-priority ones are truncated or dropped.
     */
    private assembleWithBudget(sections: ContextSection[]): string {
        const maxChars = RAG_CONFIG.CONTEXT.MAX_CONTEXT_CHARS;

        // Sort by priority DESC (highest first)
        const sorted = [...sections].sort((a, b) => b.priority - a.priority);

        let totalChars = 0;
        const included: string[] = [];

        for (const section of sorted) {
            const remaining = maxChars - totalChars;
            if (remaining <= 0) {
                this.logger.warn(`⚠️ Context budget exhausted. Dropping section: ${section.name} (priority=${section.priority})`);
                break;
            }

            if (section.content.length <= remaining) {
                included.push(section.content);
                totalChars += section.content.length;
            } else {
                // Truncate this section to fit remaining budget
                const truncated = section.content.substring(0, remaining - 50) + '\n... [truncated due to context budget]\n';
                included.push(truncated);
                totalChars += truncated.length;
                this.logger.warn(`⚠️ Truncated section: ${section.name} (${section.content.length} → ${truncated.length} chars)`);
                break;
            }
        }

        this.logger.debug(`📊 Context assembled: ${included.length}/${sections.length} sections, ${totalChars}/${maxChars} chars`);
        return included.join('\n');
    }
}
