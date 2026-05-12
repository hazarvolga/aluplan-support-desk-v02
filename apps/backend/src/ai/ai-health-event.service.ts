import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '../prisma/prisma.service';
import { AiHealthEventType } from '@aluplan/database';

const RETENTION_DAYS = 30;

@Injectable()
export class AiHealthEventService {
    private readonly logger = new Logger(AiHealthEventService.name);

    constructor(private readonly prisma: PrismaService) { }

    async record(data: {
        eventType: AiHealthEventType;
        provider: string;
        model?: string | null;
        task?: string | null;
        errorMessage?: string | null;
        latencyMs?: number | null;
        metadata?: Record<string, any> | null;
    }) {
        try {
            await this.prisma.aiHealthEvent.create({
                data: {
                    eventType: data.eventType,
                    provider: data.provider,
                    model: data.model ?? undefined,
                    task: data.task ?? undefined,
                    errorMessage: data.errorMessage ?? undefined,
                    latencyMs: data.latencyMs ?? undefined,
                    metadata: data.metadata ?? undefined,
                },
            });
        } catch (err) {
            this.logger.error(`Failed to record AI health event: ${err}`);
        }
    }

    async getRecent(limit = 50, type?: AiHealthEventType, days?: number) {
        const where: any = {};
        if (type) where.eventType = type;
        if (days) {
            where.createdAt = {
                gte: new Date(Date.now() - days * 24 * 60 * 60 * 1000),
            };
        }

        return this.prisma.aiHealthEvent.findMany({
            where,
            orderBy: { createdAt: 'desc' },
            take: limit,
        });
    }

    async getStats(days = 7) {
        const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

        const [total, byType, byProvider, avgLatency] = await Promise.all([
            this.prisma.aiHealthEvent.count({ where: { createdAt: { gte: since } } }),
            this.prisma.aiHealthEvent.groupBy({
                by: ['eventType'],
                _count: { id: true },
                where: { createdAt: { gte: since } },
            }),
            this.prisma.aiHealthEvent.groupBy({
                by: ['provider'],
                _count: { id: true },
                _avg: { latencyMs: true },
                where: { createdAt: { gte: since } },
            }),
            this.prisma.aiHealthEvent.aggregate({
                _avg: { latencyMs: true },
                where: {
                    createdAt: { gte: since },
                    latencyMs: { not: null },
                },
            }),
        ]);

        return {
            total,
            byType: byType.map((t) => ({ type: t.eventType, count: t._count.id })),
            byProvider: byProvider.map((p) => ({
                provider: p.provider,
                count: p._count.id,
                avgLatencyMs: p._avg.latencyMs ? Math.round(p._avg.latencyMs) : null,
            })),
            avgLatencyMs: avgLatency._avg.latencyMs ? Math.round(avgLatency._avg.latencyMs) : null,
        };
    }

    /**
     * 30-day retention cleanup
     * Runs daily at 3:00 AM
     */
    @Cron('0 3 * * *')
    async cleanupOldEvents() {
        const cutoff = new Date(Date.now() - RETENTION_DAYS * 24 * 60 * 60 * 1000);
        try {
            const result = await this.prisma.aiHealthEvent.deleteMany({
                where: { createdAt: { lt: cutoff } },
            });
            if (result.count > 0) {
                this.logger.log(`🧹 Cleaned up ${result.count} AI health events older than ${RETENTION_DAYS} days`);
            }
        } catch (err) {
            this.logger.error(`Failed to cleanup old AI health events: ${err}`);
        }
    }
}