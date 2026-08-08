import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { PrismaService } from '../prisma/prisma.service';

/**
 * Closes GAP report BUG-04: AnnouncementsService.broadcast() only knows that
 * a send reached the BullMQ queue (status 'QUEUED'), not whether it was
 * actually delivered — that outcome is decided later, asynchronously, by
 * EmailProcessor. This service periodically reads the real outcome off the
 * linked EmailLog and promotes/demotes the AnnouncementLog to match.
 *
 * Deliberately does not touch EmailProcessor or the shared BullMQ pipeline
 * at all — it only reads EmailLog rows other code already writes.
 */
@Injectable()
export class AnnouncementLogReconciliationService {
    private readonly logger = new Logger(AnnouncementLogReconciliationService.name);

    constructor(private readonly prisma: PrismaService) { }

    @Cron('*/2 * * * *')
    async reconcile(): Promise<void> {
        try {
            const { updated } = await this.reconcileQueuedLogs();
            if (updated > 0) {
                this.logger.log(`📬 Reconciled ${updated} announcement log(s) with their real delivery outcome`);
            }
        } catch (err: any) {
            this.logger.error(`❌ Announcement log reconciliation failed: ${err.message}`);
        }
    }

    async reconcileQueuedLogs(): Promise<{ updated: number }> {
        const queuedLogs = await this.prisma.announcementLog.findMany({
            where: { status: 'QUEUED', emailLogId: { not: null } },
            select: { id: true, emailLogId: true },
        });

        let updated = 0;

        for (const log of queuedLogs) {
            const emailLog = await this.prisma.emailLog.findUnique({
                where: { id: log.emailLogId as string },
                select: { status: true, sentAt: true, error: true },
            });

            // Linked row is gone (manual cleanup, data issue) — nothing to
            // reconcile against; leave the announcement log as-is.
            if (!emailLog) continue;

            if (emailLog.status === 'SENT') {
                await this.prisma.announcementLog.update({
                    where: { id: log.id },
                    data: { status: 'SENT', sentAt: emailLog.sentAt ?? new Date() },
                });
                updated += 1;
            } else if (emailLog.status === 'FAILED') {
                await this.prisma.announcementLog.update({
                    where: { id: log.id },
                    data: { status: 'FAILED', error: emailLog.error ?? 'Email delivery failed' },
                });
                updated += 1;
            }
            // Any other EmailLog status (still QUEUED, retrying, ...) means
            // the outcome isn't known yet — leave the log alone, it will be
            // re-checked on the next tick.
        }

        return { updated };
    }
}
