import { test, expect } from '@playwright/test';

test.describe('Happy Path: Unauthenticated Access', () => {
    test('should load the landing page', async ({ page }) => {
        // Navigate to the base URL (defined in playwright.config.ts as localhost:3000)
        await page.goto('/tr/login');

        // Check for "Aluplan" in title
        await expect(page).toHaveTitle(/Aluplan/i);
    });

    test('should show login button/form when unauthenticated', async ({ page }) => {
        await page.goto('/tr/login');

        // Use testid for localized robustness
        const loginBtn = page.getByTestId('login-submit');
        await expect(loginBtn).toBeVisible({ timeout: 15000 });
    });
});
