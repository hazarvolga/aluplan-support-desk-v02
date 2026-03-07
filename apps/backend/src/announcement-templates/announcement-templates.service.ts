import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateAnnouncementTemplateDto, UpdateAnnouncementTemplateDto } from './dto/announcement-template.dto';
import { ENTERPRISE_TEMPLATES } from './announcement-templates.defaults';

@Injectable()
export class AnnouncementTemplatesService {
  private readonly logger = new Logger(AnnouncementTemplatesService.name);

  constructor(private readonly prisma: PrismaService) {
    this.seedDefaults();
  }

  async seedDefaults() {
    this.logger.log('Checking for ready-made announcement templates...');

    // Find a valid admin user ID for system seed attribution
    const adminUser = await this.prisma.user.findFirst({
      where: {
        role: {
          name: { in: ['admin', 'super-admin'] }
        }
      },
      select: { id: true }
    });
    // Fallback to null if no admin user exists yet (created_by is nullable)
    const systemUserId = adminUser?.id ?? null;

    try {
      // One-time cleanup: Strip icons from existing template names
      const currentTemplates = await this.prisma.announcementTemplate.findMany({
        select: { id: true, name: true }
      });

      for (const t of currentTemplates) {
        // Improved regex for broader emoji/symbol coverage + normalize en/em dashes to simple hyphen
        let cleanName = t.name.replace(/([\uE000-\uF8FF]|\uD83C[\uDF00-\uDFFF]|\uD83D[\uDC00-\uDDFF]|\uD83E[\uDD10-\uDDFF]|[\u2011-\u26FF]|\uD83C[\uDDE6-\uDDFF])/g, '');
        cleanName = cleanName.replace(/[\u2013\u2014]/g, '-').replace(/\s+/g, ' ').trim();

        if (cleanName !== t.name) {
          try {
            this.logger.log(`Normalizing template name: "${t.name}" -> "${cleanName}"`);
            await this.prisma.announcementTemplate.update({
              where: { id: t.id },
              data: { name: cleanName }
            });
          } catch (updateError) {
            // Uniqueness collision: Delete the one currently being processed since it's now a duplicate
            this.logger.warn(`Collision detected during normalization for "${t.name}". Deleting duplicate.`);
            try {
              await this.prisma.announcementTemplate.delete({ where: { id: t.id } });
            } catch (deleteError) {
              this.logger.warn(`Could not delete duplicate "${t.name}" (${deleteError.message})`);
            }
          }
        }
      }

      // Refresh existing names set after cleanup
      const updatedTemplates = await this.prisma.announcementTemplate.findMany({
        select: { name: true }
      });
      const existingNames = new Set(updatedTemplates.map(t => t.name));

      let seeded = 0;
      for (const template of ENTERPRISE_TEMPLATES) {
        if (!existingNames.has(template.name)) {
          await this.prisma.announcementTemplate.create({
            data: {
              ...template,
              createdBy: systemUserId
            }
          });
          seeded++;
        }
      }

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
