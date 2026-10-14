import * as cheerio from 'cheerio';
import * as crypto from 'crypto';
import * as fs from 'fs';
import * as path from 'path';

const TEMPLATE_NAME_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const MJML_INCLUDE_TAG_PATTERN = /<\s*mj-include\b(?:[^>"']|"[^"]*"|'[^']*')*>/gi;
const MJML_INCLUDE_PATH_ATTRIBUTE_PATTERN = /(?:^|\s)path\s*=/gi;

const isWithinDirectory = (rootDir: string, candidatePath: string): boolean => {
  const relativePath = path.relative(rootDir, candidatePath);
  return relativePath !== '..'
    && !relativePath.startsWith(`..${path.sep}`)
    && !path.isAbsolute(relativePath);
};

export const resolveScreenTemplatePath = (screensDir: string, templateName: string): string => {
  if (!TEMPLATE_NAME_PATTERN.test(templateName)) {
    throw new Error('Invalid email template name');
  }

  const resolvedScreensDir = path.resolve(screensDir);
  const templatePath = path.resolve(resolvedScreensDir, `${templateName}.mjml`);

  if (!isWithinDirectory(resolvedScreensDir, templatePath)) {
    throw new Error('Invalid email template name');
  }

  let templateEntryExists = false;
  try {
    fs.lstatSync(templatePath);
    templateEntryExists = true;
  } catch (error) {
    const errorCode = (error as NodeJS.ErrnoException).code;
    if (errorCode !== 'ENOENT') {
      throw new Error('Invalid email template name');
    }
  }

  if (templateEntryExists) {
    try {
      const realScreensDir = fs.realpathSync(resolvedScreensDir);
      const realTemplatePath = fs.realpathSync(templatePath);
      if (!isWithinDirectory(realScreensDir, realTemplatePath)) {
        throw new Error('Invalid email template name');
      }
    } catch {
      throw new Error('Invalid email template name');
    }
  }

  return templatePath;
};

export const writeScreenTemplateAtomically = (
  screensDir: string,
  templatePath: string,
  content: string,
): void => {
  const resolvedScreensDir = path.resolve(screensDir);
  const realScreensDir = fs.realpathSync(resolvedScreensDir);
  const resolvedTemplatePath = path.resolve(templatePath);
  const relativeTemplatePath = path.relative(resolvedScreensDir, resolvedTemplatePath);
  const realTemplatePath = path.join(realScreensDir, relativeTemplatePath);

  if (!isWithinDirectory(resolvedScreensDir, resolvedTemplatePath)
    || path.dirname(realTemplatePath) !== realScreensDir) {
    throw new Error('Invalid email template path');
  }

  const temporaryPath = path.join(
    realScreensDir,
    `.${path.basename(realTemplatePath)}.${crypto.randomBytes(16).toString('hex')}.tmp`,
  );
  let fileDescriptor: number | undefined;

  try {
    fileDescriptor = fs.openSync(
      temporaryPath,
      fs.constants.O_CREAT
        | fs.constants.O_EXCL
        | fs.constants.O_WRONLY
        | fs.constants.O_NOFOLLOW,
      0o600,
    );
    fs.writeFileSync(fileDescriptor, content, 'utf8');
    fs.fsyncSync(fileDescriptor);
    fs.closeSync(fileDescriptor);
    fileDescriptor = undefined;
    fs.renameSync(temporaryPath, realTemplatePath);
  } finally {
    if (fileDescriptor !== undefined) fs.closeSync(fileDescriptor);
    fs.rmSync(temporaryPath, { force: true });
  }
};

export const assertSafeMjmlIncludes = (
  content: string,
  sourceFilePath: string,
  trustedTemplateRoot: string,
): void => {
  const includeTags = content.match(MJML_INCLUDE_TAG_PATTERN) ?? [];
  for (const includeTag of includeTags) {
    const pathAttributes = includeTag.match(MJML_INCLUDE_PATH_ATTRIBUTE_PATTERN) ?? [];
    if (pathAttributes.length !== 1) {
      throw new Error('Unsafe MJML include path');
    }
  }

  const $ = cheerio.load(content, { xmlMode: true });
  const resolvedTrustedRoot = path.resolve(trustedTemplateRoot);
  const realTrustedRoot = fs.realpathSync(resolvedTrustedRoot);

  $('*').each((_, node) => {
    const element = node as unknown as {
      tagName?: string;
      name?: string;
      attribs?: Record<string, string>;
    };
    const tagName = (element.tagName ?? element.name ?? '').toLowerCase();
    if (tagName !== 'mj-include') return;

    const attributes = Object.entries(element.attribs ?? {});
    const includePath = attributes.find(([name]) => name.toLowerCase() === 'path')?.[1]?.trim();

    if (!includePath
      || includePath.includes('{')
      || includePath.includes('}')
      || includePath.includes('%')
      || includePath.includes('\\')
      || path.isAbsolute(includePath)
      || path.extname(includePath).toLowerCase() !== '.mjml') {
      throw new Error('Unsafe MJML include path');
    }

    const resolvedIncludePath = path.resolve(path.dirname(sourceFilePath), includePath);
    if (!isWithinDirectory(resolvedTrustedRoot, resolvedIncludePath) || !fs.existsSync(resolvedIncludePath)) {
      throw new Error('Unsafe MJML include path');
    }

    const realIncludePath = fs.realpathSync(resolvedIncludePath);
    if (!isWithinDirectory(realTrustedRoot, realIncludePath)) {
      throw new Error('Unsafe MJML include path');
    }
  });
};
