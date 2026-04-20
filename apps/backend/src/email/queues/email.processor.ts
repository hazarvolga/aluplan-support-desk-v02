import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { SettingsService } from '../../settings/settings.service';
import { ResendProvider } from '../resend.provider';
import { SmtpProvider } from '../smtp.provider';
import { GmailProvider } from '../gmail.provider';
import { EmailProvider } from '../interfaces/email-provider.interface';
import { TemplateService, EmailPayload } from '../email.templates';
import { ConfigService } from '@nestjs/config';


@Processor('email')
export class EmailProcessor extends WorkerHost {
  private readonly logger = new Logger(EmailProcessor.name);
  private provider: EmailProvider;

  constructor(
    private readonly prisma: PrismaService,
    private readonly settings: SettingsService,
    private readonly resend: ResendProvider,
    private readonly smtp: SmtpProvider,
    private readonly gmail: GmailProvider,
    private readonly configService: ConfigService,
  ) {
    super();
  }

  private async refreshProvider() {
    try {
      const providerName = (await this.settings.getValue('email.active_provider')) || 'resend';
      switch (providerName) {
        case 'smtp': this.provider = this.smtp; break;
        case 'gmail': this.provider = this.gmail; break;
        case 'resend':
        default: this.provider = this.resend; break;
      }
    } catch {
      this.provider = this.resend;
    }
  }

  async process(job: Job<EmailPayload & { logRef: string }, any, string>): Promise<any> {
    this.logger.debug(`Processing email job: ${job.id}`);
    const { template, to, subject, data, logRef } = job.data;
    await this.refreshProvider();

    try {
      // Fetch branding data to inject as defaults
      const [
        companyName, logoUrl, address, phone, email,
        linkedin, twitter, facebook, instagram, pinterest,
        frontendUrl, activeProvider, apiUrlSetting
      ] = await Promise.all([
        this.settings.getValue('branding.company_name'),
        this.settings.getValue('branding.logo_url'),
        this.settings.getValue('branding.address'),
        this.settings.getValue('branding.phone'),
        this.settings.getValue('branding.email'),
        this.settings.getValue('branding.social_linkedin'),
        this.settings.getValue('branding.social_twitter'),
        this.settings.getValue('branding.social_facebook'),
        this.settings.getValue('branding.social_instagram'),
        this.settings.getValue('branding.social_pinterest'),
        this.settings.getValue('general.frontend_url'),
        this.settings.getValue('email.active_provider'),
        this.settings.getValue('general.api_url'),
      ]);

      // Determine absolute base for API assets
      const envApiUrl = this.configService.get('apiUrl');
      const apiBaseUrl = apiUrlSetting || envApiUrl || frontendUrl || 'https://api.allplan.net.tr';
      const cleanApiBase = apiBaseUrl.endsWith('/') ? apiBaseUrl.slice(0, -1) : apiBaseUrl;

      let absoluteLogoUrl = logoUrl || '/logo.png';
      if (absoluteLogoUrl.startsWith('/')) {
        // If it's a branding asset proxy or a local asset
        const isProxyAsset = absoluteLogoUrl.startsWith('/api/v1/branding/assets');
        const base = isProxyAsset ? cleanApiBase : (frontendUrl || cleanApiBase);
        absoluteLogoUrl = `${base}${absoluteLogoUrl}`;
      }

      const brandDefaults = {
        name: companyName || 'Aluplan',
        logo_url: absoluteLogoUrl,
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

      const compiled = TemplateService.compile(template, data, brandDefaults);

      const result = await this.provider.send({
        to,
        subject: subject || compiled.subject,
        html: compiled.html,
        text: compiled.text
      });

      const providerEnum = (activeProvider?.toUpperCase() || 'RESEND') as any;

      if (logRef) {
        await this.prisma.emailLog.update({
          where: { id: logRef },
          data: {
            status: 'SENT',
            provider: providerEnum,
            messageId: result.messageId,
            sentAt: new Date()
          }
        });
      } else {
        await this.prisma.emailLog.create({
          data: {
            recipientEmail: Array.isArray(to) ? to.join(', ') : to,
            subject: compiled.subject || subject || 'No Subject',
            templateName: template,
            status: 'SENT',
            provider: providerEnum,
            messageId: result.messageId,
            sentAt: new Date()
          }
        });
      }

      this.logger.log(`Email successfully dispatched: ${job.id} - MsgId: ${result.messageId}`);
    } catch (error: any) {
      this.logger.error(`Failed to dispatch email job: ${job.id}`, error.stack);

      if (logRef) {
        await this.prisma.emailLog.update({
          where: { id: logRef },
          data: {
            status: 'FAILED',
            error: error.message
          }
        });
      } else {
        await this.prisma.emailLog.create({
          data: {
            recipientEmail: Array.isArray(to) ? to.join(', ') : to,
            subject: subject || 'No Subject',
            templateName: template,
            status: 'FAILED',
            error: error.message
          }
        });
      }

      // Pick up BullMQ retries mechanism
      throw error;
    }
  }
}
