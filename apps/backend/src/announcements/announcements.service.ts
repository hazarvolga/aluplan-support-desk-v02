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
        const where = await this.buildTargetQuery(criteria);
        return this.prisma.customerProfile.count({ where });
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
                // We use the specialized 'raw' template mode we just added to TemplateService
                await this.emailService.enqueueEmail({
                    template: 'raw',
                    to: target.user.email,
                    subject: announcement.subject,
                    data: {
                        mjml: announcement.contentMjml,
                        customer: target,
                        // You can add more context here if needed
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

        if (criteria.industries && criteria.industries.length > 0) {
            where.industry = { in: criteria.industries };
        }

        if (criteria.statuses && criteria.statuses.length > 0) {
            where.contractStatus = { in: criteria.statuses };
        }

        if (criteria.companyNames && criteria.companyNames.length > 0) {
            where.companyName = { in: criteria.companyNames };
        }

        if (criteria.tags && criteria.tags.length > 0) {
            where.tags = { hasSome: criteria.tags };
        }

        // Advanced filters from hotinfoData if needed
        if (criteria.hotinfoFilters) {
            // Logic for deep json filters could go here
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
