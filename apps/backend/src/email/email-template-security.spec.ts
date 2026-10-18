import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';
import {
  assertSafeMjmlIncludes,
  resolveScreenTemplatePath,
  writeScreenTemplateAtomically,
} from './email-template-security';
import { TemplateService } from './email.templates';

describe('email template filesystem security', () => {
  let rootDir: string;
  let screensDir: string;
  let partialsDir: string;

  beforeEach(() => {
    rootDir = fs.mkdtempSync(path.join(os.tmpdir(), 'aluplan-email-template-'));
    screensDir = path.join(rootDir, 'screens');
    partialsDir = path.join(rootDir, 'partials');
    fs.mkdirSync(screensDir, { recursive: true });
    fs.mkdirSync(partialsDir, { recursive: true });
    fs.writeFileSync(path.join(partialsDir, 'header.mjml'), '<mj-section />');
  });

  afterEach(() => {
    fs.rmSync(rootDir, { recursive: true, force: true });
  });

  describe('resolveScreenTemplatePath', () => {
    it('resolves a normal kebab-case template name inside the screens directory', () => {
      expect(resolveScreenTemplatePath(screensDir, 'ticket-created')).toBe(
        path.join(screensDir, 'ticket-created.mjml'),
      );
    });

    it.each([
      '../outside',
      '..%2Foutside',
      '..\\outside',
      '/tmp/outside',
      'ticket-created.mjml',
      'ticket_created',
      '',
    ])('rejects an unsafe template name: %s', (name) => {
      expect(() => resolveScreenTemplatePath(screensDir, name)).toThrow(
        'Invalid email template name',
      );
    });

    it('rejects an existing screen symlink that resolves outside the screens directory', () => {
      const outsideFile = path.join(rootDir, 'outside.mjml');
      fs.writeFileSync(outsideFile, '<mj-section />');
      fs.symlinkSync(outsideFile, path.join(screensDir, 'linked.mjml'));

      expect(() => resolveScreenTemplatePath(screensDir, 'linked')).toThrow(
        'Invalid email template name',
      );
    });

    it('rejects a dangling screen symlink instead of following it during save', () => {
      fs.symlinkSync(path.join(rootDir, 'missing-outside.mjml'), path.join(screensDir, 'linked.mjml'));

      expect(() => resolveScreenTemplatePath(screensDir, 'linked')).toThrow(
        'Invalid email template name',
      );
    });
  });

  describe('writeScreenTemplateAtomically', () => {
    it('replaces a validated template without leaving a writable temporary file', () => {
      const templatePath = path.join(screensDir, 'ticket-created.mjml');
      fs.writeFileSync(templatePath, 'old');

      writeScreenTemplateAtomically(screensDir, templatePath, 'new');

      expect(fs.readFileSync(templatePath, 'utf8')).toBe('new');
      expect(fs.readdirSync(screensDir)).toEqual(['ticket-created.mjml']);
    });
  });

  describe('assertSafeMjmlIncludes', () => {
    const sourcePath = () => path.join(screensDir, 'ticket-created.mjml');

    it('allows a static MJML include that resolves inside the template root', () => {
      expect(() => assertSafeMjmlIncludes(
        '<mjml><mj-body><mj-include path="../partials/header.mjml" /></mj-body></mjml>',
        sourcePath(),
        rootDir,
      )).not.toThrow();
    });

    it.each([
      '<mj-include path="../../outside.mjml" />',
      '<MJ-INCLUDE PATH="&#x2e;&#x2e;/../outside.mjml" />',
      '<mj-include path="/etc/passwd" />',
      '<mj-include path="{{includePath}}" />',
      '<mj-include PATH="../partials/header.mjml" path="../../outside.mjml" />',
      '<mj-include path="../partials/header.mjml" path="../../outside.mjml" />',
      '<mj-include />',
    ])('rejects an unsafe or ambiguous include: %s', (includeTag) => {
      expect(() => assertSafeMjmlIncludes(
        `<mjml><mj-body>${includeTag}</mj-body></mjml>`,
        sourcePath(),
        rootDir,
      )).toThrow('Unsafe MJML include path');
    });

    it('rejects percent-encoding whose MJML-decoded path has different traversal semantics', () => {
      const encodedPath = path.join(screensDir, '%2e%2e', '%2e%2e');
      fs.mkdirSync(encodedPath, { recursive: true });
      fs.writeFileSync(path.join(encodedPath, 'outside.mjml'), '<mj-section />');

      expect(() => assertSafeMjmlIncludes(
        '<mjml><mj-body><mj-include path="%2e%2e/%2e%2e/outside.mjml" /></mj-body></mjml>',
        sourcePath(),
        rootDir,
      )).toThrow('Unsafe MJML include path');
    });

    it('rejects a symlink inside the template root that resolves outside it', () => {
      const outsideFile = path.join(path.dirname(rootDir), `${path.basename(rootDir)}-outside.mjml`);
      fs.writeFileSync(outsideFile, '<mj-section />');
      fs.symlinkSync(outsideFile, path.join(partialsDir, 'linked.mjml'));

      try {
        expect(() => assertSafeMjmlIncludes(
          '<mjml><mj-body><mj-include path="../partials/linked.mjml" /></mj-body></mjml>',
          sourcePath(),
          rootDir,
        )).toThrow('Unsafe MJML include path');
      } finally {
        fs.rmSync(outsideFile, { force: true });
      }
    });
  });

  describe('TemplateService enforcement', () => {
    it('rejects an unsafe template name before accessing the filesystem', () => {
      expect(() => TemplateService.compile('../outside', {})).toThrow(
        'Invalid email template name',
      );
    });

    it('rejects an MJML include injected during Handlebars rendering', () => {
      expect(() => TemplateService.compile('raw', {
        mjml: '<mjml><mj-body>{{{injectedContent}}}</mj-body></mjml>',
        injectedContent: '<mj-include path="/etc/passwd" />',
      })).toThrow('Unsafe MJML include path');
    });
  });
});
