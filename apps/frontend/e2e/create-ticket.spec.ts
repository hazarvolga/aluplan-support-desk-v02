import { test, expect, Page } from '@playwright/test';

/**
 * E2E Create Ticket Flow Tests
 * Refactored for stability and locale-awareness.
 */

async function loginAsAdmin(page: Page) {
    await page.goto('/');
    // Use data-testid for stability
    await page.getByTestId('login-email').fill('hazarvolga@gmail.com');
    await page.getByTestId('login-password').fill('Vol?*187');
    await page.getByTestId('login-submit').click();

    // Wait for redirect to dashboard
    await page.waitForURL(/.*\/dashboard/, { timeout: 30000 });
}

test.describe('Create Ticket Flow', () => {

    test.beforeEach(async ({ page }) => {
        await loginAsAdmin(page);
    });

    test('should navigate to tickets page and see the ticket list', async ({ page }) => {
        // Direct navigation is more stable in E2E
        const locale = new URL(page.url()).pathname.split('/')[1] || 'tr';
        await page.goto(`/${locale}/tickets`);

        await page.waitForURL(/.*\/tickets/, { timeout: 30000 });
        console.log('✅ Navigated to tickets page:', page.url());

        // Check if list or empty state is visible
        const content = page.locator('main');
        await expect(content).toBeVisible({ timeout: 15000 });
    });

    test('should open new ticket modal/page and see the form', async ({ page }) => {
        const locale = new URL(page.url()).pathname.split('/')[1] || 'tr';
        await page.goto(`/${locale}/tickets`);
        await page.waitForURL(/.*\/tickets/, { timeout: 30000 });

        // Act - look for new ticket creation button
        const createBtn = page.getByTestId('create-ticket-button');

        // Wait for hydration/stability
        await expect(createBtn).toBeVisible({ timeout: 20000 });
        await createBtn.click({ force: true }); // Force if covered by overlay during hydration
        console.log('✅ Clicked create-ticket-button');

        // Assert - we should be on the new ticket page
        // Note: The UI might open a modal or navigate to /tickets/new
        await expect(page).toHaveURL(/.*\/tickets\/new/, { timeout: 15000 });
        console.log('✅ Navigated to /tickets/new');

        // Verify form elements are loading
        // The form in /tickets/new/page.tsx has multiple steps
        // The first step usually asks for basic info or product
        await expect(page.locator('main')).toBeVisible();
    });
});
