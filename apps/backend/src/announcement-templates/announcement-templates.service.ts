import { Injectable, Logger, NotFoundException, OnModuleInit } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateAnnouncementTemplateDto, UpdateAnnouncementTemplateDto } from './dto/announcement-template.dto';
import { ENTERPRISE_TEMPLATES } from './announcement-templates.defaults';

@Injectable()
export class AnnouncementTemplatesService implements OnModuleInit {
  private readonly logger = new Logger(AnnouncementTemplatesService.name);

  constructor(private readonly prisma: PrismaService) {}

  async onModuleInit(): Promise<void> {
    await this.seedDefaults();
  }

  async seedDefaults() {
    this.logger.log('Checking for ready-made announcement templates...');

    try {
      // Startup must never rename or delete customer-edited templates.
      const adminUser = await this.prisma.user.findFirst({
        where: { role: { name: { in: ['admin', 'super-admin'] } } },
        select: { id: true },
      });
      const systemUserId = adminUser?.id ?? null;
      const currentTemplates = await this.prisma.announcementTemplate.findMany({
        select: { name: true }
      });
      const existingNames = new Set(currentTemplates.map(t => t.name));

      const missing = ENTERPRISE_TEMPLATES.filter(template => !existingNames.has(template.name));
      const seeded = missing.length === 0 ? 0 : (await this.prisma.announcementTemplate.createMany({
        data: missing.map(template => ({ ...template, createdBy: systemUserId })),
        skipDuplicates: true,
      })).count;

      if (seeded > 0) {
        this.logger.log(`Successfully seeded ${seeded} missing professional templates.`);
      }
    } catch (error) {
      this.logger.error('CRITICAL: Seeder failed to initialize templates library safely.', error.stack);
      // We don't re-throw here to prevent the entire NestJS app from crashing on startup
      // if there's a transient DB issue or a logic bug in the seeder.
    }
  }

  async create(dto: CreateAnnouncementTemplateDto, userId: string) {
    return this.prisma.announcementTemplate.create({
      data: {
        name: dto.name,
        topic: dto.topic,
        subject: dto.subject,
        contentMjml: dto.contentMjml,
        createdBy: userId,
      },
    });
  }

  async findAll() {
    return this.prisma.announcementTemplate.findMany({
      include: {
        author: {
          select: {
            fullName: true,
            email: true,
          },
        },
      },
      orderBy: {
        updatedAt: 'desc',
      },
    });
  }

  async findOne(id: string) {
    const template = await this.prisma.announcementTemplate.findUnique({
      where: { id },
      include: {
        author: true,
      },
    });
    if (!template) throw new NotFoundException('Template not found');
    return template;
  }

  async update(id: string, dto: UpdateAnnouncementTemplateDto) {
    return this.prisma.announcementTemplate.update({
      where: { id },
      data: {
        name: dto.name,
        topic: dto.topic,
        subject: dto.subject,
        contentMjml: dto.contentMjml,
      },
    });
  }

  async delete(id: string) {
    return this.prisma.announcementTemplate.delete({
      where: { id },
    });
  }
}
