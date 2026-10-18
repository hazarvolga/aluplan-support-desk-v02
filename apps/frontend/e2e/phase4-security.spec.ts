import { test, expect } from '@playwright/test';

/**
 * Phase 4 Security Verification Tests
 * Verifies:
 * 1. CSRF Protection (XSRF-TOKEN cookie presence)
 * 2. PII Masking (Sensitive data hidden in UI)
 */
test.describe('Phase 4: Security & Compliance', () => {

    test('should have XSRF-TOKEN cookie for CSRF protection', async ({ page }) => {
        await page.goto('/tr/login');

        // Wait for it to be set by the middleware
        await page.waitForTimeout(1000);

        const cookies = await page.context().cookies();
        const csrfCookie = cookies.find(c => c.name === 'XSRF-TOKEN');

        expect(csrfCookie).toBeDefined();
        expect(csrfCookie?.httpOnly).toBe(false); // Must be false for frontend to read it
        expect(csrfCookie?.path).toBe('/');
    });

    test('should mask sensitive customer data in CRM views', async ({ page }) => {
        const { loginAsAdmin, TEST_USERS } = require('./helpers/auth');
        await loginAsAdmin(page);

        const accountsResponse = await page.request.get('http://localhost:4000/api/v1/crm/accounts');
        expect(accountsResponse.ok()).toBe(true);
        const accounts = await accountsResponse.json();
        const fixture = accounts.find((account: { name?: string }) => account.name === 'E2E PII Masking Account');
        expect(fixture?.id).toBeTruthy();

        await page.goto(`/tr/customers/accounts/${fixture.id}`);

        await expect(page.getByText('[E-POSTA GİZLENDİ: e***@aluplan.test]', { exact: true })).toBeVisible();
        await expect(page.getByText(TEST_USERS.customer.email, { exact: true })).toHaveCount(0);
    });

    test('should include X-XSRF-TOKEN header in mutating requests', async ({ page }) => {
        const { loginAsAdmin } = require('./helpers/auth');
        await loginAsAdmin(page);

        await page.goto('/tr/admin/settings');

        const portalNameInput = page.locator('input[placeholder="örn: Aluplan Destek"]');
        await expect(portalNameInput).toBeVisible();

        // Saving the currently loaded general settings exercises the shared API
        // client without changing their values. Match the exact endpoint so
        // unrelated background POST requests cannot satisfy this assertion.
        const [request] = await Promise.all([
            page.waitForRequest(req => (
                req.method() === 'POST'
                && new URL(req.url()).pathname === '/api/v1/settings/bulk'
            )),
            page.getByRole('button', { name: 'Değişiklikleri Kaydet' }).first().click(),
        ]);

        const headers = request.headers();
        expect(headers['x-xsrf-token']).toBeTruthy();
    });
});
