import { Injectable, Logger } from '@nestjs/common';
import { chromium, Browser } from 'playwright';
import * as cheerio from 'cheerio';
import axios from 'axios';
import * as crypto from 'crypto';
import { ConfigService } from '@nestjs/config';

export interface CrawlResult {
    content: string;
    title: string;
    hash: string;
    isDynamic: boolean;
    provider?: 'basic' | 'crawl4ai' | 'learnnow-api';
    metadata?: Record<string, unknown>;
    links?: string[];
    images?: CrawledImage[];
}

export interface CrawledImage {
    url: string;
    alt?: string;
    title?: string;
    caption?: string;
    width?: number;
    height?: number;
}

@Injectable()
export class CrawlService {
    private readonly logger = new Logger(CrawlService.name);
    private browser: Browser | null = null;

    constructor(private readonly config: ConfigService) {}

    async fetch(url: string): Promise<CrawlResult> {
        this.logger.log(`🌐 Crawling URL: ${url}`);

        if (this.isLearnNowHowtoUrl(url)) {
            try {
                return await this.fetchLearnNowHowto(url);
            } catch (error: any) {
                this.logger.warn(`⚠️ Learn Now API extraction failed (${error.message}), falling back to crawler stack: ${url}`);
            }
        }

        if (this.isCrawl4AiEnabled()) {
            try {
                return await this.fetchWithCrawl4Ai(url);
            } catch (error: any) {
                this.logger.warn(`⚠️ Crawl4AI failed (${error.message}), falling back to basic crawler: ${url}`);
            }
        }

        let html: string;
        let isDynamic = false;

        try {
            // 1. Try static fetch first (faster)
            this.logger.log(`🔍 Attempting static fetch for: ${url}`);
            const response = await axios.get(url, {
                timeout: 10000,
                headers: { 'User-Agent': 'Mozilla/5.0 AluplanSupportBot/1.0' }
            });
            html = response.data;
            this.logger.log(`📥 Static fetch successful, length: ${html.length}`);

            // 2. Check if it's a SPA or needs JS (simplistic check)
            if (html.includes('app-root') || html.includes('id="root"') || html.length < 1000) {
                this.logger.log(`⚡ Site looks dynamic or too small, switching to Playwright: ${url}`);
                html = await this.fetchWithPlaywright(url);
                isDynamic = true;
            }
        } catch (error) {
            this.logger.warn(`⚠️ Static fetch failed (${error.message}), trying Playwright: ${url}`);
            html = await this.fetchWithPlaywright(url);
            isDynamic = true;
        }

        const { content, title } = this.extractContent(html);
        const hash = crypto.createHash('sha256').update(content).digest('hex');

        return {
            content,
            title,
            hash,
            isDynamic,
            provider: 'basic',
            links: this.extractHtmlLinks(html, url),
            images: this.extractHtmlImages(html, url),
        };
    }

    private isCrawl4AiEnabled(): boolean {
        const rawValue = this.config.get<string | boolean>('CRAWL4AI_ENABLED');
        const enabled = typeof rawValue === 'boolean'
            ? rawValue
            : String(rawValue ?? '').toLowerCase() === 'true';

        return enabled && !!this.getCrawl4AiBaseUrl();
    }

    private getCrawl4AiBaseUrl(): string | null {
        const value = this.config.get<string>('CRAWL4AI_BASE_URL');
        return value ? value.replace(/\/+$/, '') : null;
    }

    private async fetchLearnNowHowto(url: string): Promise<CrawlResult> {
        const resourceId = this.extractLearnNowResourceId(url);
        if (!resourceId) {
            throw new Error('Learn Now resource id is missing');
        }

        const cookies = new Map<string, string>();
        const headers = { 'User-Agent': 'Mozilla/5.0 AluplanSupportBot/1.0' };

        const sessionResponse = await axios.get<string>('https://learnnow.allplan.com/int', {
            timeout: 15000,
            maxRedirects: 5,
            headers,
        });
        this.collectSetCookies(sessionResponse.headers?.['set-cookie'], cookies);

        const detailResponse = await axios.get<string>(url, {
            timeout: 15000,
            maxRedirects: 5,
            headers: {
                ...headers,
                Cookie: this.serializeCookies(cookies),
            },
        });
        this.collectSetCookies(detailResponse.headers?.['set-cookie'], cookies);

        const sesskey = this.extractTotaraSesskey(detailResponse.data);
        if (!sesskey) {
            throw new Error('Learn Now sesskey not found');
        }

        const language = this.extractLearnNowLanguage(detailResponse.data) || this.inferLanguageFromUrl(url);
        const apiResponse = await axios.post(
            `https://learnnow.allplan.com/totara/webapi/ajax.php?operation=engage_howto_get_howto&lang=${encodeURIComponent(language)}`,
            {
                operationName: 'engage_howto_get_howto',
                variables: { id: resourceId },
                extensions: {},
            },
            {
                timeout: 20000,
                headers: {
                    ...headers,
                    Accept: '*/*',
                    'Content-Type': 'application/json',
                    'X-Totara-Sesskey': sesskey,
                    Cookie: this.serializeCookies(cookies),
                    Referer: url,
                },
            },
        );

        const howto = apiResponse.data?.data?.howto;
        if (!howto?.resource?.name) {
            throw new Error('Learn Now API returned no howto resource');
        }

        const title = String(howto.resource.name).trim();
        const htmlContent = [
            howto.salesforce_content,
            howto.content,
            howto.description,
            howto.short_description,
        ].filter((value): value is string => typeof value === 'string' && value.trim().length > 0).join('\n\n');

        const bodyText = this.htmlToCleanText(htmlContent);
        const content = this.buildLearnNowContent(title, howto, bodyText);
        if (content.length < 80) {
            throw new Error('Learn Now API returned too-short content');
        }

        const images = this.extractHtmlImages(htmlContent, url);
        const links = this.extractHtmlLinks(htmlContent, url);
        const hash = crypto.createHash('sha256').update(content).digest('hex');

        return {
            content,
            title,
            hash,
            isDynamic: true,
            provider: 'learnnow-api',
            links,
            images,
            metadata: {
                learnNow: {
                    resourceId,
                    howtoId: howto.id,
                    type: howto.type,
                    language: howto.language,
                    countrySettings: howto.country_settings ?? [],
                    versions: howto.versions ?? [],
                    categories: howto.categories ?? [],
                    humanReadableCategories: howto.human_readable_categories ?? [],
                    salesforceNumber: howto.salesforce_number ?? null,
                    hasSalesforceContent: Boolean(howto.salesforce_content),
                    hasVideoUrl: Boolean(howto.video_url),
                    hasPdfUrl: Boolean(howto.pdf_url),
                    imageCount: images.length,
                },
            },
        };
    }

    private async fetchWithCrawl4Ai(url: string): Promise<CrawlResult> {
        const baseUrl = this.getCrawl4AiBaseUrl();
        if (!baseUrl) {
            throw new Error('CRAWL4AI_BASE_URL is not configured');
        }

        const headers: Record<string, string> = { 'Content-Type': 'application/json' };
        const token = this.config.get<string>('CRAWL4AI_API_TOKEN');
        if (token) {
            headers.Authorization = `Bearer ${token}`;
        }

        const response = await fetch(`${baseUrl}/crawl`, {
            method: 'POST',
            headers,
            body: JSON.stringify({
                urls: [url],
                browser_config: {
                    type: 'BrowserConfig',
                    params: {
                        headless: true,
                    },
                },
                crawler_config: {
                    type: 'CrawlerRunConfig',
                    params: {
                        stream: false,
                        cache_mode: 'bypass',
                    },
                },
            }),
            signal: AbortSignal.timeout(Number(this.config.get('CRAWL4AI_TIMEOUT_MS') || 45000)),
        });

        if (!response.ok) {
            const text = await response.text().catch(() => '');
            throw new Error(`Crawl4AI HTTP ${response.status}${text ? `: ${text.slice(0, 300)}` : ''}`);
        }

        const payload = await response.json();
        const item = this.pickCrawl4AiResult(payload);
        const markdown = this.extractMarkdown(item);
        if (!markdown || markdown.trim().length < 50) {
            throw new Error('Crawl4AI returned empty or too-short markdown');
        }

        const title = this.extractCrawl4AiTitle(item, markdown);
        const content = markdown.trim();
        const hash = crypto.createHash('sha256').update(content).digest('hex');

        this.logger.log(`✅ Crawl4AI fetched markdown, length: ${content.length}`);

        return {
            content,
            title,
            hash,
            isDynamic: true,
            provider: 'crawl4ai',
            links: this.extractLinksFromText(content, url),
            images: this.extractMarkdownImages(content, url),
            metadata: {
                crawl4aiSuccess: item?.success,
                crawl4aiUrl: item?.url ?? url,
            },
        };
    }

    private pickCrawl4AiResult(payload: any): any {
        if (Array.isArray(payload)) return payload[0];
        if (Array.isArray(payload?.results)) return payload.results[0];
        if (Array.isArray(payload?.result)) return payload.result[0];
        if (Array.isArray(payload?.data)) return payload.data[0];
        return payload?.result ?? payload?.data ?? payload;
    }

    private extractMarkdown(item: any): string {
        const markdown = item?.markdown;
        if (typeof markdown === 'string') return markdown;
        if (markdown && typeof markdown === 'object') {
            return markdown.fit_markdown
                || markdown.raw_markdown
                || markdown.markdown_with_citations
                || markdown.markdown
                || '';
        }

        return item?.cleaned_html || item?.html || item?.text || '';
    }

    private extractCrawl4AiTitle(item: any, markdown: string): string {
        const metadataTitle = item?.metadata?.title || item?.title;
        if (typeof metadataTitle === 'string' && metadataTitle.trim()) {
            return metadataTitle.trim();
        }

        const firstHeading = markdown.split('\n').find(line => line.trim().startsWith('# '));
        return firstHeading?.replace(/^#\s+/, '').trim() || item?.url || 'Untitled Source';
    }

    extractLinksFromText(text: string, baseUrl: string): string[] {
        const links = new Set<string>();
        const markdownPattern = /\[[^\]]{1,300}\]\((https?:\/\/[^)\s]+|\/[^)\s]+)\)/gi;
        const rawUrlPattern = /https?:\/\/[^\s)<>"']+/gi;

        for (const match of text.matchAll(markdownPattern)) {
            const normalized = this.normalizeLink(match[1], baseUrl);
            if (normalized) links.add(normalized);
        }

        for (const match of text.matchAll(rawUrlPattern)) {
            const normalized = this.normalizeLink(match[0], baseUrl);
            if (normalized) links.add(normalized);
        }

        return Array.from(links);
    }

    private extractHtmlLinks(html: string, baseUrl: string): string[] {
        const $ = cheerio.load(html);
        const links = new Set<string>();
        $('a[href]').each((_, el) => {
            const normalized = this.normalizeLink(String($(el).attr('href') ?? ''), baseUrl);
            if (normalized) links.add(normalized);
        });
        return Array.from(links);
    }

    private extractHtmlImages(html: string, baseUrl: string): CrawledImage[] {
        const $ = cheerio.load(html);
        const images = new Map<string, CrawledImage>();

        $('img[src], img[data-src], img[data-original]').each((_, el) => {
            const $el = $(el);
            const src = String($el.attr('src') || $el.attr('data-src') || $el.attr('data-original') || '');
            const normalized = this.normalizeLink(src, baseUrl);
            if (!normalized) return;

            const caption = $el.closest('figure').find('figcaption').first().text().replace(/\s\s+/g, ' ').trim();
            images.set(normalized, {
                url: normalized,
                alt: String($el.attr('alt') || '').trim() || undefined,
                title: String($el.attr('title') || '').trim() || undefined,
                caption: caption || undefined,
                width: this.parseDimension($el.attr('width')),
                height: this.parseDimension($el.attr('height')),
            });
        });

        return Array.from(images.values());
    }

    private isLearnNowHowtoUrl(value: string): boolean {
        try {
            const url = new URL(value);
            return url.hostname === 'learnnow.allplan.com'
                && url.pathname.includes('/totara/engage/resources/howto/index.php')
                && Boolean(url.searchParams.get('id'));
        } catch {
            return false;
        }
    }

    private extractLearnNowResourceId(value: string): number | null {
        try {
            const id = Number.parseInt(new URL(value).searchParams.get('id') ?? '', 10);
            return Number.isFinite(id) && id > 0 ? id : null;
        } catch {
            return null;
        }
    }

    private collectSetCookies(rawSetCookie: string[] | string | undefined, jar: Map<string, string>): void {
        const values = Array.isArray(rawSetCookie) ? rawSetCookie : rawSetCookie ? [rawSetCookie] : [];
        for (const cookie of values) {
            const firstPart = cookie.split(';')[0];
            const separator = firstPart.indexOf('=');
            if (separator <= 0) continue;
            jar.set(firstPart.slice(0, separator).trim(), firstPart.slice(separator + 1).trim());
        }
    }

    private serializeCookies(jar: Map<string, string>): string {
        return Array.from(jar.entries()).map(([key, value]) => `${key}=${value}`).join('; ');
    }

    private extractTotaraSesskey(html: string): string | null {
        return html.match(/"sesskey":"([^"]+)"/)?.[1] ?? null;
    }

    private extractLearnNowLanguage(html: string): string | null {
        return html.match(/"currentlanguage":"([a-z]{2})"/i)?.[1]?.toLowerCase()
            ?? html.match(/<html[^>]+lang="([a-z]{2})"/i)?.[1]?.toLowerCase()
            ?? null;
    }

    private inferLanguageFromUrl(value: string): string {
        const match = value.match(/learnnow\.allplan\.com\/([a-z]{2})(?:\/|$)/i);
        return match?.[1]?.toLowerCase() ?? 'en';
    }

    private buildLearnNowContent(title: string, howto: any, bodyText: string): string {
        const lines = [
            title,
            '',
            `Learn Now Type: ${howto.type ?? 'unknown'}`,
            howto.language ? `Language: ${howto.language}` : null,
            Array.isArray(howto.versions) && howto.versions.length > 0 ? `Versions: ${howto.versions.join(', ')}` : null,
            Array.isArray(howto.human_readable_categories) && howto.human_readable_categories.length > 0
                ? `Categories: ${howto.human_readable_categories.join(' > ')}`
                : null,
            howto.salesforce_number ? `Salesforce Number: ${howto.salesforce_number}` : null,
            '',
            bodyText,
        ].filter((line): line is string => typeof line === 'string');

        return lines.join('\n').replace(/\n{3,}/g, '\n\n').trim();
    }

    private htmlToCleanText(html: string): string {
        if (!html.trim()) return '';
        const $ = cheerio.load(`<main>${html}</main>`);
        $('script, style, noscript').remove();
        $('br').replaceWith('\n');
        $('p, div, section, article, h1, h2, h3, h4, h5, h6, li, tr').each((_, el) => {
            $(el).prepend('\n');
            $(el).append('\n');
        });
        $('img').each((_, el) => {
            const alt = String($(el).attr('alt') || '').trim();
            $(el).replaceWith(alt ? `\n[Image: ${alt}]\n` : '\n[Image]\n');
        });

        return $('main').text()
            .replace(/\u00a0/g, ' ')
            .replace(/[ \t]+\n/g, '\n')
            .replace(/\n[ \t]+/g, '\n')
            .replace(/[ \t]{2,}/g, ' ')
            .replace(/\n{3,}/g, '\n\n')
            .trim();
    }

    private extractMarkdownImages(markdown: string, baseUrl: string): CrawledImage[] {
        const images = new Map<string, CrawledImage>();
        const imagePattern = /!\[([^\]]{0,300})\]\((https?:\/\/[^)\s]+|\/[^)\s]+)\)/gi;

        for (const match of markdown.matchAll(imagePattern)) {
            const normalized = this.normalizeLink(match[2], baseUrl);
            if (!normalized) continue;
            images.set(normalized, {
                url: normalized,
                alt: match[1]?.trim() || undefined,
            });
        }

        return Array.from(images.values());
    }

    private parseDimension(value: string | undefined): number | undefined {
        if (!value) return undefined;
        const parsed = Number.parseInt(value, 10);
        return Number.isFinite(parsed) && parsed > 0 ? parsed : undefined;
    }

    private normalizeLink(href: string, baseUrl: string): string | null {
        if (!href || href.startsWith('#') || /^mailto:|^tel:|^javascript:/i.test(href)) return null;
        try {
            const url = new URL(href, baseUrl);
            if (!['http:', 'https:'].includes(url.protocol)) return null;
            url.hash = '';
            return url.toString();
        } catch {
            return null;
        }
    }

    private async fetchWithPlaywright(url: string): Promise<string> {
        if (!this.browser) {
            const executablePath = process.env.CHROME_BIN || process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH;
            this.logger.log(`🚀 Launching browser (Path: ${executablePath || 'default'})...`);
            try {
                this.browser = await chromium.launch({
                    headless: true,
                    executablePath: executablePath || undefined,
                    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage']
                });
                this.logger.log(`✅ Browser launched successfully.`);
            } catch (err) {
                this.logger.error(`❌ Browser launch FAILED: ${err.message}`);
                throw err;
            }
        }
        const context = await this.browser.newContext();
        const page = await context.newPage();

        try {
            this.logger.log(`📄 Navigating to URL in Playwright...`);
            await page.goto(url, { waitUntil: 'networkidle', timeout: 30000 });
            const content = await page.content();
            this.logger.log(`✅ Content fetched via Playwright, length: ${content.length}`);
            return content;
        } catch (err) {
            this.logger.error(`❌ Playwright navigation FAILED: ${err.message}`);
            throw err;
        } finally {
            await page.close();
            await context.close();
        }
    }

    private extractContent(html: string): { content: string; title: string } {
        const $ = cheerio.load(html);

        // Remove boilerplate
        $('nav, footer, script, style, ad, .cookie-banner, #header, #footer').remove();

        const title = $('title').text() || $('h1').first().text() || 'Untitled Source';

        // Target main content areas if they exist
        const mainContent = $('main, #content, .article, .post, .main-content').first();
        const rawText = mainContent.length ? mainContent.text() : $('body').text();

        // Basic cleanup: remove excessive whitespace
        const cleanText = rawText.replace(/\s\s+/g, ' ').trim();

        return { content: cleanText, title };
    }

    async onModuleDestroy() {
        if (this.browser) {
            await this.browser.close();
        }
    }
}
