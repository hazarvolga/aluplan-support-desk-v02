import { test, expect, Page } from '@playwright/test';

/**
 * E2E Agent Reply Flow Tests
 * Targets ticket detail page interaction: sending a message/reply as an agent.
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

test.describe('Agent Reply Flow', () => {

    test.beforeEach(async ({ page }) => {
        await loginAsAdmin(page);
    });

    test('should navigate to a ticket detail and see the message interface', async ({ page }) => {
        // Navigate to tickets listing
        const ticketNavLink = page.getByTestId('nav-tickets');
        await ticketNavLink.click();
        await page.waitForURL(/.*\/tickets/, { timeout: 30000 });

        // Click on the first available ticket row
        const firstRow = page.locator('table tbody tr').first();
        const isTableVisible = await firstRow.isVisible().catch(() => false);

        if (isTableVisible) {
            await firstRow.click();

            // We should be on a ticket detail page
            await expect(page).toHaveURL(/.*\/tickets\/.+/, { timeout: 5000 });
        } else {
            // No tickets - skip gracefully
            console.log('No tickets available for agent reply test, skipping.');
            return;
        }
    });

    test('should send a reply message on ticket detail page', async ({ page }) => {
        // Navigate to tickets
        await page.getByTestId('nav-tickets').click();
        await page.waitForURL(/.*\/tickets/, { timeout: 30000 });

        // Try to access first ticket
        const firstTicketLink = page.locator('table tbody tr a').first()
            .or(page.locator('table tbody tr').first());

        const isVisible = await firstTicketLink.isVisible().catch(() => false);
        if (!isVisible) {
            console.log('No tickets in table, skipping reply test.');
            return;
        }

        await firstTicketLink.click();
        await page.waitForURL(/\/tickets\/.+/, { timeout: 5000 });

        // Find a message input - could be textarea or contenteditable (Tiptap)
        const messageInput = page.locator('textarea, [contenteditable="true"]').first();
        await expect(messageInput).toBeVisible({ timeout: 5000 });

        const replyText = `E2E automated reply - ${Date.now()}`;
        await messageInput.fill(replyText).catch(() =>
            messageInput.type(replyText)  // fallback for contenteditable
        );

        // Click send button
        const sendButton = page.getByRole('button').filter({ hasText: /Gönder|Send/i }).last();
        await expect(sendButton).toBeVisible({ timeout: 3000 });
        await sendButton.click();

        // Assert the reply appears in the thread
        await expect(page.getByText(replyText)).toBeVisible({ timeout: 8000 });
    });
});
