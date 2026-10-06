import { Injectable, Logger } from '@nestjs/common';
import * as cheerio from 'cheerio';
import axios from 'axios';
import * as crypto from 'crypto';
import { ConfigService } from '@nestjs/config';
import { LearnNowRequestPacer } from './learnnow-request-pacer.service';
import { OutboundUrlSafetyService } from './outbound-url-safety.service';

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

type LearnNowVideoTranscript = {
    videoId: string;
    title?: string;
    language?: string;
    label?: string;
    sourceUrl?: string;
    text: string;
};

const HTML_RESPONSE_LIMIT_BYTES = 2 * 1024 * 1024;
const JSON_RESPONSE_LIMIT_BYTES = 2 * 1024 * 1024;
const TRANSCRIPT_RESPONSE_LIMIT_BYTES = 4 * 1024 * 1024;

@Injectable()
export class CrawlService {
    private readonly logger = new Logger(CrawlService.name);
    constructor(
        private readonly config: ConfigService,
        private readonly learnNowPacer: LearnNowRequestPacer,
        private readonly urlSafety: OutboundUrlSafetyService,
    ) {}

    async fetch(url: string): Promise<CrawlResult> {
        this.logger.log(`🌐 Crawling URL: ${url}`);

        if (this.isLearnNowHowtoUrl(url)) {
            try {
                await this.urlSafety.validateLearnNowUrl(url);
                return await this.fetchLearnNowHowto(url);
            } catch (error: any) {
                this.logger.warn(`⚠️ Learn Now API extraction failed (${error.message}); generic browser fallback is disabled: ${url}`);
                throw error;
            }
        }

        if (this.isCrawl4AiEnabled()) {
            try {
                return await this.fetchWithCrawl4Ai(url);
            } catch (error: any) {
                this.logger.warn(`⚠️ Crawl4AI failed (${error.message}), falling back to bounded static fetch: ${url}`);
            }
        }

        let html: string;

        try {
            // 1. Try static fetch first (faster)
            this.logger.log(`🔍 Attempting static fetch for: ${url}`);
            const response = await this.getWithSafeRedirects<string>(url, 'public', {
                timeout: 10000,
                headers: { 'User-Agent': 'Mozilla/5.0 AluplanSupportBot/1.0' },
                maxContentLength: HTML_RESPONSE_LIMIT_BYTES,
                maxBodyLength: HTML_RESPONSE_LIMIT_BYTES,
            });
            html = response.data;
            this.logger.log(`📥 Static fetch successful, length: ${html.length}`);

            // 2. Check if it's a SPA or needs JS (simplistic check)
            if (html.includes('app-root') || html.includes('id="root"') || html.length < 1000) {
                throw new Error('Dynamic public page could not be rendered because Crawl4AI is unavailable');
            }
        } catch (error) {
            throw error;
        }

        const { content, title } = this.extractContent(html);
        const hash = crypto.createHash('sha256').update(content).digest('hex');

        return {
            content,
            title,
            hash,
            isDynamic: false,
            provider: 'basic',
            links: this.extractHtmlLinks(html, url),
            images: this.extractHtmlImages(html, url),
        };
    }

    private isCrawl4AiEnabled(): boolean {
        if (this.config.get<string>('NODE_ENV') === 'production') {
            return false;
        }
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

    private async fetchWithCrawl4Ai(url: string): Promise<CrawlResult> {
        // Revalidate immediately before non-production delegation. Production
        // use stays fail-closed until the sidecar has redirect-aware private
        // network egress controls of its own.
        await this.urlSafety.validatePublicHttpsUrl(url);
        const baseUrl = this.getCrawl4AiBaseUrl();
        if (!baseUrl) {
            throw new Error('CRAWL4AI_BASE_URL is not configured');
        }

        const headers: Record<string, string> = { 'Content-Type': 'application/json' };
        const token = this.config.get<string>('CRAWL4AI_API_TOKEN');
        if (token) headers.Authorization = `Bearer ${token}`;

        const response = await fetch(`${baseUrl}/crawl`, {
            method: 'POST',
            headers,
            body: JSON.stringify({
                urls: [url],
                browser_config: {
                    type: 'BrowserConfig',
                    params: { headless: true },
                },
                crawler_config: {
                    type: 'CrawlerRunConfig',
                    params: { stream: false, cache_mode: 'bypass' },
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

    private async fetchLearnNowHowto(url: string): Promise<CrawlResult> {
        const resourceId = this.extractLearnNowResourceId(url);
        if (!resourceId) {
            throw new Error('Learn Now resource id is missing');
        }

        const cookies = new Map<string, string>();
        const headers = { 'User-Agent': 'Mozilla/5.0 AluplanSupportBot/1.0' };

        const sessionResponse = await this.getWithSafeRedirects<string>('https://learnnow.allplan.com/int', 'learnnow', {
            timeout: 15000,
            beforeRedirect: (options: { protocol?: string; hostname?: string; host?: string }) => this.assertSafeLearnNowRedirect(options),
            headers,
            maxContentLength: HTML_RESPONSE_LIMIT_BYTES,
            maxBodyLength: HTML_RESPONSE_LIMIT_BYTES,
        });
        this.collectSetCookies(sessionResponse.headers?.['set-cookie'], cookies);

        const detailResponse = await this.getWithSafeRedirects<string>(url, 'learnnow', {
            timeout: 15000,
            beforeRedirect: (options: { protocol?: string; hostname?: string; host?: string }) => this.assertSafeLearnNowRedirect(options),
            headers: {
                ...headers,
                Cookie: this.serializeCookies(cookies),
            },
            maxContentLength: HTML_RESPONSE_LIMIT_BYTES,
            maxBodyLength: HTML_RESPONSE_LIMIT_BYTES,
        });
        this.collectSetCookies(detailResponse.headers?.['set-cookie'], cookies);

        const sesskey = this.extractTotaraSesskey(detailResponse.data);
        if (!sesskey) {
            throw new Error('Learn Now sesskey not found');
        }

        const language = this.extractLearnNowLanguage(detailResponse.data) || this.inferLanguageFromUrl(url);
        const apiUrl = `https://learnnow.allplan.com/totara/webapi/ajax.php?operation=engage_howto_get_howto&lang=${encodeURIComponent(language)}`;
        const apiValidation = await this.urlSafety.validateLearnNowUrl(apiUrl);
        await this.learnNowPacer.waitForTurn();
        const apiResponse = await axios.post(
            apiUrl,
            {
                operationName: 'engage_howto_get_howto',
                variables: { id: resourceId },
                extensions: {},
            },
            {
                timeout: 20000,
                maxRedirects: 0,
                beforeRedirect: options => this.assertSafeLearnNowRedirect(options),
                maxContentLength: JSON_RESPONSE_LIMIT_BYTES,
                maxBodyLength: JSON_RESPONSE_LIMIT_BYTES,
                httpsAgent: apiValidation.httpsAgent,
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

        const videoId = this.extractLearnNowVideoId(howto, detailResponse.data);
        const videoTranscript = videoId ? await this.fetchVimeoTranscript(videoId).catch((error: any) => {
            this.logger.warn(`⚠️ Vimeo transcript extraction failed for ${videoId}: ${error.message}`);
            return null;
        }) : null;
        const bodyText = this.htmlToCleanText(htmlContent);
        const content = this.buildLearnNowContent(title, howto, bodyText, videoTranscript);
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
                    hasVideoUrl: Boolean(howto.video_url || videoId),
                    vimeoVideoId: videoId,
                    transcriptStatus: videoId ? (videoTranscript ? 'AVAILABLE' : 'MISSING') : 'NOT_APPLICABLE',
                    transcriptLanguage: videoTranscript?.language ?? null,
                    transcriptLabel: videoTranscript?.label ?? null,
                    transcriptLength: videoTranscript?.text.length ?? 0,
                    vimeoTitle: videoTranscript?.title ?? null,
                    hasPdfUrl: Boolean(howto.pdf_url),
                    imageCount: images.length,
                },
            },
        };
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

    private assertSafeLearnNowRedirect(options: { protocol?: string; hostname?: string; host?: string }): void {
        const hostname = String(options.hostname ?? options.host ?? '').split(':')[0].toLowerCase();
        if (options.protocol !== 'https:' || hostname !== 'learnnow.allplan.com') {
            throw new Error('Learn Now redirects must remain on the public HTTPS Learn Now host');
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

    private buildLearnNowContent(
        title: string,
        howto: any,
        bodyText: string,
        videoTranscript?: LearnNowVideoTranscript | null,
    ): string {
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
            videoTranscript ? '' : null,
            videoTranscript ? `Video Transcript (${videoTranscript.label || videoTranscript.language || 'unknown'}):` : null,
            videoTranscript?.text ?? null,
        ].filter((line): line is string => typeof line === 'string');

        return lines.join('\n').replace(/\n{3,}/g, '\n\n').trim();
    }

    private extractLearnNowVideoId(howto: any, html: string): string | null {
        const candidates = [
            howto?.vimeo_url,
            howto?.video_url,
            html.match(/player\.vimeo\.com\/video\/(\d+)/i)?.[1],
        ];

        for (const candidate of candidates) {
            if (candidate === null || candidate === undefined) continue;
            const value = String(candidate).trim();
            const match = value.match(/(?:vimeo\.com\/(?:video\/)?|player\.vimeo\.com\/video\/)?(\d{6,})/i);
            if (match) return match[1];
        }

        return null;
    }

    private async fetchVimeoTranscript(videoId: string): Promise<LearnNowVideoTranscript | null> {
        const configUrl = `https://player.vimeo.com/video/${videoId}/config`;
        const response = await this.getWithSafeRedirects<any>(configUrl, 'vimeo', {
            timeout: 15000,
            maxContentLength: JSON_RESPONSE_LIMIT_BYTES,
            maxBodyLength: JSON_RESPONSE_LIMIT_BYTES,
            headers: {
                'User-Agent': 'Mozilla/5.0 AluplanSupportBot/1.0',
                Referer: 'https://learnnow.allplan.com/',
            },
        });

        const tracks = Array.isArray(response.data?.request?.text_tracks)
            ? response.data.request.text_tracks
            : [];
        if (tracks.length === 0) return null;

        const track = tracks.find((item: any) => item?.default)
            ?? tracks.find((item: any) => item?.kind === 'subtitles')
            ?? tracks[0];
        if (!track?.url) return null;

        const transcriptUrl = new URL(String(track.url), configUrl).toString();
        const transcriptResponse = await this.getWithSafeRedirects<string>(transcriptUrl, 'vimeo', {
            timeout: 15000,
            maxContentLength: TRANSCRIPT_RESPONSE_LIMIT_BYTES,
            maxBodyLength: TRANSCRIPT_RESPONSE_LIMIT_BYTES,
            headers: { 'User-Agent': 'Mozilla/5.0 AluplanSupportBot/1.0' },
        });
        const text = this.vttToCleanText(transcriptResponse.data);
        if (text.length < 40) return null;

        return {
            videoId,
            title: typeof response.data?.video?.title === 'string' ? response.data.video.title : undefined,
            language: typeof track.lang === 'string' ? track.lang : undefined,
            label: typeof track.label === 'string' ? track.label : undefined,
            sourceUrl: transcriptUrl,
            text,
        };
    }

    private vttToCleanText(vtt: string): string {
        const seen = new Set<string>();
        const lines = vtt
            .replace(/\r/g, '')
            .split('\n')
            .map(line => line.trim())
            .filter(line => {
                if (!line) return false;
                if (/^WEBVTT/i.test(line)) return false;
                if (/^(Kind|Language):/i.test(line)) return false;
                if (/^\d+$/.test(line)) return false;
                if (/-->/i.test(line)) return false;
                if (/^NOTE\b/i.test(line)) return false;
                return true;
            })
            .map(line => line.replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim())
            .filter(Boolean)
            .filter(line => {
                if (seen.has(line)) return false;
                seen.add(line);
                return true;
            });

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

    private async getWithSafeRedirects<T>(
        initialUrl: string,
        policy: 'learnnow' | 'public' | 'vimeo',
        config: Record<string, unknown>,
    ): Promise<{ data: T; headers: Record<string, any>; status?: number }> {
        let currentUrl = initialUrl;
        for (let redirectCount = 0; redirectCount <= 5; redirectCount += 1) {
            let httpsAgent;
            if (policy === 'learnnow') {
                ({ httpsAgent } = await this.urlSafety.validateLearnNowUrl(currentUrl));
                await this.learnNowPacer.waitForTurn();
            } else if (policy === 'vimeo') {
                ({ httpsAgent } = await this.urlSafety.validateVimeoUrl(currentUrl));
            } else {
                ({ httpsAgent } = await this.urlSafety.validatePublicHttpsUrl(currentUrl));
            }

            const response = await axios.get<T>(currentUrl, {
                ...config,
                httpsAgent,
                maxRedirects: 0,
                validateStatus: status => status >= 200 && status < 400,
            });
            const status = response.status ?? 200;
            const location = response.headers?.location;
            if (status < 300 || status >= 400 || !location) return response as any;
            currentUrl = new URL(String(location), currentUrl).toString();
        }
        throw new Error('Too many outbound redirects');
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

}
