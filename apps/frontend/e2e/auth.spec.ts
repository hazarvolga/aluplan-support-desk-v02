import { test, expect } from '@playwright/test';

/**
 * E2E Authentication Flow Tests
 * Based on actual DOM from apps/frontend/src/app/[locale]/page.tsx
 * 
 * Key selectors:
 * - Email: placeholder="operator@aluplan.com" / type="email"
 * - Password: type="password"
 * - Submit button text: "OTURUMU_BAŞLAT"
 * - Error container: border-rose-500/30 div
 */
test.describe('Authentication Flow', () => {

    test('should load login page with correct elements', async ({ page }) => {
        // Arrange
        await page.goto('/');

        // Assert - heading
        await expect(page.getByText('ERİŞİM_GEÇİDİ')).toBeVisible();

        // Assert - email input
        await expect(page.locator('input[type="email"]')).toBeVisible();

        // Assert - password input
        await expect(page.locator('input[type="password"]')).toBeVisible();

        // Assert - submit button
        await expect(page.getByRole('button', { name: /OTURUMU_BAŞLAT/i })).toBeVisible();
    });

    test('should show error message on invalid credentials', async ({ page }) => {
        // Arrange
        await page.goto('/');

        // Act
        await page.locator('input[type="email"]').fill('invalid@example.com');
        await page.locator('input[type="password"]').fill('wrongpassword123');
        await page.getByRole('button', { name: /OTURUMU_BAŞLAT/i }).click();

        // Assert - error box appears with red styling
        const errorBox = page.locator('.border-rose-500\\/30').or(
            page.locator('[class*="rose"]').filter({ hasText: /AUTH_FAILURE|Credentials|Unauthorized/i })
        );

        // Wait for async error handling
        await expect(errorBox).toBeVisible({ timeout: 8000 });
    });

    test('should redirect to dashboard on valid credentials', async ({ page }) => {
        // Arrange
        await page.goto('/');

        // Act
        await page.locator('input[type="email"]').fill('admin@aluplan.com');
        await page.locator('input[type="password"]').fill('admin123');
        await page.getByRole('button', { name: /OTURUMU_BAŞLAT/i }).click();

        // Assert - wait for redirect to dashboard
        await page.waitForURL(/.*\/dashboard/, { timeout: 10000 });
        expect(page.url()).toContain('/dashboard');
    });
});
