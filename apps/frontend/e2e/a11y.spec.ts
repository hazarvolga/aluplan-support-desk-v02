import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { TEST_USERS } from './helpers/auth';

/**
 * GAP-17: Accessibility Smoke Tests
 * Run with: npx playwright test a11y.spec.ts
 *
 * These tests scan critical pages for WCAG 2.2 AA violations.
 * They do NOT require a running backend (they hit public/unauthenticated routes).
 */

const CRITICAL_PAGES = [
    { path: '/', name: 'Landing / Login Page' },
    { path: '/register', name: 'Registration Page' },
    { path: '/reset-password', name: 'Reset Password Page' },
];

for (const page of CRITICAL_PAGES) {
    test(`a11y: ${page.name} (${page.path})`, async ({ page: pwPage }) => {
        await pwPage.goto(page.path);

        // Wait for main content to be ready
        await pwPage.waitForLoadState('networkidle');

        const accessibilityScanResults = await new AxeBuilder({ page: pwPage })
            .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
            .analyze();

        expect(accessibilityScanResults.violations).toEqual([]);
    });
}

test.describe('Authenticated Dashboard A11y (requires login)', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('/tr/login');
        await page.waitForSelector('[data-testid="login-email"]', { timeout: 30000 });
        await page.getByTestId('login-email').fill(TEST_USERS.admin.email);
        await page.getByTestId('login-password').fill(TEST_USERS.admin.password);
        await page.getByTestId('login-submit').click();
        await page.waitForURL(/.*\/dashboard/, { timeout: 60000 });
    });

    test('a11y: Dashboard', async ({ page }) => {
        await page.goto('/dashboard');
        await page.waitForLoadState('networkidle');

        const results = await new AxeBuilder({ page })
            .withTags(['wcag2a', 'wcag2aa'])
            .analyze();

        expect(results.violations).toEqual([]);
    });

    test('a11y: Tickets List', async ({ page }) => {
        await page.goto('/tickets');
        await page.waitForLoadState('networkidle');

        const results = await new AxeBuilder({ page })
            .withTags(['wcag2a', 'wcag2aa'])
            .analyze();

        expect(results.violations).toEqual([]);
    });
});
