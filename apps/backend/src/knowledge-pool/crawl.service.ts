import { Injectable, Logger } from '@nestjs/common';
import { chromium, Browser } from 'playwright';
import * as cheerio from 'cheerio';
import axios from 'axios';
import * as crypto from 'crypto';

export interface CrawlResult {
    content: string;
    title: string;
    hash: string;
    isDynamic: boolean;
}

@Injectable()
export class CrawlService {
    private readonly logger = new Logger(CrawlService.name);
    private browser: Browser | null = null;

    async fetch(url: string): Promise<CrawlResult> {
        this.logger.log(`🌐 Crawling URL: ${url}`);

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

        return { content, title, hash, isDynamic };
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
