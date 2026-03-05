import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { EmailService } from '../email/email.service';
import { CreateAnnouncementDto, UpdateAnnouncementDto, TargetCriteriaDto } from './dto/announcement.dto';
import { AnnouncementStatus, AnnouncementType, Prisma } from '@aluplan/database';

@Injectable()
export class AnnouncementsService {
    private readonly logger = new Logger(AnnouncementsService.name);

    constructor(
        private readonly prisma: PrismaService,
        private readonly emailService: EmailService,
    ) { }

    async create(dto: CreateAnnouncementDto, userId: string) {
        return this.prisma.announcement.create({
            data: {
                title: dto.title,
                subject: dto.subject,
                contentMjml: dto.contentMjml,
                targetCriteria: dto.targetCriteria as any,
                type: dto.type || 'BROADCAST',
                status: 'DRAFT',
                createdBy: userId,
            },
        });
    }

    async findAll() {
        return this.prisma.announcement.findMany({
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
        return this.prisma.announcement.delete({
            where: { id },
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

        // Update status to SENDING
        await this.prisma.announcement.update({
            where: { id },
            data: { status: 'SENDING' },
        });

        try {
            const criteria = announcement.targetCriteria as any as TargetCriteriaDto;

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

                // Enqueue Email via existing EmailService
                // Use master-announcement template for new HTML content, 'raw' for old raw MJML content
                const content = announcement.contentMjml || '';
                const isMjml = content.trim().toLowerCase().startsWith('<mjml>') || content.trim().toLowerCase().startsWith('<mj-');

                await this.emailService.enqueueEmail({
                    template: isMjml ? 'raw' : 'master-announcement',
                    to: target.user.email,
                    subject: announcement.subject,
                    data: {
                        mjml: isMjml ? content : undefined,
                        contentHtml: isMjml ? undefined : content,
                        customer: target,
                    },
                }).then(async () => {
                    // In a perfect world, we'd link the emailLogId here, 
                    // but enqueueEmail is async and EmailProcessor updates the status.
                    // We'll update the annLog status to SENT for now
                    await this.prisma.announcementLog.update({
                        where: { id: annLog.id },
                        data: { status: 'SENT', sentAt: new Date() }
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
