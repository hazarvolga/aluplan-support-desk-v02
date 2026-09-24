import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { PrismaService } from '../prisma/prisma.service';

/** Cap per run so a large backlog can't turn one tick into an unbounded scan. */
const RECONCILE_BATCH_SIZE = 200;

/** How long after a SENT verdict we keep watching for a late bounce webhook. */
const BOUNCE_RECHECK_WINDOW_MS = 48 * 60 * 60 * 1000;

const ACTIONABLE_QUEUED_EMAIL_STATUSES = ['SENT', 'DELIVERED', 'BOUNCED', 'FAILED'];

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

    @Cron('*/2 * * * *', { waitForCompletion: true })
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
     * SENT, BOUNCED, or FAILED once that outcome is known. EmailProcessor only ever
     * writes EmailLog=FAILED on the final BullMQ attempt (see
     * email.processor.ts), so a FAILED sighting here is genuinely terminal —
     * it cannot flip back to SENT afterward.
     */
    async reconcileQueuedLogs(): Promise<{ updated: number }> {
        const queuedLogs = await this.prisma.announcementLog.findMany({
            where: {
                status: 'QUEUED',
                emailLog: {
                    is: {
                        status: { in: ACTIONABLE_QUEUED_EMAIL_STATUSES },
                    },
                },
            },
            select: {
                id: true,
                emailLog: {
                    select: { status: true, sentAt: true, error: true },
                },
            },
            orderBy: [{ createdAt: 'asc' }, { id: 'asc' }],
            take: RECONCILE_BATCH_SIZE,
        });

        let updated = 0;

        for (const log of queuedLogs) {
            const emailLog = log.emailLog;
            if (!emailLog) continue;

            let data: { status: string; sentAt?: Date; error?: string | null };
            switch (emailLog.status) {
                case 'SENT':
                case 'DELIVERED':
                    data = {
                        status: 'SENT',
                        sentAt: emailLog.sentAt ?? new Date(),
                        error: null,
                    };
                    break;
                case 'BOUNCED':
                    data = {
                        status: 'BOUNCED',
                        sentAt: emailLog.sentAt ?? new Date(),
                        error: emailLog.error,
                    };
                    break;
                case 'FAILED':
                    data = {
                        status: 'FAILED',
                        error: emailLog.error ?? 'Email delivery failed',
                    };
                    break;
                default:
                    continue;
            }

            const result = await this.prisma.announcementLog.updateMany({
                where: {
                    id: log.id,
                    status: 'QUEUED',
                    emailLog: { is: { status: emailLog.status } },
                },
                data,
            });
            updated += result.count;
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
                sentAt: { gte: new Date(Date.now() - BOUNCE_RECHECK_WINDOW_MS) },
                emailLog: { is: { status: 'BOUNCED' } },
            },
            select: { id: true },
            orderBy: [{ sentAt: 'asc' }, { id: 'asc' }],
            take: RECONCILE_BATCH_SIZE,
        });

        let updated = 0;

        for (const log of recentlySent) {
            const result = await this.prisma.announcementLog.updateMany({
                where: {
                    id: log.id,
                    status: 'SENT',
                    emailLog: { is: { status: 'BOUNCED' } },
                },
                data: { status: 'BOUNCED' },
            });
            updated += result.count;
        }

        return { updated };
    }
}
