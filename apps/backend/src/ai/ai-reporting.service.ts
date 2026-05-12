import { Injectable, Logger, Inject, forwardRef } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { AiQueryService } from './ai-query.service';
import { EmailService } from '../email/email.service';
import { PrismaService } from '../prisma/prisma.service';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AiReportingService {
    private readonly logger = new Logger(AiReportingService.name);

    constructor(
        private readonly aiQueryService: AiQueryService,
        @Inject(forwardRef(() => EmailService))
        private readonly emailService: EmailService,
        private readonly prisma: PrismaService,
        private readonly config: ConfigService,
    ) { }

    /**
     * Weekly AI Health Report
     * Every Monday at 9:00 AM
     */
    @Cron('0 9 * * 1')
    async sendWeeklyHealthReport() {
        this.logger.log('📊 Starting weekly AI health report generation...');

        try {
            // 1. Collect Data
            const trends = await this.aiQueryService.getHealthTrends(7);
            const gaps = await this.aiQueryService.getKnowledgeGaps(5);
            const metrics = await this.aiQueryService.getHealthMetrics();
            const resolverMetrics = await this.getAutoResolverMetrics(7);

            if (trends.length === 0) {
                this.logger.warn('No interaction data from the last 7 days. Skipping report.');
                return;
            }

            // 2. Aggregate Stats for the week
            const avgAccuracy = trends.reduce((acc, t) => acc + t.accuracy, 0) / trends.length;
            const avgDeflection = trends.reduce((acc, t) => acc + t.deflection, 0) / trends.length;
            const totalInteractions = trends.reduce((acc, t) => acc + t.total, 0);

            // 3. Find recipients (Admins and Agents)
            const recipients = await this.prisma.user.findMany({
                where: {
                    role: {
                        name: { in: ['ADMIN', 'AGENT', 'SUPERUSER'] }
                    },
                    status: 'ACTIVE'
                },
                select: { email: true }
            });

            const frontendUrl = this.config.get('FRONTEND_URL', 'http://localhost:3000');
            const dashboardUrl = `${frontendUrl}/admin/ai-health`;

            // 4. Send Emails
            const startDate = trends[0].date.toLocaleDateString('tr-TR');
            const endDate = trends[trends.length - 1].date.toLocaleDateString('tr-TR');

            for (const recipient of recipients) {
                await this.emailService.enqueueEmail({
                    template: 'ai-health-report',
                    to: recipient.email,
                    subject: `🤖 AI Sağlık Raporu: ${startDate} - ${endDate}`,
                    data: {
                        startDate,
                        endDate,
                        accuracy: Math.round(avgAccuracy),
                        deflection: Math.round(avgDeflection),
                        totalInteractions,
                        cost: metrics.totalInteractions > 0 ? 'TBD' : '0', // Full cost extraction can be added later
                        topModel: 'llama-3.3-70b',
                        gaps,
                        dashboardUrl,
                        autoResolverSuccessRate: resolverMetrics.successRate,
                        autoResolved: resolverMetrics.autoResolved,
                        escalated: resolverMetrics.escalated,
                        noMatchCount: resolverMetrics.noMatchCount,
                    }
                });
            }

            this.logger.log(`✅ Weekly AI health report sent to ${recipients.length} recipients.`);
        } catch (error: any) {
            this.logger.error('❌ Failed to generate weekly AI health report', error.stack);
        }
    }

    /**
     * Auto-resolver metrics: how many interactions were auto-answered vs escalated.
     * Exposes the AiAutoResolverService community's output into the reporting layer.
     */
    async getAutoResolverMetrics(days = 7): Promise<{
        totalInteractions: number;
        autoResolved: number;
        escalated: number;
        noMatchCount: number;
        successRate: number;
    }> {
        const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
        const [total, autoResolved, noMatch] = await Promise.all([
            this.prisma.aiInteraction.count({ where: { createdAt: { gte: since } } }),
            this.prisma.aiInteraction.count({ where: { createdAt: { gte: since }, autoAnswered: true } }),
            this.prisma.aiInteraction.count({ where: { createdAt: { gte: since }, confidenceBand: null } }),
        ]);
        const escalated = total - autoResolved;
        return {
            totalInteractions: total,
            autoResolved,
            escalated,
            noMatchCount: noMatch,
            successRate: total > 0 ? Math.round((autoResolved / total) * 100) : 0,
        };
    }

    /**
     * Intelligence Dashboard — last-24h snapshot for the admin AI health page.
     */
    async getIntelligenceDashboard(): Promise<{
        cacheHitRate: number;
        avgTopRetrievalScore: number;
        lowConfidenceRate: number;
        pendingTrainingQueueCount: number;
    }> {
        const last24h = new Date(Date.now() - 24 * 60 * 60 * 1000);

        const [interactions, pendingCount] = await Promise.all([
            this.prisma.aiInteraction.findMany({
                where: { createdAt: { gte: last24h } },
                select: { similarityScore: true, confidenceBand: true, autoAnswered: true },
            }),
            this.prisma.trainingQueue.count({ where: { status: 'PENDING' } }),
        ]);

        const total = interactions.length || 1;
        const autoAnswered = interactions.filter(i => i.autoAnswered).length;
        const lowConfidence = interactions.filter(
            i => i.confidenceBand === 'LOW' || i.confidenceBand === null
        ).length;
        const validScores = interactions
            .filter(i => i.similarityScore != null)
            .map(i => Number(i.similarityScore));
        const avgScore = validScores.length > 0
            ? validScores.reduce((a, b) => a + b, 0) / validScores.length
            : 0;

        return {
            cacheHitRate: Math.round((autoAnswered / total) * 100),
            avgTopRetrievalScore: Math.round(avgScore * 1000) / 1000,
            lowConfidenceRate: Math.round((lowConfidence / total) * 100),
            pendingTrainingQueueCount: pendingCount,
        };
    }

    /**
     * Manual Trigger for Testing
     */
    async triggerNow() {
        return this.sendWeeklyHealthReport();
    }
}
