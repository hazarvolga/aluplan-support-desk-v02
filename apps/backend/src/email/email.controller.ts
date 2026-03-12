import { Controller, Get, Post, Query, Body, Param, Res, HttpStatus, UseGuards, Req, NotFoundException, BadRequestException, Logger } from '@nestjs/common';
import { Response } from 'express';
import { PrismaService } from '../prisma/prisma.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RbacGuard } from '../rbac/rbac.guard';
import { RequirePermissions } from '../rbac/decorators/rbac.decorators';
import { TemplateService } from './email.templates';
import { EmailService } from './email.service';
import { GmailProvider } from './gmail.provider';
import { Public } from '../auth/decorators/public.decorator';
import * as fs from 'fs';
import * as path from 'path';


// MJML files live in src/ not dist/. Resolve reliably from __dirname.
const MJML_BASE_DIR = path.join(__dirname, '..', '..', 'src', 'email', 'templates', 'mjml');
const MJML_SCREENS_DIR = path.join(MJML_BASE_DIR, 'screens');

@Controller('email')
export class EmailController {
  private readonly logger = new Logger(EmailController.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly emailService: EmailService,
    private readonly gmailProvider: GmailProvider,
  ) { }

  @Public()
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
        } catch (_e) {
      // Silently fail if log ID doesn't align or event fails to insert. Tracking pixel shouldn't crash.
    }

    // 1x1 transparent GIF buffer
    const buf = Buffer.from('R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7', 'base64');
    res.set('Content-Type', 'image/gif');
    res.set('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.send(buf);
  }

  @Public()
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
    } catch (_e) {
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

  @Public()
  @Post('unsubscribe')
  async unsubscribe(@Body() body: { token: string }) {
    // In a production app, the token would be a signed JWT. 
    // Here we use the userId for the proof-of-concept.
    const userId = body.token;

    if (!userId || userId === 'global') {
      return { success: false, message: 'Invalid token' };
    }

    // Disable all email notification types for this user
    await this.prisma.emailPreference.upsert({
      where: {
        userId_emailType: {
          userId,
          emailType: 'ALL'
        }
      },
      update: { enabled: false },
      create: {
        userId,
        emailType: 'ALL',
        enabled: false
      }
    });

    return { success: true };
  }

  // Admin Endpoints
  @UseGuards(JwtAuthGuard, RbacGuard)
  @RequirePermissions('settings:read')
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

  @UseGuards(JwtAuthGuard, RbacGuard)
  @RequirePermissions('settings:read')
  @Get('admin/templates')
  async getTemplates() {
    if (!fs.existsSync(MJML_SCREENS_DIR)) return { templates: [] };

    const files = fs.readdirSync(MJML_SCREENS_DIR)
      .filter(f => f.endsWith('.mjml'))
      .map(f => f.replace('.mjml', ''));

    return { templates: files };
  }

  @UseGuards(JwtAuthGuard, RbacGuard)
  @RequirePermissions('settings:read')
  @Get('admin/templates/:name/source')
  async getTemplateSource(@Param('name') name: string) {
    const mjmlPath = path.join(MJML_SCREENS_DIR, `${name}.mjml`);
    if (!fs.existsSync(mjmlPath)) throw new NotFoundException('Template not found');

    const content = fs.readFileSync(mjmlPath, 'utf8');
    return { content };
  }

  @UseGuards(JwtAuthGuard, RbacGuard)
  @RequirePermissions('settings:write')
  @Post('admin/templates/:name/save')
  async saveTemplate(@Param('name') name: string, @Body() body: { content: string }) {
    const mjmlPath = path.join(MJML_SCREENS_DIR, `${name}.mjml`);

    // Ensure dir exists
    if (!fs.existsSync(MJML_SCREENS_DIR)) fs.mkdirSync(MJML_SCREENS_DIR, { recursive: true });

    fs.writeFileSync(mjmlPath, body.content, 'utf8');
    TemplateService.resetCache(name);

    return { success: true };
  }

  @UseGuards(JwtAuthGuard, RbacGuard)
  @RequirePermissions('settings:read')
  @Post('admin/templates/:name/preview')
  async previewTemplate(@Param('name') name: string, @Req() req: any) {
    try {
      this.logger.debug(`Preview requested for template: ${name}`);
      const data = req.body || {};

      // Provide some standard mock data if empty
      const mockData = {
        ticket: { id: 'TCKT-1234', subject: 'Örnek Destek Talebi', priority: 'HIGH', url: 'http://localhost/tickets/TCKT-4321', first_message_snippet: 'Bu bir örnek mesajdır.' },
        customer: { first_name: 'John', full_name: 'John Doe', email: 'john@example.com' },
        agent: { first_name: 'Jane', full_name: 'Jane Smith' },
        sla: { first_response_deadline: new Date().toLocaleString() },
        ...data
      };

      // Fetch branding data for preview context
      const [
        companyName, logoUrl, address, phone, email,
        linkedin, twitter, facebook, instagram, pinterest,
        frontendUrl
      ] = await Promise.all([
        this.prisma.setting.findUnique({ where: { key: 'branding.company_name' } }).then(s => s?.value),
        this.prisma.setting.findUnique({ where: { key: 'branding.logo_url' } }).then(s => s?.value),
        this.prisma.setting.findUnique({ where: { key: 'branding.address' } }).then(s => s?.value),
        this.prisma.setting.findUnique({ where: { key: 'branding.phone' } }).then(s => s?.value),
        this.prisma.setting.findUnique({ where: { key: 'branding.email' } }).then(s => s?.value),
        this.prisma.setting.findUnique({ where: { key: 'branding.social_linkedin' } }).then(s => s?.value),
        this.prisma.setting.findUnique({ where: { key: 'branding.social_twitter' } }).then(s => s?.value),
        this.prisma.setting.findUnique({ where: { key: 'branding.social_facebook' } }).then(s => s?.value),
        this.prisma.setting.findUnique({ where: { key: 'branding.social_instagram' } }).then(s => s?.value),
        this.prisma.setting.findUnique({ where: { key: 'branding.social_pinterest' } }).then(s => s?.value),
        this.prisma.setting.findUnique({ where: { key: 'general.frontend_url' } }).then(s => s?.value),
      ]);

      const brandDefaults = {
        name: companyName || 'Aluplan',
        logo_url: logoUrl || '/logo.png',
        address: address || '',
        phone: phone || '',
        email: email || '',
        social_linkedin: linkedin || '',
        social_twitter: twitter || '',
        social_facebook: facebook || '',
        social_instagram: instagram || '',
        social_pinterest: pinterest || '',
        help_center_url: frontendUrl || 'https://help.aluplan.com',
      };

      // Force reset cache for preview to ensure manual file edits are reflected instantly
      TemplateService.resetCache(name);

      const compiled = TemplateService.compile(name, mockData, brandDefaults);
      return { success: true, subject: compiled.subject, html: compiled.html };
    } catch (error: any) {
      this.logger.error(`Preview compilation failed for "${name}": ${error.message}`, error.stack);
      // Temporarily include the actual error message to diagnose the 400 Bad Request
      throw new BadRequestException(`Compilation Error: ${error.message}. Name: ${name}. Internal Path: ${MJML_SCREENS_DIR}`);
    }
  }

  @UseGuards(JwtAuthGuard, RbacGuard)
  @RequirePermissions('settings:read')
  @Post('admin/provider/verify')
  async verifyProvider() {
    return this.emailService.healthCheck();
  }

  // ─── GMAIL OAUTH2 FLOW ────────────────────────────────────

  /**
   * Returns the Google OAuth2 consent URL.
   * Admin opens this URL in a new tab to authorize the app.
   */
  @UseGuards(JwtAuthGuard, RbacGuard)
  @RequirePermissions('settings:write')
  @Get('gmail/auth-url')
  async getGmailAuthUrl() {
    const url = await this.gmailProvider.buildAuthUrl();
    return { url };
  }

  /**
   * Google redirects here after user consent.
   * Exchanges authorization code for refresh_token and saves to DB.
   * Redirects admin to settings page with success/error indicator.
   */
  @Public()
  @Get('gmail/callback')
  async gmailOAuthCallback(@Query('code') code: string, @Query('error') error: string, @Res() res: Response) {
    // Frontend URL — settings page
    const frontendBase = process.env.FRONTEND_URL || 'http://localhost:3000';
    const settingsUrl = `${frontendBase}/admin/settings?tab=email`;

    if (error || !code) {
      return res.redirect(`${settingsUrl}&gmail_status=error&gmail_error=${encodeURIComponent(error || 'no_code')}`);
    }

    try {
      const { email } = await this.gmailProvider.handleCallback(code);
      return res.redirect(`${settingsUrl}&gmail_status=success&gmail_email=${encodeURIComponent(email)}`);
    } catch (err: any) {
      return res.redirect(`${settingsUrl}&gmail_status=error&gmail_error=${encodeURIComponent(err.message)}`);
    }
  }

}
