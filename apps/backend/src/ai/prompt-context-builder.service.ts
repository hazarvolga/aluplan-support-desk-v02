import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

export interface ContextOptions {
    userId?: string;
    userQuery: string;
    kbContent: string;
    hotinfoSnapshot?: any;
    skipHotinfoProfile?: boolean;
}

@Injectable()
export class PromptContextBuilderService {
    constructor(private readonly prisma: PrismaService) { }

    async buildContext(options: ContextOptions): Promise<string> {
        const { userId, userQuery, kbContent, hotinfoSnapshot } = options;
        let context = '';

        // 0. Approved Knowledge Source (most critical — placed first for LLM attention)
        if (kbContent && kbContent.trim()) {
            context += `[APPROVED KNOWLEDGE SOURCE]\n${kbContent}\n\n`;
        }

        // 1. User Profile & Preferences & Hotinfo
        if (userId) {
            const user = await this.prisma.user.findUnique({
                where: { id: userId },
                include: { customerProfile: true }
            });
            if (user) {
                context += `[1. Kullanıcı Profili]\nAd: ${user.fullName}\nEmail: ${user.email}\n`;
                if (user.customerProfile) {
                    context += `Firma: ${user.customerProfile.companyName || 'Bilinmiyor'}\nSektör: ${user.customerProfile.industry || 'Bilinmiyor'}\n`;
                    if (!options.skipHotinfoProfile) {
                        const h = hotinfoSnapshot || user.customerProfile.hotinfoData;
                        if (h) {
                            context += `\n[MÜŞTERİ SİSTEM BİLGİLERİ (HOTINFO)]\n`;
                            context += `- Allplan Sürümü: ${h.allplanVersion || 'Bilinmiyor'}\n`;
                            context += `- İşletim Sistemi: ${h.osVersion || 'Bilinmiyor'}\n`;
                            context += `- İşlemci (CPU): ${h.cpu || 'Bilinmiyor'}\n`;
                            context += `- Ekran Kartı (GPU): ${h.gpu || 'Bilinmiyor'} (Sürücü: ${h.gpuDriverVersion || 'Bilinmiyor'})\n`;
                            context += `- RAM: ${h.ram || 'Bilinmiyor'}\n`;
                            context += `- Ekran Çözünürlüğü: ${h.screenResolution || 'Bilinmiyor'}\n\n`;
                        } else {
                            context += `\n[MÜŞTERİ SİSTEM BİLGİLERİ (HOTINFO)]\nBulunamadı. (Kullanıcı henüz _hotinfo_.hxl dosyası yüklememiş)\n\n`;
                        }
                    }
                    context += '\n';

                    // 2. Previous Tickets
                    const tickets = await this.prisma.ticket.findMany({
                        where: { userId: userId, status: { not: 'CLOSED' } },
                        orderBy: { createdAt: 'desc' },
                        take: 3
                    });
                    if (tickets.length > 0) {
                        context += `[2. Açıktaki Destek Talepleri]\n`;
                        tickets.forEach(t => {
                            context += `- #${t.ticketNumber}: ${t.subject} (${t.status})\n`;
                        });
                        context += '\n';
                    }
                }
            }

            // 3. Current Query
            context += `[3. Mevcut Sorgu]\n${userQuery}\n\n`;

            // 4. System Rules
            context += `[4. Sistem Kuralları]\n`;
            context += `- Yanıtların profesyonel, yapıcı ve çözüm odaklı olmalıdır.\n`;
            context += `- Kurum kimliğini (Aluplan Destek) koru.\n`;
            context += `- Bilmediğin konularda uydurma, destek talebi oluşturmalarını öner.\n\n`;

            // 5. Related Macros
            // Ideally mapped through embeddings; for now, simple broad keyword search.
            const macros = await this.prisma.macro.findMany({
                take: 2 // limiting macro count
            });
            if (macros.length > 0) {
                context += `[5. İlgili Yanıt Şablonları (Macros)]\n`;
                macros.forEach(m => {
                    context += `- ${m.name}\n`;
                });
                context += '\n';
            }

            // 6. Recent Actions / Telemetry
            // Could integrate auth logs or frontend telemetry here.
            context += `[6. Son Kullanıcı Eylemleri]\n- Kullanıcı /api/ai/query uç noktasından bir doğal dil sorgusu başlattı.\n\n`;

            return context;
        }
    }
