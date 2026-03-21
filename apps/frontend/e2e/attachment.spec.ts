import { test, expect } from '@playwright/test';
import path from 'path';
import fs from 'fs';

/**
 * ATTACHMENT / FILE UPLOAD E2E TEST (v8)
 * Verifying backend state directly if UI fails to show link.
 */

const BASE_API = 'http://localhost:4000/api/v1';

async function apiGet(url: string, token: string) {
    const res = await fetch(`${BASE_API}${url}`, {
        headers: { 'Authorization': `Bearer ${token}` }
    });
    if (!res.ok) throw new Error(`API GET ${url} failed`);
    return res.json();
}

async function apiPost(url: string, body: any, token?: string) {
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;
    const res = await fetch(`${BASE_API}${url}`, {
        method: 'POST',
        headers,
        body: JSON.stringify(body)
    });
    if (!res.ok) throw new Error(`API POST ${url} failed`);
    return res.json();
}

test.describe('Attachment Upload Flow', () => {
    const customerEmail = 'e2e-customer@aluplan.com';
    const customerPassword = 'Vol1872017';
    const testFileName = 'e2e-test-attachment.txt';
    const testFilePath = path.join('/tmp', testFileName);

    test.beforeAll(() => {
        fs.writeFileSync(testFilePath, 'This is a test attachment content for E2E.');
    });

    test.afterAll(() => {
        if (fs.existsSync(testFilePath)) fs.unlinkSync(testFilePath);
    });

    test('should upload and display attachment in ticket thread', async ({ page }) => {
        console.log('--- Setup: Creating ticket via API ---');
        const customerAuth = await apiPost('/auth/login', { email: customerEmail, password: customerPassword });
        const customerToken = customerAuth.access_token;

        const ticket = await apiPost('/tickets', {
            subject: `[E2E] Attachment Test - ${Date.now()}`,
            description: 'Original description.',
            priority: 'LOW',
        }, customerToken);
        const ticketId = ticket.id;

        console.log('--- UI: Customer login & navigation ---');
        await page.goto('/login');
        await page.getByTestId('login-email').fill(customerEmail);
        await page.getByTestId('login-password').fill(customerPassword);
        await page.getByTestId('login-submit').click();

        await page.waitForURL(/.*\/(my-tickets|dashboard)/, { timeout: 120000 });
        const locale = new URL(page.url()).pathname.split('/')[1];
        await page.goto(`/${locale}/tickets/${ticketId}`);
        await page.waitForURL(new RegExp(`tickets\/${ticketId}`));

        console.log('--- UI: Uploading file ---');
        const fileInput = page.locator('input[type="file"]');
        await fileInput.setInputFiles(testFilePath);
        await expect(page.getByText(testFileName, { exact: false })).toBeVisible({ timeout: 10000 });

        console.log('--- UI: Filling message and clicking SEND ---');
        const textarea = page.locator('textarea[placeholder*="message"]');
        const messageToType = `Attachment Test Message ${Date.now()}`;
        await textarea.fill(messageToType);
        await page.getByRole('button').filter({ has: page.locator('svg.lucide-send') }).click();

        // Wait for textarea to clear
        await expect(textarea).toHaveValue('', { timeout: 15000 });
        console.log('✅ Textarea cleared');

        // ── BACKEND VERIFICATION ──────────────────────────────────────────
        console.log('--- API: Verifying backend state ---');
        let ticketData;
        for (let i = 0; i < 5; i++) {
            ticketData = await apiGet(`/tickets/${ticketId}`, customerToken);
            const latestMsg = ticketData.messages.find((m: any) => m.message === messageToType);
            if (latestMsg && latestMsg.attachments?.length > 0) {
                console.log(`✅ API confirmed attachment persisted for message: ${latestMsg.id}`);
                break;
            }
            console.log(`... waiting for backend persistence (attempt ${i + 1})`);
            await page.waitForTimeout(2000);
        }

        // ── UI VERIFICATION ──────────────────────────────────────────────
        console.log('--- UI: Verifying rendering ---');
        await page.reload(); // Ensure UI reflects the backend state
        await expect(page.getByText(messageToType)).toBeVisible({ timeout: 15000 });

        // Broaden the search for the attachment link
        const attachmentLink = page.locator('a').filter({
            hasText: new RegExp(testFileName.split('.')[0], 'i')
        }).last();

        try {
            await expect(attachmentLink).toBeVisible({ timeout: 15000 });
            console.log('✅ Found attachment link in UI');
        } catch (err) {
            console.error('❌ Attachment link NOT visible in UI despite API confirmation.');
            // Debug: Log all links
            const links = await page.evaluate(() => Array.from(document.querySelectorAll('a')).map(a => ({ text: a.innerText, href: a.href })));
            console.log('--- DIAGNOSTIC: All Links on Page ---');
            console.log(links);
            await page.screenshot({ path: '/tmp/attachment-debug-v9.png', fullPage: true });
            throw err;
        }

        await page.screenshot({ path: '/tmp/attachment-success.png' });
        console.log('✅✅ ATTACHMENT TEST PASSED');
    });
});
