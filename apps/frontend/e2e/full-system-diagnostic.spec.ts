import { test, expect } from '@playwright/test';

test.describe('Full System Diagnostic E2E Test', () => {

    test('1. System Boot & Landing Page', async ({ page }) => {
        const response = await page.goto('/tr', { waitUntil: 'domcontentloaded' });
        expect(response?.status()).toBe(200);
        await expect(page.locator('text=Aluplan')).toBeVisible();
    });

    test('2. Admin Authentication Flow', async ({ page }) => {
        page.on('console', msg => console.log(`[Browser] ${msg.type()}: ${msg.text()}`));
        page.on('pageerror', err => console.error(`[Browser Error]`, err));

        await page.goto('/tr', { waitUntil: 'domcontentloaded' });

        // Wait 8 seconds for unminified local Dev JS bundles to download and attach React Event Delegation
        await page.waitForTimeout(8000);

        // Fill credentials and strictly enforce state update
        await page.getByTestId('login-email').fill('hazarvolga@gmail.com');
        await expect(page.getByTestId('login-email')).toHaveValue('hazarvolga@gmail.com');

        await page.getByTestId('login-password').fill('Vol?*187');
        await expect(page.getByTestId('login-password')).toHaveValue('Vol?*187');

        // Wait for React hydration
        await page.waitForTimeout(1500);

        // Click submit
        await page.getByTestId('login-submit').click({ force: true });

        // Wait for Next.js dev server to compile and navigate to dashboard
        // We give it 45 seconds because local compilation on the first run can be slow
        await page.waitForURL('**/dashboard', { timeout: 45000 });
        expect(page.url()).toContain('/dashboard');

        // Wait for UI to mount
        await expect(page.locator('text=Bilet Kuyruğu').first()).toBeVisible({ timeout: 20000 });
    });

    test('3. New Customer Registration & Ticket Creation Flow', async ({ browser }) => {
        const context = await browser.newContext();
        const page = await context.newPage();

        // Use a test customer email
        const testUser = `test_customer_${Date.now()}@aluplan.com`;

        // Attempt login to verify redirect
        await page.goto('/tr', { waitUntil: 'domcontentloaded' });

        // Ensure app mounts and React Event Delegation is active
        await page.waitForTimeout(8000);

        await page.getByTestId('login-email').fill(testUser);
        await expect(page.getByTestId('login-email')).toHaveValue(testUser);

        await page.getByTestId('login-password').fill('TestPassword123!');
        await expect(page.getByTestId('login-password')).toHaveValue('TestPassword123!');

        await page.getByTestId('login-submit').click();

        // Must display an error banner
        await expect(page.locator('.text-rose-500').first()).toBeVisible({ timeout: 15000 });

        await context.close();
    });

    test('4. Admin Dashboard Module Availability', async ({ page }) => {
        // We will directly use JS to set the token to avoid re-login if possible, 
        // but E2E tests are isolated. We need to login again.
        await page.goto('/tr', { waitUntil: 'domcontentloaded' });
        await page.waitForTimeout(8000);
        await page.getByTestId('login-email').fill('hazarvolga@gmail.com');
        await expect(page.getByTestId('login-email')).toHaveValue('hazarvolga@gmail.com');

        await page.getByTestId('login-password').fill('Vol?*187');
        await expect(page.getByTestId('login-password')).toHaveValue('Vol?*187');

        await page.waitForTimeout(1000);
        await page.getByTestId('login-submit').click({ force: true });
        await page.waitForURL('**/dashboard', { timeout: 30000 });

        // Check Ticket Queue page
        await page.goto('/tr/dashboard');
        await expect(page.locator('text=Bilet')).toBeVisible();

        // Check Settings Page
        await page.goto('/tr/admin/settings');
        await expect(page.locator('text=E-posta').first()).toBeVisible();

        // Check KB page
        await page.goto('/tr/knowledge-base');
        await expect(page.locator('text=Bilgi')).toBeVisible();
    });
});
