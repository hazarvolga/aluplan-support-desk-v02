import * as fs from 'fs';
import * as path from 'path';
import mjml2html from 'mjml';
import * as Handlebars from 'handlebars';
import { convert } from 'html-to-text';
import { BaseEmailSchema } from './contracts/base.contract';

export interface EmailPayload {
  template: string;
  to: string;
  subject: string;
  data: any;
  priority?: number;
  delay?: number;
  jobId?: string;
}

export class TemplateService {
  private static cache: Map<string, Handlebars.TemplateDelegate> = new Map();
  private static mjmlBaseDir = path.join(__dirname, '..', '..', 'src', 'email', 'templates', 'mjml');
  private static localesDir = path.join(__dirname, '..', '..', 'src', 'email', 'locales');

  public static resetCache(templateName?: string) {
    if (templateName) {
      this.cache.delete(templateName);
    } else {
      this.cache.clear();
    }
  }

  private static loadLocale(lang: string = 'tr') {
    const localePath = path.join(this.localesDir, `${lang}.json`);
    if (!fs.existsSync(localePath)) return {};
    try {
      return JSON.parse(fs.readFileSync(localePath, 'utf8'));
    } catch {
      return {};
    }
  }

  public static compile(templateName: string, data: any, brandDefaults?: any): { html: string; text: string; subject: string } {
    let compiledTemplate = this.cache.get(templateName);

    if (!compiledTemplate) {
      let mjmlContent = '';

      if (templateName === 'raw' && data.mjml) {
        const rawContent = data.mjml.trim();
        const isFullMjml = rawContent.toLowerCase().startsWith('<mjml>');
        const layoutPath = path.join(this.mjmlBaseDir, 'layouts', 'base.mjml');

        if (!isFullMjml && fs.existsSync(layoutPath)) {
          const baseContent = fs.readFileSync(layoutPath, 'utf8');
          mjmlContent = baseContent.replace('{{{content}}}', rawContent);
        } else {
          mjmlContent = rawContent;
        }
      } else {
        // Find template in screens/
        const mjmlPath = path.join(this.mjmlBaseDir, 'screens', `${templateName}.mjml`);
        const layoutPath = path.join(this.mjmlBaseDir, 'layouts', 'base.mjml');

        if (!fs.existsSync(mjmlPath)) {
          throw new Error(`Template formulation failed: ${mjmlPath} does not exist`);
        }

        const childContent = fs.readFileSync(mjmlPath, 'utf8');

        // Hybrid Detection: If child already has <mjml> tag, don't wrap with base layout
        const isFullMjml = childContent.trim().toLowerCase().startsWith('<mjml>');

        if (!isFullMjml && templateName !== 'base' && fs.existsSync(layoutPath)) {
          const baseContent = fs.readFileSync(layoutPath, 'utf8');
          mjmlContent = baseContent.replace('{{{content}}}', childContent);
        } else {
          mjmlContent = childContent;
        }
      }

      const { html, errors } = mjml2html(mjmlContent, {
        beautify: false,
        minify: true,
        validationLevel: 'soft',
        filePath: path.join(this.mjmlBaseDir, 'layouts', 'base.mjml') // Important for mj-include resolution
      });

      if (errors && errors.length > 0) {
        console.warn(`MJML Validation Warnings for ${templateName}:`, errors);
      }

      compiledTemplate = Handlebars.compile(html);

      // Only cache named templates, not raw ones to avoid memory bloat
      if (templateName !== 'raw') {
        this.cache.set(templateName, compiledTemplate);
      }
    }

    // 1. Prepare Brand Context
    const rawBrand = {
      name: 'Aluplan',
      help_center_url: 'https://help.aluplan.com',
      primary_color: '#0EA5E9',
      logo_url: '/logo.png',
      address: '',
      ...brandDefaults,
      ...data.brand
    };

    // 2. Load Translations
    const t = this.loadLocale(data.locale || 'tr');

    // 3. Absolute URL Logic
    let absoluteLogoUrl = rawBrand.logo_url;
    if (absoluteLogoUrl && (absoluteLogoUrl.startsWith('/') || !absoluteLogoUrl.startsWith('http'))) {
      const baseUrl = rawBrand.help_center_url.endsWith('/') ? rawBrand.help_center_url.slice(0, -1) : rawBrand.help_center_url;
      const cleanPath = absoluteLogoUrl.startsWith('/') ? absoluteLogoUrl : `/${absoluteLogoUrl}`;
      absoluteLogoUrl = `${baseUrl}${cleanPath}`;
    }

    const brandData = { ...rawBrand, logo_url: absoluteLogoUrl };

    // 4. Final Context Construction
    const renderContext = {
      ...data,
      brand: brandData,
      t: t,
      unsubscribe_url: data.unsubscribe_url || `${brandData.help_center_url}/unsubscribe?token=${data.userId || 'global'}`,
      // Normalize common variables
      ticketId: data.ticketNumber || data.ticketId || '-',
      ticketPriorityLow: (data.ticketPriority || data.priority || 'medium').toLowerCase(),
      ticketSubject: data.ticketSubject || data.subject || '',
    };

    // 5. [PILLAR 2] - Contract Validation (Soft validation for now to avoid crashing, but logging issues)
    const validationResult = BaseEmailSchema.safeParse(renderContext);
    if (!validationResult.success) {
      console.error(`[CTO-AUDIT] Context Data Contract Violation in ${templateName}:`, validationResult.error.format());
    }

    const htmlOutput = compiledTemplate(renderContext);

    // 6. [PILLAR 5] - High Quality Plane Text
    const textOutput = convert(htmlOutput, {
      wordwrap: 130,
      selectors: [
        { selector: 'a', options: { hideLinkHrefIfSameAsText: true } },
        { selector: 'img', format: 'skip' }
      ]
    });

    return {
      html: htmlOutput,
      text: textOutput,
      subject: data.dynamicSubject || `Aluplan Destek - Yeni Bildirim`
    };
  }
}
