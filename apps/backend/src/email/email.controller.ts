import { Controller, Get, Post, Query, Body, Param, Res, HttpStatus, UseGuards, Req, NotFoundException, BadRequestException, Logger, UnauthorizedException } from '@nestjs/common';
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
import * as crypto from 'crypto';
import { ConfigService } from '@nestjs/config';
import { normalizeEmailLogoUrl } from '../common/utils/public-url.util';
import { Prisma } from '@aluplan/database';


import { EmailInboundService } from './email-inbound.service';


@Controller('email')
export class EmailController {
  private readonly logger = new Logger(EmailController.name);

  private get screensDir() {
    return TemplateService.getScreensDir();
  }

  constructor(
    private readonly prisma: PrismaService,
    private readonly emailService: EmailService,
    private readonly gmailProvider: GmailProvider,
    private readonly emailInboundService: EmailInboundService,
    private readonly configService: ConfigService,
  ) { }

  @UseGuards(JwtAuthGuard, RbacGuard)
  @RequirePermissions('settings:read')
  @Post('admin/imap/verify')
  async verifyImap() {
    return this.emailInboundService.verifyImap();
  }

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
  async resendWebhook(@Req() req: any, @Body() payload: any, @Res() res: Response) {
    const webhookSecret = process.env.RESEND_WEBHOOK_SECRET;

    if (!webhookSecret) {
      return res.status(HttpStatus.UNAUTHORIZED).send('Webhook secret is not configured');
    }

    try {
      const svixId = req.headers['svix-id'] as string;
      const svixTimestamp = req.headers['svix-timestamp'] as string;
      const svixSignature = req.headers['svix-signature'] as string;

      if (!svixId || !svixTimestamp || !svixSignature) {
        return res.status(HttpStatus.UNAUTHORIZED).send();
      }

      const rawBody = req.rawBody ? req.rawBody.toString('utf8') : JSON.stringify(payload);
      const signedContent = `${svixId}.${svixTimestamp}.${rawBody}`;
      const secretBytes = Buffer.from(webhookSecret.split('_')[1] || webhookSecret, 'base64');
      const expectedSignature = crypto.createHmac('sha256', secretBytes).update(signedContent).digest('base64');

      const passedSignatures = svixSignature.split(' ').map(s => s.split(',')[1]);
      const isValid = passedSignatures.some(sig => {
        if (!sig || sig.length !== expectedSignature.length) return false;
        return crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(expectedSignature));
      });

      if (!isValid) {
        return res.status(HttpStatus.UNAUTHORIZED).send();
      }
    } catch (err) {
      return res.status(HttpStatus.UNAUTHORIZED).send();
    }

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
  async unsubscribe(@Body() body: { token: string; reason?: string; comment?: string }, @Req() req: any) {
    if (!body.token || typeof body.token !== 'string') {
      return { success: false, message: 'Invalid token' };
    }

    if (body.token === 'global') {
      return { success: false, message: 'Global token cannot be unsubscribed' };
    }

    let userId: string;

    try {
      const parts = body.token.split('.');
      if (parts.length !== 2) {
        throw new Error('Invalid token format');
      }

      userId = Buffer.from(parts[0], 'base64').toString('utf8');
      const signature = parts[1];

      const expectedSignature = crypto.createHmac('sha256', process.env.JWT_SECRET || 'fallback-secret')
        .update(userId)
        .digest('hex');

      if (signature !== expectedSignature) {
        throw new Error('Invalid signature');
      }
    } catch (error) {
      throw new UnauthorizedException('Invalid or expired unsubscribe token');
    }

    if (!userId) {
      return { success: false, message: 'Invalid user' };
    }

    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { email: true },
    });

    const reason = typeof body.reason === 'string' && body.reason.trim()
      ? body.reason.trim().slice(0, 80)
      : null;
    const comment = typeof body.comment === 'string' && body.comment.trim()
      ? body.comment.trim().slice(0, 1000)
      : null;
    const userAgent = typeof req.headers?.['user-agent'] === 'string'
      ? req.headers['user-agent'].slice(0, 1000)
      : null;
    const ipAddress = typeof req.ip === 'string'
      ? req.ip.slice(0, 100)
      : null;

    await this.prisma.$transaction([
      // Disable all email notification types for this user.
      this.prisma.emailPreference.upsert({
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
      }),
      this.prisma.$executeRaw(Prisma.sql`
        INSERT INTO "email_unsubscribe_feedbacks" (
          "user_id",
          "email",
          "reason",
          "comment",
          "user_agent",
          "ip_address"
        )
        VALUES (
          ${userId}::uuid,
          ${user?.email ?? null},
          ${reason},
          ${comment},
          ${userAgent},
          ${ipAddress}
        )
      `)
    ]);

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
    if (!fs.existsSync(this.screensDir)) return { templates: [] };

    const files = fs.readdirSync(this.screensDir)
      .filter(f => f.endsWith('.mjml'))
      .map(f => f.replace('.mjml', ''));

    return { templates: files };
  }

  @UseGuards(JwtAuthGuard, RbacGuard)
  @RequirePermissions('settings:read')
  @Get('admin/templates/:name/source')
  async getTemplateSource(@Param('name') name: string) {
    const mjmlPath = path.join(this.screensDir, `${name}.mjml`);
    if (!fs.existsSync(mjmlPath)) throw new NotFoundException('Template not found');

    const content = fs.readFileSync(mjmlPath, 'utf8');
    return { content };
  }

  @UseGuards(JwtAuthGuard, RbacGuard)
  @RequirePermissions('settings:write')
  @Post('admin/templates/:name/save')
  async saveTemplate(@Param('name') name: string, @Body() body: { content: string }) {
    const mjmlPath = path.join(this.screensDir, `${name}.mjml`);

    // Ensure dir exists
    if (!fs.existsSync(this.screensDir)) fs.mkdirSync(this.screensDir, { recursive: true });

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
        frontendUrl,
        apiUrlSetting
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
        this.prisma.setting.findUnique({ where: { key: 'general.api_url' } }).then(s => s?.value),
      ]);

      const nodeEnv = this.configService.get<string>('nodeEnv') || process.env.NODE_ENV;
      const apiBaseUrl = apiUrlSetting || this.configService.get<string>('apiUrl') || (nodeEnv === 'production' ? 'https://api.allplan.net.tr/api/v1' : 'http://localhost:4000/api/v1');

      const brandDefaults = {
        name: companyName || 'Aluplan',
        logo_url: normalizeEmailLogoUrl(logoUrl || '/logo.png', {
          apiBaseUrl,
          frontendUrl,
          nodeEnv,
          warn: (message) => this.logger.warn(message),
        }),
        api_base_url: apiBaseUrl,
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
      throw new BadRequestException(`Compilation Error: ${error.message}. Name: ${name}. Internal Path: ${this.screensDir}`);
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
