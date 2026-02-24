import * as fs from 'fs';
import * as path from 'path';
import mjml2html from 'mjml';
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
  private static mjmlDir = path.join(__dirname, 'templates', 'mjml');

  public static compile(templateName: string, data: any): { html: string; text: string; subject: string } {
    let compiledTemplate = this.cache.get(templateName);

    if (!compiledTemplate) {
      const mjmlPath = path.join(this.mjmlDir, `${templateName}.mjml`);
      if (!fs.existsSync(mjmlPath)) {
        throw new Error(`Template formulation failed: ${mjmlPath} does not exist`);
      }

      const mjmlContent = fs.readFileSync(mjmlPath, 'utf8');
      const { html, errors } = mjml2html(mjmlContent, {
        beautify: false,
        minify: true,
        validationLevel: 'soft',
      });

      if (errors && errors.length > 0) {
        console.warn(`MJML Validation Warnings for ${templateName}:`, errors);
      }

      compiledTemplate = Handlebars.compile(html);
      this.cache.set(templateName, compiledTemplate);
    }

    // Global Brand Data fallback injected if missing
    const brandData = data.brand || {
      name: 'Aluplan',
      help_center_url: 'https://help.aluplan.com',
      primary_color: '#0EA5E9'
    };

    const renderContext = {
      ...data,
      brand: brandData,
      unsubscribe_url: `https://help.aluplan.com/unsubscribe?token=${data.customerId || 'global'}`
    };

    return {
      html: compiledTemplate(renderContext),
      text: `Mesaj İçeriği: Lütfen bu e-postayı HTML destekleyen bir istemcide görüntüleyin.`, // Plain text fallback
      subject: data.dynamicSubject || `Aluplan Destek - Yeni Bildirim`
    };
  }
}
