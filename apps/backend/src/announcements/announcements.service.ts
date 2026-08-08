import { Injectable, Logger, ForbiddenException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { EmailService } from '../email/email.service';
import { NotificationsGateway } from '../notifications/notifications.gateway';
import { CreateAnnouncementDto, UpdateAnnouncementDto, TargetCriteriaDto } from './dto/announcement.dto';
import { Prisma, AnnouncementLog } from '@aluplan/database';
import { buildAnnouncementEmailContext } from './announcement-email-context';
import { assertAnnouncementContentIsSafeToSend, renderAnnouncementSubject } from './announcement-content-safety';

@Injectable()
export class AnnouncementsService {
    private readonly logger = new Logger(AnnouncementsService.name);

    constructor(
        private readonly prisma: PrismaService,
        private readonly emailService: EmailService,
        private readonly notificationsGateway: NotificationsGateway,
    ) { }

    async create(dto: CreateAnnouncementDto, userId: string) {
        return this.prisma.announcement.create({
            data: {
                title: dto.title,
                subject: dto.subject,
                contentMjml: dto.contentMjml,
                targetCriteria: dto.targetCriteria as Prisma.InputJsonValue,
                type: dto.type || 'BROADCAST',
                status: 'DRAFT',
                createdBy: userId,
            },
        });
    }

    async findAll() {
        return this.prisma.announcement.findMany({
            where: { deletedAt: null },
            include: {
                author: {
                    select: {
                        fullName: true,
                        email: true,
                    },
                },
                _count: {
                    select: {
                        logs: true,
                    },
                },
            },
            orderBy: {
                createdAt: 'desc',
            },
        });
    }

    async findOne(id: string) {
        return this.prisma.announcement.findUnique({
            where: { id },
            include: {
                author: true,
                logs: {
                    take: 50,
                    include: {
                        customer: true,
                    },
                },
            },
        });
    }

    async update(id: string, dto: UpdateAnnouncementDto) {
        return this.prisma.announcement.update({
            where: { id },
            data: {
                title: dto.title,
                subject: dto.subject,
                contentMjml: dto.contentMjml,
                targetCriteria: dto.targetCriteria as Prisma.InputJsonValue,
                type: dto.type,
            },
        });
    }

    async delete(id: string) {
        return this.prisma.announcement.update({
            where: { id },
            data: { deletedAt: new Date() },
        });
    }

    /**
     * Finds target customers based on criteria without sending
     */
    async getTargetCount(criteria: TargetCriteriaDto) {
        const hasCriteria = (criteria.industries?.length || 0) +
            (criteria.statuses?.length || 0) +
            (criteria.companyNames?.length || 0) +
            (criteria.tags?.length || 0) > 0;

        if (!hasCriteria) {
            return { count: 0 };
        }

        const where = await this.buildTargetQuery(criteria);
        const count = await this.prisma.customerProfile.count({ where });
        return { count };
    }

    /**
     * Main broadcast execution
     */
    async broadcast(id: string) {
        const announcement = await this.prisma.announcement.findUnique({
            where: { id },
        });

        if (!announcement) throw new Error('Announcement not found');
        if (announcement.status === 'SENT' || announcement.status === 'SENDING') {
            throw new Error('Announcement already sent or sending');
        }

        // Fail closed on unresolved [placeholder] text or unsupported {{...}}
        // variables before touching any state — nothing is sent, nothing is
        // marked SENDING, if the content isn't safe to personalize.
        assertAnnouncementContentIsSafeToSend(announcement.subject, announcement.contentMjml || '');

        // Update status to SENDING
        await this.prisma.announcement.update({
            where: { id },
            data: { status: 'SENDING' },
        });

        try {
            const criteria = announcement.targetCriteria as unknown as TargetCriteriaDto;

            // Safety check: if no filters are selected, don't broadcast to everyone (or crash Prisma)
            const hasIndustries = criteria.industries && criteria.industries.length > 0;
            const hasStatuses = criteria.statuses && criteria.statuses.length > 0;
            const hasCompanies = criteria.companyNames && criteria.companyNames.length > 0;
            const hasTags = criteria.tags && criteria.tags.length > 0;

            if (!hasIndustries && !hasStatuses && !hasCompanies && !hasTags) {
                this.logger.warn(`Announcement ${id} has no target criteria. Skipping broadcast.`);
                return { success: true, count: 0 };
            }

            const where = await this.buildTargetQuery(criteria);

            const targets = await this.prisma.customerProfile.findMany({
                where,
                include: {
                    user: {
                        select: {
                            id: true,
                            email: true,
                        },
                    },
                },
            });

            this.logger.log(`Broadcasting announcement ${id} to ${targets.length} customers`);

            for (const target of targets) {
                // Skip if user record or email is missing
                if (!target.user?.email) continue;
                // Create Announcement Log
                const annLog = await this.prisma.announcementLog.create({
                    data: {
                        announcementId: id,
                        customerId: target.id,
                        status: 'PENDING',
                    },
                });

                // Emit real-time WebSocket notification to online customers
                if (target.user?.id) {
                    const excerpt = this.generateExcerpt(announcement.contentMjml || '');
                    this.notificationsGateway.sendToUser(target.user.id, 'ANNOUNCEMENT_RECEIVED', {
                        logId: annLog.id,
                        announcementId: id,
                        title: announcement.title,
                        excerpt,
                        sentAt: new Date().toISOString(),
                    });
                }

                // Enqueue Email via existing EmailService
                // Use master-announcement template for new HTML content, 'raw' for old raw MJML content
                const content = announcement.contentMjml || '';
                const isMjml = content.trim().toLowerCase().startsWith('<mjml>') || content.trim().toLowerCase().startsWith('<mj-');
                const customerContext = buildAnnouncementEmailContext(target);

                await this.emailService.enqueueEmail({
                    template: isMjml ? 'raw' : 'master-announcement',
                    to: target.user.email,
                    subject: renderAnnouncementSubject(announcement.subject, customerContext),
                    data: {
                        mjml: isMjml ? content : undefined,
                        contentHtml: isMjml ? undefined : content,
                        customer: customerContext,
                    },
                }).then(async (emailLogId) => {
                    // enqueueEmail() only confirms the job reached the queue,
                    // not that it was delivered — EmailProcessor decides the
                    // real SENT/FAILED outcome later. AnnouncementLogReconciliationService
                    // reads that outcome via emailLogId and updates this row.
                    // A null id means the send was skipped before a queue job
                    // ever existed (opted out / blocked recipient) — that is
                    // not a delivery failure, so it gets its own status.
                    await this.prisma.announcementLog.update({
                        where: { id: annLog.id },
                        data: emailLogId
                            ? { status: 'QUEUED', emailLogId }
                            : { status: 'SKIPPED', error: 'Recipient opted out or is a blocked/reserved address' },
                    });
                }).catch(async (err) => {
                    await this.prisma.announcementLog.update({
                        where: { id: annLog.id },
                        data: { status: 'FAILED', error: err.message }
                    });
                });
            }

            // Update announcement status
            await this.prisma.announcement.update({
                where: { id },
                data: {
                    status: 'SENT',
                    sentAt: new Date()
                },
            });

            return { success: true, count: targets.length };
        } catch (error) {
            await this.prisma.announcement.update({
                where: { id },
                data: { status: 'DRAFT' }, // Rollback to draft on catastrophic failure
            });
            throw error;
        }
    }

    private async buildTargetQuery(criteria: TargetCriteriaDto): Promise<Prisma.CustomerProfileWhereInput> {
        const where: Prisma.CustomerProfileWhereInput = {};

        const hasIndustries = criteria.industries && criteria.industries.length > 0;
        const hasStatuses = criteria.statuses && criteria.statuses.length > 0;
        const hasCompanies = criteria.companyNames && criteria.companyNames.length > 0;
        const hasTags = criteria.tags && criteria.tags.length > 0;

        if (hasIndustries) {
            where.industry = { in: criteria.industries };
        }

        if (hasStatuses) {
            where.contractStatus = { in: criteria.statuses };
        }

        if (hasCompanies) {
            where.companyName = { in: criteria.companyNames };
        }

        if (hasTags) {
            where.tags = { hasSome: criteria.tags };
        }

        return where;
    }

    private generateExcerpt(contentMjml: string): string {
        const plain = contentMjml.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
        return plain.length <= 160 ? plain : plain.slice(0, 160);
    }

    async getMyAnnouncements(userId: string, page = 1, limit = 20) {
        try {
            const customer = await this.prisma.customerProfile.findUnique({ where: { userId } });
            if (!customer) return { data: [], total: 0 };
            const [data, total] = await Promise.all([
                this.prisma.announcementLog.findMany({
                    where: { customerId: customer.id },
                    orderBy: { sentAt: 'desc' },
                    skip: (page - 1) * limit,
                    take: limit,
                    include: { announcement: { select: { title: true, contentMjml: true } } },
                }),
                this.prisma.announcementLog.count({ where: { customerId: customer.id } }),
            ]);
            return { data, total };
        } catch (error) {
            this.logger.error(`Error in getMyAnnouncements for user ${userId}:`, error);
            return { data: [], total: 0 };
        }
    }

    async getMyUnreadCount(userId: string): Promise<{ count: number }> {
        try {
            const customer = await this.prisma.customerProfile.findUnique({ where: { userId } });
            if (!customer) return { count: 0 };

            const count = await this.prisma.announcementLog.count({
                where: {
                    customerId: customer.id,
                    readAt: null
                },
            });
            return { count };
        } catch (error) {
            this.logger.error(`Error in getMyUnreadCount for user ${userId}:`, error);
            // Fallback to 0 to prevent UI crashes if DB is misaligned
            return { count: 0 };
        }
    }

    async markLogRead(logId: string, userId: string): Promise<AnnouncementLog> {
        const customer = await this.prisma.customerProfile.findUnique({ where: { userId } });
        if (!customer) throw new ForbiddenException();
        const log = await this.prisma.announcementLog.findUnique({ where: { id: logId } });
        if (!log) throw new NotFoundException();
        if (log.customerId !== customer.id) throw new ForbiddenException();
        if (log.readAt !== null) return log;
        return this.prisma.announcementLog.update({
            where: { id: logId },
            data: { readAt: new Date() },
        });
    }

    async getFilterOptions() {
        const [industries, statuses, companies] = await Promise.all([
            this.prisma.customerProfile.findMany({
                where: { industry: { not: null } },
                select: { industry: true },
                distinct: ['industry'],
            }),
            this.prisma.customerProfile.findMany({
                where: { contractStatus: { not: null } },
                select: { contractStatus: true },
                distinct: ['contractStatus'],
            }),
            this.prisma.customerProfile.findMany({
                where: { companyName: { not: '' } },
                select: { companyName: true },
                distinct: ['companyName'],
            }),
        ]);

        return {
            industries: industries.map(i => i.industry).filter(Boolean).sort() as string[],
            statuses: statuses.map(s => s.contractStatus).filter(Boolean).sort() as string[],
            companies: companies.map(c => c.companyName).filter(Boolean).sort() as string[],
        };
    }
}
