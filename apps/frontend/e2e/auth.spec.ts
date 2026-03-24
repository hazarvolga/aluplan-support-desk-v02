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
        await page.goto('/tr/login');
        await page.waitForSelector('[data-testid="login-email"]', { timeout: 120000 });

        // Assert - email input
        await expect(page.getByTestId('login-email')).toBeVisible();

        // Assert - password input
        await expect(page.getByTestId('login-password')).toBeVisible();

        // Assert - submit button
        await expect(page.getByTestId('login-submit')).toBeVisible();
    });

    test('should show error message on invalid credentials', async ({ page }) => {
        // Arrange
        await page.goto('/tr/login');
        await page.waitForSelector('[data-testid="login-email"]', { timeout: 120000 });

        // Act
        await page.getByTestId('login-email').fill('invalid@example.com');
        await page.getByTestId('login-password').fill('wrongpassword123');
        await page.getByTestId('login-submit').click();

        // Assert - error box appears with red styling
        const errorBox = page.locator('.border-rose-500\\/30').or(
            page.locator('[class*="rose"]').filter({ hasText: /AUTH_FAILURE|Credentials|Unauthorized/i })
        );

        // Wait for async error handling
        await expect(page.getByTestId('error-message')).toBeVisible({ timeout: 10000 });
    });

    test('should redirect to dashboard on valid credentials', async ({ page }) => {
        // Arrange
        await page.goto('/tr/login');
        await page.waitForSelector('[data-testid="login-email"]', { timeout: 120000 });

        // Act
        await page.getByTestId('login-email').fill('hazarvolga@gmail.com');
        await page.getByTestId('login-password').fill('Vol1872017');
        await page.getByTestId('login-submit').click();

        // Assert - wait for redirect (smart routing might go to /profile or /dashboard)
        await page.waitForURL(/.*\/(dashboard|profile)/, { timeout: 120000 });
        expect(page.url()).toMatch(/.*\/(dashboard|profile)/);
    });

    test('should display system requirements accordion', async ({ page }) => {
        // Arrange
        await page.goto('/tr/login');

        // Assert - Requirement accordion elements should be visible
        const accordion = page.getByTestId('requirement-accordion');
        await expect(accordion).toBeVisible({ timeout: 120000 });

        // Check for specific software titles from seed (e.g., ALLPLAN 2026)
        // We use a regex for flexibility across locales if needed, but since seed has it:
        await expect(page.getByText(/ALLPLAN 2026/i)).toBeVisible();
    });
});
