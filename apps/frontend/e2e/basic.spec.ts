import { test, expect } from '@playwright/test';

test.describe('Happy Path: Unauthenticated Access', () => {
    test('should load the landing page', async ({ page }) => {
        // Navigate to the base URL (defined in playwright.config.ts as localhost:3000)
        await page.goto('/');

        // Check for "Aluplan" in title
        await expect(page).toHaveTitle(/Aluplan/i);
    });

    test('should show login button/form when unauthenticated', async ({ page }) => {
        await page.goto('/');

        // Use the exact labels found: OTURUMU_BAŞLAT
        const loginBtn = page.getByRole('button', { name: /OTURUMU_BAŞLAT/i }).or(page.getByText(/OTURUMU_BAŞLAT/i));
        await expect(loginBtn.first()).toBeVisible();
    });
});
