import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { PrismaService } from '../prisma/prisma.service';

/** Cap per run so a large backlog can't turn one tick into an unbounded scan. */
const RECONCILE_BATCH_SIZE = 200;

/** How long after a SENT verdict we keep watching for a late bounce webhook. */
const BOUNCE_RECHECK_WINDOW_MS = 48 * 60 * 60 * 1000;

/**
 * Closes GAP report BUG-04: AnnouncementsService.broadcast() only knows that
 * a send reached the BullMQ queue (status 'QUEUED'), not whether it was
 * actually delivered — that outcome is decided later, asynchronously, by
 * EmailProcessor (and, after that, by Resend's delivery webhook). This
 * service periodically reads the real outcome off the linked EmailLog and
 * promotes/demotes the AnnouncementLog to match.
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
            const [queued, bounces] = await Promise.all([
                this.reconcileQueuedLogs(),
                this.reconcileSentLogsForBounces(),
            ]);
            const updated = queued.updated + bounces.updated;
            if (updated > 0) {
                this.logger.log(`📬 Reconciled ${updated} announcement log(s) with their real delivery outcome`);
            }
        } catch (err: any) {
            this.logger.error(`❌ Announcement log reconciliation failed: ${err.message}`);
        }
    }

    /**
     * First pass: logs still QUEUED (broadcast enqueued the send, but
     * EmailProcessor hasn't decided the terminal outcome yet). Promotes to
     * SENT or FAILED once that outcome is known. EmailProcessor only ever
     * writes EmailLog=FAILED on the final BullMQ attempt (see
     * email.processor.ts), so a FAILED sighting here is genuinely terminal —
     * it cannot flip back to SENT afterward.
     */
    async reconcileQueuedLogs(): Promise<{ updated: number }> {
        const queuedLogs = await this.prisma.announcementLog.findMany({
            where: { status: 'QUEUED', emailLogId: { not: null } },
            select: { id: true, emailLogId: true },
            take: RECONCILE_BATCH_SIZE,
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

    /**
     * Second pass: logs already promoted to SENT. The mail provider can
     * still report a bounce well after acceptance (email.controller.ts's
     * webhook flips EmailLog to BOUNCED asynchronously) — without this pass
     * a bounced announcement stays mislabeled as delivered forever, since
     * reconcileQueuedLogs() never looks at SENT rows again. Scoped to a
     * recent window (not "all SENT logs ever") so this stays cheap as the
     * table grows — a bounce arriving after 48h is rare enough to accept.
     */
    async reconcileSentLogsForBounces(): Promise<{ updated: number }> {
        const recentlySent = await this.prisma.announcementLog.findMany({
            where: {
                status: 'SENT',
                emailLogId: { not: null },
                sentAt: { gte: new Date(Date.now() - BOUNCE_RECHECK_WINDOW_MS) },
            },
            select: { id: true, emailLogId: true },
            take: RECONCILE_BATCH_SIZE,
        });

        let updated = 0;

        for (const log of recentlySent) {
            const emailLog = await this.prisma.emailLog.findUnique({
                where: { id: log.emailLogId as string },
                select: { status: true },
            });

            if (!emailLog) continue;

            if (emailLog.status === 'BOUNCED') {
                await this.prisma.announcementLog.update({
                    where: { id: log.id },
                    data: { status: 'BOUNCED' },
                });
                updated += 1;
            }
            // SENT (unchanged) or DELIVERED (already a success outcome, SENT
            // reads fine to the recipient) need no update.
        }

        return { updated };
    }
}
