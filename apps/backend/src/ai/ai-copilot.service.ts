import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AiService } from './ai.service';

@Injectable()
export class AiCopilotService {
    private readonly logger = new Logger(AiCopilotService.name);

    constructor(
        private readonly prisma: PrismaService,
        private readonly ai: AiService,
    ) { }

    /**
     * Synthesizes a draft response for an agent based on ticket history and RAG context.
     */
    async generateDraft(ticketId: string) {
        const ticket = await this.prisma.ticket.findUnique({
            where: { id: ticketId },
            include: {
                messages: {
                    orderBy: { createdAt: 'desc' },
                    take: 10,
                    include: { sender: { select: { fullName: true } } }
                },
                interaction: true,
            }
        });

        if (!ticket) throw new NotFoundException('Ticket not found');

        // Context from the initial AI search/RAG interaction
        const context = ticket.interaction?.responseGenerated || 'No specific knowledge base context found for this incident.';

        // Conversation overview
        const history = ticket.messages
            .map(m => `${m.sender?.fullName || 'SYSTEM/AI'}: ${m.message}`)
            .reverse()
            .join('\n');

        const prompt = `Görevi: Profesyonel bir müşteri destek temsilcisi gibi bir yanıt taslağı hazırlamak.
Aşağıdaki "BİLGİ KAYNAĞI" ve "KONUŞMA GEÇMİŞİ" bilgilerini kullanarak müşteriye yardımcı olacak, empatik ve teknik açıdan doğru bir yanıt yaz.

BİLGİ KAYNAĞI:
${context}

KONUŞMA GEÇMİŞİ:
${history}

KURALLAR:
1. Yanıt profesyonel ve çözüm odaklı olmalı.
2. Yalnızca BİLGİ KAYNAĞI'ndaki onaylı teknik bilgileri kullan.
3. "Merhaba", "Sayın ..." gibi hitaplarla başlama, sadece mesajın gövdesini yaz.
4. Temsilcinin imzasını ekleme.
5. Yanıtı Türkçe dilinde ver.

YANIT TASLAĞI:`;

        this.logger.log(`🤖 Generating AI draft for ticket ${ticket.ticketNumber}...`);
        const response = await this.ai.generate(prompt, 60_000);

        return {
            draft: response || 'Taslak oluşturulamadı.',
            model: 'dynamic' // Provider info is abstracted
        };
    }
}
