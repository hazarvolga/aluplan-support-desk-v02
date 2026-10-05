import { test, expect } from '@playwright/test';
import { extractAccessTokenFromSetCookie } from './helpers/auth-cookie';
import { TEST_USERS } from './helpers/auth';

/**
 * FULL TICKET LIFECYCLE E2E TEST — Hybrid Strategy
 *
 * Architecture:
 * - API: Customer auth → ticket creation → customer message → admin auth
 *        → admin reply → admin sets PENDING_CUSTOMER_REVIEW
 * - UI:  Customer login → navigate to ticket → verify admin reply visible
 *        → confirm resolution without rating, remain on ticket
 *        → optionally submit a rating without changing CLOSED status
 */

const BASE_API = 'http://localhost:4000/api/v1';

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
    const payload = await res.json();
    return url === '/auth/login'
        ? { ...payload, access_token: extractAccessTokenFromSetCookie(res.headers.get('set-cookie')) }
        : payload;
}

async function apiPatch(url: string, token: string) {
    const res = await fetch(`${BASE_API}${url}`, {
        method: 'PATCH',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' }
    });
    if (!res.ok) {
        const err = await res.text();
        throw new Error(`API PATCH ${url} failed (${res.status}): ${err}`);
    }
    return res.json();
}

test.describe('Ticket Lifecycle Orchestration', () => {
    const { email: customerEmail, password: customerPassword } = TEST_USERS.customer;
    const { email: adminEmail, password: adminPassword } = TEST_USERS.admin;

    test('full ticket lifecycle via API setup + UI resolution', async ({ page }) => {
        const subject = `[E2E] Lifecycle - ${Date.now()}`;

        // ── SETUP: Customer creates ticket via API ────────────────────────
        console.log('--- [API] Customer: Login & Ticket Creation ---');
        const customerAuth = await apiPost('/auth/login', { email: customerEmail, password: customerPassword });
        const customerToken = customerAuth.access_token;
        expect(customerToken).toBeTruthy();
        console.log('✅ Customer authenticated');

        const ticket = await apiPost('/tickets', {
            subject,
            description: 'E2E Lifecycle Test: Ticket oluşturuldu.',
            priority: 'HIGH',
        }, customerToken);
        const ticketId = ticket.id;
        expect(ticketId).toBeTruthy();
        console.log('✅ Ticket created:', ticketId);

        await apiPost(`/tickets/${ticketId}/messages`, {
            message: 'Musteri ek mesaji: sorun devam ediyor.',
            isInternal: false,
        }, customerToken);
        console.log('✅ Customer follow-up message posted');

        // ── SETUP: Admin replies & sets PENDING_CUSTOMER_REVIEW ───────────
        console.log('--- [API] Admin: Login, Reply & Set Review Status ---');
        const adminAuth = await apiPost('/auth/login', { email: adminEmail, password: adminPassword });
        const adminToken = adminAuth.access_token;
        expect(adminToken).toBeTruthy();
        console.log('✅ Admin authenticated');

        const adminReplyText = 'Admin API Reply 12345 system updated resolved';
        await apiPost(`/tickets/${ticketId}/messages`, {
            message: adminReplyText,
            isInternal: false,
        }, adminToken);
        console.log('✅ Admin reply posted');

        // State machine: NEW → OPEN (first)
        await apiPatch(`/tickets/${ticketId}/status/OPEN`, adminToken);
        console.log('✅ Ticket status set to OPEN');

        // Transition ticket to PENDING_CUSTOMER_REVIEW so the customer CSAT block appears
        await apiPatch(`/tickets/${ticketId}/status/PENDING_CUSTOMER_REVIEW`, adminToken);
        console.log('✅ Ticket status set to PENDING_CUSTOMER_REVIEW');

        // ── UI PHASE: Customer logs in and completes CSAT + close ─────────
        console.log('--- [UI] Customer: Login → View Ticket → Rate & Close ---');
        await page.goto('/tr/login');
        await expect(page.getByTestId('login-email')).toBeVisible({ timeout: 120000 });
        await page.getByTestId('login-email').fill(customerEmail);
        await page.getByTestId('login-password').fill(customerPassword);
        await page.getByTestId('login-submit').click();

        await page.waitForURL(/.*\/(my-tickets|dashboard)/, { timeout: 45000 });
        console.log('✅ Customer UI login. URL:', page.url());

        // Navigate directly to ticket detail page
        const locale = new URL(page.url()).pathname.split('/')[1]; // 'en', 'tr', etc.
        await page.goto(`/${locale}/tickets/${ticketId}`);
        await page.waitForURL(new RegExp(`tickets\/${ticketId}`), { timeout: 120000 });
        console.log('✅ On ticket page. URL:', page.url());

        // ── UI PHASE: Verify Admin Reply & Complete CSAT ─────────────────
        // We use a robust retry loop to wait for the admin's reply to appear in the UI
        let messageFound = false;
        for (let i = 0; i < 5; i++) {
            await page.reload();
            try {
                // Wait for the specific reply text
                await expect(page.getByText('Admin API Reply 12345', { exact: false })).toBeVisible({ timeout: 10000 });
                messageFound = true;
                break;
            } catch (e) {
                console.log(`Retry ${i + 1}: Admin message not visible yet. Waiting...`);
                await page.waitForTimeout(5000);
            }
        }

        if (!messageFound) {
            throw new Error('Admin API Reply 12345 did not appear in UI after 5 reloads.');
        }
        console.log('✅ Admin reply confirmed visible');

        const closure = page.waitForResponse(response => response.url().endsWith(`/tickets/${ticketId}/resolution`) && response.request().method() === 'POST');
        await page.getByRole('button', { name: /Sorunum çözüldü|My issue is resolved|Mein Problem ist gelöst/ }).click();
        const closedResponse = await closure;
        expect(closedResponse.ok()).toBe(true);
        const closed = await closedResponse.json();
        expect(closed.status).toBe('CLOSED');
        expect(closed.satisfactionScore).toBeNull();
        await expect(page).toHaveURL(new RegExp(`/tickets/${ticketId}$`));

        // Rating is optional and cannot close, reopen, or redirect the ticket.
        await page.getByRole('radio').nth(4).locator('..').click();
        const feedback = page.waitForResponse(response => response.url().endsWith(`/tickets/${ticketId}/feedback`) && response.request().method() === 'POST');
        await page.getByRole('button', { name: /Değerlendirmeyi gönder|Submit rating|Bewertung senden/ }).click();
        const ratedResponse = await feedback;
        expect(ratedResponse.ok()).toBe(true);
        expect(await ratedResponse.json()).toMatchObject({ status: 'CLOSED', satisfactionScore: 5 });
        await expect(page).toHaveURL(new RegExp(`/tickets/${ticketId}$`));
        await expect(page.getByRole('radio')).toHaveCount(0);
    });
});
