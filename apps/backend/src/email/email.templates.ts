import * as fs from 'fs';
import * as path from 'path';
import mjml2html = require('mjml');
import * as Handlebars from 'handlebars';

export interface EmailPayload {
  template: string;
  to: string;
  subject: string;
  data: any;
  priority?: number;
  delay?: number; // BullMQ delay in ms
}

export class TemplateService {
  private static cache: Map<string, Handlebars.TemplateDelegate> = new Map();
  // MJML files live in src/ not dist/. Resolve reliably from __dirname.
  private static mjmlDir = path.join(__dirname, '..', '..', 'src', 'email', 'templates', 'mjml');

  public static resetCache(templateName?: string) {
    if (templateName) {
      this.cache.delete(templateName);
    } else {
      this.cache.clear();
    }
  }

  public static compile(templateName: string, data: any, brandDefaults?: any): { html: string; text: string; subject: string } {
    let compiledTemplate = this.cache.get(templateName);

    if (!compiledTemplate) {
      const mjmlPath = path.join(this.mjmlDir, `${templateName}.mjml`);
      const basePath = path.join(this.mjmlDir, 'base.mjml');

      if (!fs.existsSync(mjmlPath)) {
        throw new Error(`Template formulation failed: ${mjmlPath} does not exist`);
      }

      let mjmlContent = '';
      const childContent = fs.readFileSync(mjmlPath, 'utf8');

      if (templateName !== 'base' && fs.existsSync(basePath)) {
        const baseContent = fs.readFileSync(basePath, 'utf8');
        // Simple slot replacement: Replace {{{content}}} with child template content
        // Note: Using triple braces in base.mjml for content slot
        mjmlContent = baseContent.replace('{{{content}}}', childContent);
      } else {
        mjmlContent = childContent;
      }

      const { html, errors } = mjml2html(mjmlContent, {
        beautify: false,
        minify: true,
        validationLevel: 'soft',
        filePath: basePath // Pass base path so mj-include resolves correctly
      });

      if (errors && errors.length > 0) {
        console.warn(`MJML Validation Warnings for ${templateName}:`, errors);
      }

      compiledTemplate = Handlebars.compile(html);
      this.cache.set(templateName, compiledTemplate);
    }

    // Global Brand Data fallback injected if missing
    const rawBrand = {
      name: 'Aluplan',
      help_center_url: 'https://help.aluplan.com',
      primary_color: '#0EA5E9',
      logo_url: '/logo.png',
      address: '',
      ...brandDefaults,
      ...data.brand
    };

    // Ensure absolute logo URL
    let absoluteLogoUrl = rawBrand.logo_url;
    if (absoluteLogoUrl && (absoluteLogoUrl.startsWith('/') || !absoluteLogoUrl.startsWith('http'))) {
      const baseUrl = rawBrand.help_center_url.endsWith('/')
        ? rawBrand.help_center_url.slice(0, -1)
        : rawBrand.help_center_url;
      const path = absoluteLogoUrl.startsWith('/') ? absoluteLogoUrl : `/${absoluteLogoUrl}`;
      absoluteLogoUrl = `${baseUrl}${path}`;
    }

    const brandData = {
      ...rawBrand,
      logo_url: absoluteLogoUrl
    };

    const renderContext = {
      ...data,
      brand: brandData,
      unsubscribe_url: data.unsubscribe_url || `${brandData.help_center_url}/unsubscribe?token=${data.userId || 'global'}`
    };

    return {
      html: compiledTemplate(renderContext),
      text: `Mesaj İçeriği: Lütfen bu e-postayı HTML destekleyen bir istemcide görüntüleyin.`, // Plain text fallback
      subject: data.dynamicSubject || `Aluplan Destek - Yeni Bildirim`
    };
  }
}
