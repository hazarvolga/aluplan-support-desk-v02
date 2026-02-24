import { Controller, Get, Post, Query, Body, Param, Res, HttpStatus, UseGuards, Req, NotFoundException } from '@nestjs/common';
import { Response } from 'express';
import { PrismaService } from '../prisma/prisma.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { TemplateService } from './email.templates';
import { EmailService } from './email.service';
import * as fs from 'fs';
import * as path from 'path';

@Controller('email')
export class EmailController {
  constructor(
    private readonly prisma: PrismaService,
    private readonly emailService: EmailService
  ) { }

  @Get('track/:logId')
  async trackOpen(@Param('logId') logId: string, @Res() res: Response) {
    try {
      await this.prisma.emailEvent.create({
        data: {
          emailLogId: logId,
          eventType: 'opened',
          occurredAt: new Date(),
        }
      });
    } catch (e) {
      // Silently fail if log ID doesn't align or event fails to insert. Tracking pixel shouldn't crash.
    }

    // 1x1 transparent GIF buffer
    const buf = Buffer.from('R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7', 'base64');
    res.set('Content-Type', 'image/gif');
    res.set('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.send(buf);
  }

  @Post('webhook/resend')
  async resendWebhook(@Body() payload: any, @Res() res: Response) {
    // Basic Resend webhook signature validation goes here (HMAC)
    const type = payload.type; // e.g. "email.delivered", "email.bounced"
    const messageId = payload.data?.email_id;

    if (!messageId) {
      return res.status(HttpStatus.OK).send();
    }

    try {
      const log = await this.prisma.emailLog.findUnique({
        where: { messageId }
      });

      if (log) {
        await this.prisma.emailEvent.create({
          data: {
            emailLogId: log.id,
            eventType: type.replace('email.', ''),
            occurredAt: new Date(payload.created_at)
          }
        });
        // Auto Update parent log status
        if (type === 'email.delivered') {
          await this.prisma.emailLog.update({ where: { id: log.id }, data: { status: 'DELIVERED' } });
        } else if (type === 'email.bounced') {
          await this.prisma.emailLog.update({ where: { id: log.id }, data: { status: 'BOUNCED' } });
        }
      }
    } catch (e) {
      // Log but acknowledge webhook 
    }

    return res.status(HttpStatus.OK).send();
  }

  @UseGuards(JwtAuthGuard)
  @Get('preferences')
  async getPreferences(@Req() req: any) {
    return this.prisma.emailPreference.findMany({
      where: { userId: req.user.id }
    });
  }

  @UseGuards(JwtAuthGuard)
  @Post('preferences')
  async updatePreferences(@Req() req: any, @Body() body: { preferences: { emailType: string, enabled: boolean }[] }) {
    const updates = body.preferences.map(pref => {
      return this.prisma.emailPreference.upsert({
        where: {
          userId_emailType: {
            userId: req.user.id,
            emailType: pref.emailType
          }
        },
        update: { enabled: pref.enabled },
        create: {
          userId: req.user.id,
          emailType: pref.emailType,
          enabled: pref.enabled
        }
      });
    });

    await Promise.all(updates);
    return { success: true };
  }

  // Admin Endpoints
  @UseGuards(JwtAuthGuard)
  @Get('admin/logs')
  async getEmailLogs(@Query() query: any) {
    const { page = 1, limit = 50, status } = query;
    const skip = (Number(page) - 1) * Number(limit);

    const whereClause = status ? { status } : {};

    const [data, total] = await Promise.all([
      this.prisma.emailLog.findMany({
        where: whereClause,
        orderBy: { createdAt: 'desc' },
        skip,
        take: Number(limit),
        include: { events: true }
      }),
      this.prisma.emailLog.count({ where: whereClause })
    ]);

    return { data, total, page: Number(page), limit: Number(limit) };
  }

  @UseGuards(JwtAuthGuard)
  @Get('admin/templates')
  async getTemplates() {
    const mjmlDir = path.join(process.cwd(), 'apps/backend/src/email/templates/mjml');
    if (!fs.existsSync(mjmlDir)) return { templates: [] };

    const files = fs.readdirSync(mjmlDir)
      .filter(f => f.endsWith('.mjml'))
      .map(f => f.replace('.mjml', ''));

    return { templates: files };
  }

  @UseGuards(JwtAuthGuard)
  @Get('admin/templates/:name/source')
  async getTemplateSource(@Param('name') name: string) {
    const mjmlPath = path.join(process.cwd(), 'apps/backend/src/email/templates/mjml', `${name}.mjml`);
    if (!fs.existsSync(mjmlPath)) throw new NotFoundException('Template not found');

    const content = fs.readFileSync(mjmlPath, 'utf8');
    return { content };
  }

  @UseGuards(JwtAuthGuard)
  @Post('admin/templates/:name/save')
  async saveTemplate(@Param('name') name: string, @Body() body: { content: string }) {
    const mjmlPath = path.join(process.cwd(), 'apps/backend/src/email/templates/mjml', `${name}.mjml`);

    // Ensure dir exists
    const mjmlDir = path.dirname(mjmlPath);
    if (!fs.existsSync(mjmlDir)) fs.mkdirSync(mjmlDir, { recursive: true });

    fs.writeFileSync(mjmlPath, body.content, 'utf8');
    TemplateService.resetCache(name);

    return { success: true };
  }

  @UseGuards(JwtAuthGuard)
  @Post('admin/templates/:name/preview')
  async previewTemplate(@Param('name') name: string, @Body() data: any) {
    try {
      // Provide some standard mock data if empty
      const mockData = Object.keys(data).length > 0 ? data : {
        ticket: { id: 'TCKT-1234', subject: 'Örnek Destek Talebi', priority: 'HIGH', url: 'http://localhost/tickets/TCKT-1234', first_message_snippet: 'Bu bir örnek mesajdır.' },
        customer: { first_name: 'John', full_name: 'John Doe', email: 'john@example.com' },
        agent: { first_name: 'Jane', full_name: 'Jane Smith' },
        sla: { first_response_deadline: new Date().toLocaleString() }
      };

      const compiled = TemplateService.compile(name, mockData);
      return { success: true, subject: compiled.subject, html: compiled.html };
    } catch (error) {
      return { success: false, error: 'Template compilation failed.' };
    }
  }

  @UseGuards(JwtAuthGuard)
  @Post('admin/provider/verify')
  async verifyProvider() {
    return this.emailService.healthCheck();
  }
}
