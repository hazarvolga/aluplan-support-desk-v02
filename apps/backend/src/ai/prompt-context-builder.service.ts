import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

export interface ContextOptions {
    userId?: string | null;
    userQuery: string;
    kbContent?: string;
}

@Injectable()
export class PromptContextBuilderService {
    constructor(private readonly prisma: PrismaService) { }

    async buildContext(options: ContextOptions): Promise<string> {
        const { userId, userQuery, kbContent } = options;
        let context = '';

        // 1. User Profile & Preferences
        if (userId) {
            const user = await this.prisma.user.findUnique({
                where: { id: userId },
                include: { customerProfile: true }
            });
            if (user) {
                context += `[1. Kullanıcı Profili]\nAd: ${user.fullName}\nEmail: ${user.email}\n`;
                if (user.customerProfile) {
                    context += `Firma: ${user.customerProfile.companyName || 'Bilinmiyor'}\nSektör: ${user.customerProfile.industry || 'Bilinmiyor'}\n`;
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
