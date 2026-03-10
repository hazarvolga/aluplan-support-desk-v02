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
    await page.getByTestId('login-email').fill('hazarvolga@gmail.com');
    await page.getByTestId('login-password').fill('Vol?*187');
    await page.getByTestId('login-submit').click();
    await page.waitForURL(/.*\/dashboard/, { timeout: 30000 });
}

test.describe('Create Ticket Flow', () => {

    test.beforeEach(async ({ page }) => {
        await loginAsAdmin(page);
    });

    test('should navigate to tickets page and see the ticket list', async ({ page }) => {
        // Act - navigate to tickets via sidebar
        // Try common navigation patterns
        const ticketNavLink = page.getByTestId('nav-tickets');
        await expect(ticketNavLink).toBeVisible({ timeout: 5000 });
        await ticketNavLink.click();

        // Assert
        await page.waitForURL(/.*\/tickets/, { timeout: 30000 });
        expect(page.url()).toContain('/tickets');
    });

    test('should open new ticket modal and fill the form', async ({ page }) => {
        // Navigate to tickets via sidebar
        await page.getByTestId('nav-tickets').click({ timeout: 30000 });
        await page.waitForURL(/.*\/tickets/, { timeout: 30000 });

        // Act - look for new ticket creation button
        const createBtn = page.getByTestId('create-ticket-button');
        await expect(createBtn).toBeVisible({ timeout: 15000 });
        await createBtn.click();

        // Assert - we should be on the new ticket page
        await page.waitForURL(/.*\/tickets\/new/, { timeout: 10000 });

        // A form or content should appear
        const form = page.locator('form, main').first();
        await expect(form).toBeVisible({ timeout: 10000 });

        // Fill subject - find the first input field
        const subjectInput = page.locator('input').first();
        await subjectInput.fill('E2E Automated Test Ticket - ' + Date.now());
    });
});
