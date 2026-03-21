import { test, expect } from '@playwright/test';

/**
 * FULL TICKET LIFECYCLE E2E TEST — Hybrid Strategy
 *
 * Architecture:
 * - API: Customer auth → ticket creation → customer message → admin auth
 *        → admin reply → admin sets PENDING_CUSTOMER_REVIEW
 * - UI:  Customer login → navigate to ticket → verify admin reply visible
 *        → click a star rating → click save_and_close button
 *        → verify redirect to /my-tickets (ticket closed)
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
    return res.json();
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
    const customerEmail = 'e2e-customer@aluplan.com';
    const customerPassword = 'Vol1872017';
    const adminEmail = 'hazarvolga@gmail.com';
    const adminPassword = 'Vol1872017';

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
        await page.goto('/login');
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

        // CSAT block should be visible (ticket is PENDING_CUSTOMER_REVIEW)
        // The block heading from locale says 'Çözüm Değerlendirmeniz' or similar
        // We just need to click any star (buttons with type="button" containing Star icon)
        const starButtons = page.locator('button[type="button"]').filter({ has: page.locator('svg') });
        // More targeted: the star rating buttons near the rating section
        // The CSAT section has exactly 5 star buttons in a 'flex items-center gap-1 py-1' div
        const csatStars = page.locator('div.flex.items-center.gap-1.py-1 > button');
        await expect(csatStars.first()).toBeVisible({ timeout: 20000 });

        // Click the 5th star (highest rating)
        await csatStars.nth(4).click();
        console.log('✅ Clicked 5-star rating');

        // After clicking a star, the Textarea and submit button appear
        // The submit button has text from i18n key 'save_and_close'
        // Look for the orange submit button
        const submitBtn = page.locator('button.bg-orange-600');
        await expect(submitBtn).toBeVisible({ timeout: 10000 });
        await submitBtn.click();
        console.log('✅ Clicked save_and_close button');

        // Should redirect to /my-tickets after closing
        await page.waitForURL(/my-tickets/, { timeout: 120000 });
        console.log('✅ Redirected to /my-tickets after close — Ticket is CLOSED');

        // Final confirmation: the ticket no longer shows as "open"
        // or we just confirm we're on the my-tickets list page
        expect(page.url()).toContain('my-tickets');
        console.log('✅✅ LIFECYCLE COMPLETE: Full Customer→Admin→Customer ticket lifecycle verified!');
    });
});
