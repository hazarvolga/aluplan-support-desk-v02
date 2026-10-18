import { test, expect } from '@playwright/test';
import { extractAccessTokenFromSetCookie } from './helpers/auth-cookie';
import { TEST_USERS } from './helpers/auth';

/**
 * LIVE CHAT / WEBSOCKET E2E TEST
 * 
 * Objective: Verify that a customer can request live support and 
 * the UI reflects the real-time active state after admin acceptance.
 */

const BASE_API = 'http://127.0.0.1:4000/api/v1';
test.use({ storageState: { cookies: [], origins: [] } });

async function apiPost(url: string, body: any, token?: string, csrfToken?: string) {
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;
    if (csrfToken) {
        headers.Cookie = `XSRF-TOKEN=${encodeURIComponent(csrfToken)}`;
        headers['X-XSRF-TOKEN'] = csrfToken;
        headers['X-Requested-With'] = 'XMLHttpRequest';
    }
    const res = await fetch(`${BASE_API}${url}`, {
        method: 'POST',
        headers,
        body: JSON.stringify(body)
    });
    if (!res.ok) {
        const err = await res.text();
        throw new Error(`API POST ${url} failed (${res.status}): ${err}`);
    }
    const payload = await res.json();
    const setCookie = res.headers.get('set-cookie');
    const csrfMatch = setCookie?.match(/(?:^|[,;]\s*)XSRF-TOKEN=([^;,]+)/);
    return url === '/auth/login'
        ? {
            ...payload,
            access_token: extractAccessTokenFromSetCookie(setCookie),
            csrf_token: csrfMatch ? decodeURIComponent(csrfMatch[1]) : undefined,
        }
        : payload;
}

async function apiPatch(url: string, body: any, token: string, csrfToken: string) {
    const res = await fetch(`${BASE_API}${url}`, {
        method: 'PATCH',
        headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
            Cookie: `XSRF-TOKEN=${encodeURIComponent(csrfToken)}`,
            'X-XSRF-TOKEN': csrfToken,
            'X-Requested-With': 'XMLHttpRequest',
        },
        body: JSON.stringify(body)
    });
    if (!res.ok) {
        const err = await res.text();
        throw new Error(`API PATCH ${url} failed (${res.status}): ${err}`);
    }
    return res.json();
}

async function apiGet(url: string, token: string) {
    const res = await fetch(`${BASE_API}${url}`, {
        headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) {
        const err = await res.text();
        throw new Error(`API GET ${url} failed (${res.status}): ${err}`);
    }
    return res.json();
}

test.describe('Live Chat WebSocket Flow', () => {
    const { email: customerEmail, password: customerPassword } = TEST_USERS.customer;
    const { email: adminEmail, password: adminPassword } = TEST_USERS.admin;

    test('should activate live chat session end-to-end', async ({ page }) => {
        // ── SETUP: Create ticket via API ──────────────────────────────────
        console.log('--- Setup: Creating ticket via API ---');
        const customerAuth = await apiPost('/auth/login', { email: customerEmail, password: customerPassword });
        const customerToken = customerAuth.access_token;
        expect(customerAuth.csrf_token).toBeTruthy();

        const customer = await apiGet('/auth/me', customerToken);
        const originalVipStatus = Boolean(customer.customerProfile?.isVip);
        const adminAuth = await apiPost('/auth/login', { email: adminEmail, password: adminPassword });
        const adminToken = adminAuth.access_token;
        expect(adminAuth.csrf_token).toBeTruthy();

        await apiPatch(`/customers/${customer.id}`, { isVip: true }, adminToken, adminAuth.csrf_token);

        try {
            const ticket = await apiPost('/tickets', {
                subject: `[E2E] Live Chat Test - ${Date.now()}`,
                description: 'Live chat test ticket description.',
                priority: 'MEDIUM',
            }, customerToken, customerAuth.csrf_token);
            const ticketId = ticket.id;
            console.log('✅ Ticket created:', ticketId);

        // ── UI: Customer Login & Request Chat ─────────────────────────────
        console.log('--- UI: Customer login & request chat ---');
        await page.goto('/tr/login');
        await page.getByTestId('login-email').fill(customerEmail);
        await page.getByTestId('login-password').fill(customerPassword);
        await page.getByTestId('login-submit').click();

        await page.waitForURL(/my-tickets/, { timeout: 120000 });
        const locale = new URL(page.url()).pathname.split('/')[1];
        await page.goto(`/${locale}/tickets/${ticketId}`);
        await page.waitForURL(new RegExp(`tickets\/${ticketId}`));
        console.log('✅ On ticket page');

        // Initial state should be NORMAL, button should be visible
        // The button text varies by locale, use regex
        const startChatBtn = page.getByRole('button', { name: /CANLI DESTEK BAŞLAT|START LIVE SUPPORT/i });
        await expect(startChatBtn).toBeVisible({ timeout: 15000 });
        await startChatBtn.click();
        console.log('✅ Clicked Start Live Support');

        // Wait for REQUESTED state in UI (loading spinner or text change)
        // The UI shows "WAITING_AGENT" or similar
        await expect(page.getByText(/TEMSİLCİ BEKLENİYOR|WAITING FOR AGENT/i)).toBeVisible({ timeout: 10000 });
        console.log('✅ UI shows REQUESTED state');

        // ── API: Admin accepts the chat ────────────────────────────────────
        console.log('--- API: Admin accepting chat ---');
            // Patch ticket to LIVE state
            await apiPatch(`/tickets/${ticketId}`, { chatStatus: 'LIVE' }, adminToken, adminAuth.csrf_token);
            console.log('✅ Admin set chatStatus to LIVE');

        // ── UI: Verify Live State ──────────────────────────────────────────
        console.log('--- UI: Verifying LIVE session active ---');
        // The UI component has a "live_session_active" badge
            await expect(page.getByText(/CANLI DESTEK OTURUMU AKTİF|LIVE SUPPORT SESSION ACTIVE/i)).toBeVisible({ timeout: 15000 });
            console.log('✅✅ LIVE CHAT VERIFIED: UI correctly reflected the WebSocket state update');

        // Optional: send a message in live chat
            await page.getByRole('textbox', { name: /Mesajınızı buraya yazın|Type your message/i }).fill('Hello through WebSocket!');
            await page.keyboard.press('Enter');
            console.log('✅ Sent message in live chat');
        } finally {
            await apiPatch(
                `/customers/${customer.id}`,
                { isVip: originalVipStatus },
                adminToken,
                adminAuth.csrf_token,
            );
        }
    });
});
