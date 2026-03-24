import * as fs from 'fs';
import * as path from 'path';
// Robust MJML import to handle ESM/CJS interop crashes

// eslint-disable-next-line @typescript-eslint/no-require-imports
const mjmlModule = require('mjml');
const mjml2html = typeof mjmlModule === 'function' ? mjmlModule : (mjmlModule.default || mjmlModule);
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
  // Fixed paths: In monorepo, we need robust lookup.
  private static mjmlBaseDir: string = '';
  private static localesDir: string = '';
  private static readonly cache = new Map<string, string>(); // Raw MJML strings — two-pass rendering

  public static getMjmlBaseDir(): string {
    this.ensurePaths();
    return this.mjmlBaseDir;
  }

  public static getScreensDir(): string {
    return path.join(this.getMjmlBaseDir(), 'screens');
  }

  private static ensurePaths() {
    const cwd = process.cwd();
    // In monorepo, we need to handle both 'apps/backend' CWD and root CWD
    const backendRoot = cwd.endsWith('apps/backend') ? cwd : path.join(cwd, 'apps', 'backend');

    // Priority 1: Check __dirname/templates/mjml (likely in dist or local dev)
    const localMjml = path.join(__dirname, 'templates', 'mjml');
    const localLocales = path.join(__dirname, 'locales');

    // Priority 2: Check src relative to backendRoot
    const srcMjml = path.join(backendRoot, 'src', 'email', 'templates', 'mjml');
    const srcLocales = path.join(backendRoot, 'src', 'email', 'locales');

    this.mjmlBaseDir = fs.existsSync(localMjml) ? localMjml : srcMjml;
    this.localesDir = fs.existsSync(localLocales) ? localLocales : srcLocales;

    if (!fs.existsSync(this.mjmlBaseDir)) {
      console.warn(`[TEMPLATE-SERVICE] MJML Base Dir NOT FOUND: ${this.mjmlBaseDir}. Falling back to src path.`);
    }
  }


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
    this.ensurePaths();
    let mjmlContent = this.cache.get(templateName) ?? '';
    let mjmlPath = '';

    if (!mjmlContent) {
      if (templateName === 'raw' && data.mjml) {
        const rawContent = data.mjml.trim();
        const isFullMjml = rawContent.toLowerCase().startsWith('<mjml>');
        const layoutPath = path.join(this.mjmlBaseDir, 'layouts', 'base.mjml');
        mjmlPath = layoutPath;

        if (!isFullMjml && fs.existsSync(layoutPath)) {
          const baseContent = fs.readFileSync(layoutPath, 'utf8');
          mjmlContent = baseContent.replace('{{{content}}}', rawContent);
        } else {
          mjmlContent = rawContent;
        }
      } else {
        // Find template in screens/
        mjmlPath = path.join(this.mjmlBaseDir, 'screens', `${templateName}.mjml`);
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

      // Cache raw MJML string only — NOT compiled templates
      if (templateName !== 'raw') {
        this.cache.set(templateName, mjmlContent);
      }
    }

    // 1. Prepare Brand Context
    const rawBrand = {
      name: 'Aluplan',
      email: 'destek@aluplan.com', // [FIX] brand.email required by BaseEmailSchema
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

    try {
      // [FIX] Three-Pass Rendering:
      // Pass 1: Handlebars on raw MJML resolves {{#if brand.primary_color}} etc.
      // Pass 2: MJML compiles resolved content, evaluating <mj-include>.
      const resolvedMjml = Handlebars.compile(mjmlContent, { noEscape: true })(renderContext);

      const { html, errors } = mjml2html(resolvedMjml, {
        beautify: false,
        validationLevel: 'soft',
        filePath: mjmlPath || path.join(this.mjmlBaseDir, 'layouts', 'base.mjml')
      });

      if (errors && errors.length > 0) {
        const errorMsg = `MJML Compilation Errors for template "${templateName}": ${errors.map((e: any) => `[Line ${e.line}] ${e.message}`).join('; ')}`;
        console.warn(`[MJML-WARN] ${errorMsg}`);
        // We log but don't strictly throw if html is still generated, to avoid breaking mail delivery
        if (!html) throw new Error(errorMsg);
      }

      // Pass 3: Resolve variables coming from <mj-include> files
      const finalHtml = Handlebars.compile(html, { noEscape: true })(renderContext);

      // [PILLAR 5] High Quality Plain Text
      const textOutput = convert(finalHtml, {
        wordwrap: 130,
        selectors: [
          { selector: 'a', options: { hideLinkHrefIfSameAsText: true } },
          { selector: 'img', format: 'skip' }
        ]
      });

      return {
        html: finalHtml,
        text: textOutput,
        subject: data.dynamicSubject || `Aluplan Destek - Yeni Bildirim`
      };
    } catch (e: any) {
      console.error(`[TEMPLATE-SERVICE] CRITICAL FAILURE in ${templateName}:`, e.message);
      throw e;
    }
  }
}
