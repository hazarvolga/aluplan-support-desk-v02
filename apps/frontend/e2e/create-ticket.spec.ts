import { test, expect, Page } from '@playwright/test';

/**
 * E2E Create Ticket Flow Tests
 * Depends on valid authentication first using real login DOM selectors.
 */

/**
 * Reusable helper: Login as admin and navigate to dashboard
 */
async function loginAsAdmin(page: Page) {
    await page.goto('/');
    await page.locator('input[type="email"]').fill('admin@aluplan.com');
    await page.locator('input[type="password"]').fill('admin123');
    await page.getByRole('button', { name: /OTURUMU_BAŞLAT/i }).click();
    await page.waitForURL(/.*\/dashboard/, { timeout: 10000 });
}

test.describe('Create Ticket Flow', () => {

    test.beforeEach(async ({ page }) => {
        await loginAsAdmin(page);
    });

    test('should navigate to tickets page and see the ticket list', async ({ page }) => {
        // Act - navigate to tickets via sidebar
        // Try common navigation patterns
        const ticketNavLink = page.locator('a[href*="/tickets"]').first();
        await expect(ticketNavLink).toBeVisible({ timeout: 5000 });
        await ticketNavLink.click();

        // Assert
        await page.waitForURL(/.*\/tickets/, { timeout: 5000 });
        expect(page.url()).toContain('/tickets');
    });

    test('should open new ticket modal and fill the form', async ({ page }) => {
        // Navigate to tickets
        await page.locator('a[href*="/tickets"]').first().click();
        await page.waitForURL(/.*\/tickets/, { timeout: 5000 });

        // Act - look for new ticket creation button
        const createBtn = page.getByRole('button').filter({ hasText: /Yeni|New|Oluştur|Create/i }).first();
        await expect(createBtn).toBeVisible({ timeout: 5000 });
        await createBtn.click();

        // Assert - a dialog/form opened
        const form = page.locator('form, [role="dialog"]').first();
        await expect(form).toBeVisible({ timeout: 3000 });

        // Fill subject
        const subjectInput = page.locator('input').filter({ hasNot: page.locator('[type="hidden"]') }).first();
        await subjectInput.fill('E2E Automated Test Ticket - ' + Date.now());
    });
});
