import { Injectable, Logger } from '@nestjs/common';
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
                        dashboardUrl
                    }
                });
            }

            this.logger.log(`✅ Weekly AI health report sent to ${recipients.length} recipients.`);
        } catch (error: any) {
            this.logger.error('❌ Failed to generate weekly AI health report', error.stack);
        }
    }

    /**
     * Manual Trigger for Testing
     */
    async triggerNow() {
        return this.sendWeeklyHealthReport();
    }
}
