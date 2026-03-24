import { test, expect } from '@playwright/test';

/**
 * LIVE CHAT / WEBSOCKET E2E TEST
 * 
 * Objective: Verify that a customer can request live support and 
 * the UI reflects the real-time active state after admin acceptance.
 */

const BASE_API = 'http://127.0.0.1:4000/api/v1';

async function apiPost(url: string, body: any, token?: string) {
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;
    const res = await fetch(`${BASE_API}${url}`, {
        method: 'POST',
        headers,
        body: JSON.stringify(body)
    });
    if (!res.ok) {
        const err = await res.text();
        throw new Error(`API POST ${url} failed (${res.status}): ${err}`);
    }
    return res.json();
}

async function apiPatch(url: string, body: any, token: string) {
    const res = await fetch(`${BASE_API}${url}`, {
        method: 'PATCH',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
    });
    if (!res.ok) {
        const err = await res.text();
        throw new Error(`API PATCH ${url} failed (${res.status}): ${err}`);
    }
    return res.json();
}

test.describe('Live Chat WebSocket Flow', () => {
    const customerEmail = 'test_customer@aluplan.com';
    const customerPassword = 'Test1234!';
    const adminEmail = 'hazarvolga@gmail.com';
    const adminPassword = 'Vol1872017';

    test('should activate live chat session end-to-end', async ({ page }) => {
        // ── SETUP: Create ticket via API ──────────────────────────────────
        console.log('--- Setup: Creating ticket via API ---');
        const customerAuth = await apiPost('/auth/login', { email: customerEmail, password: customerPassword });
        const customerToken = customerAuth.access_token;

        const ticket = await apiPost('/tickets', {
            subject: `[E2E] Live Chat Test - ${Date.now()}`,
            description: 'Live chat test ticket description.',
            priority: 'MEDIUM',
        }, customerToken);
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
        const startChatBtn = page.getByRole('button', { name: /CANLI_DESTEK_BAŞLAT|START_LIVE_SUPPORT/i });
        await expect(startChatBtn).toBeVisible({ timeout: 15000 });
        await startChatBtn.click();
        console.log('✅ Clicked Start Live Support');

        // Wait for REQUESTED state in UI (loading spinner or text change)
        // The UI shows "WAITING_AGENT" or similar
        await expect(page.getByText(/bekleniyor|waiting|REQUESTED/i)).toBeVisible({ timeout: 10000 });
        console.log('✅ UI shows REQUESTED state');

        // ── API: Admin accepts the chat ────────────────────────────────────
        console.log('--- API: Admin accepting chat ---');
        const adminAuth = await apiPost('/auth/login', { email: adminEmail, password: adminPassword });
        const adminToken = adminAuth.access_token;

        // Patch ticket to LIVE state
        await apiPatch(`/tickets/${ticketId}`, { chatStatus: 'LIVE' }, adminToken);
        console.log('✅ Admin set chatStatus to LIVE');

        // ── UI: Verify Live State ──────────────────────────────────────────
        console.log('--- UI: Verifying LIVE session active ---');
        // The UI component has a "live_session_active" badge
        await expect(page.getByText(/CANLI_OTURUM_AKTİF|LIVE_SESSION_ACTIVE/i)).toBeVisible({ timeout: 15000 });
        console.log('✅✅ LIVE CHAT VERIFIED: UI correctly reflected the WebSocket state update');

        // Optional: send a message in live chat
        await page.locator('textarea[placeholder*="message"]').fill('Hello through WebSocket!');
        await page.keyboard.press('Enter');
        console.log('✅ Sent message in live chat');
    });
});
