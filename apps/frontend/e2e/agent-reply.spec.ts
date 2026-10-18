import { test, expect, Page } from '@playwright/test';

/**
 * E2E Agent Reply Flow Tests
 * Targets ticket detail page interaction: sending a message/reply as an agent.
 */

import { getAuthToken, TEST_USERS } from './helpers/auth';

async function createTicketForReply(page: Page): Promise<string> {
    const token = await getAuthToken(
        page.context(),
        TEST_USERS.admin.email,
        TEST_USERS.admin.password,
    );
    const csrfToken = (await page.context().cookies('http://localhost:4000'))
        .find(({ name }) => name === 'XSRF-TOKEN')?.value;
    if (!csrfToken) {
        throw new Error('Ticket fixture creation failed: login did not persist the CSRF cookie');
    }
    const response = await page.context().request.post('http://localhost:4000/api/v1/tickets', {
        headers: {
            Authorization: `Bearer ${token}`,
            'X-XSRF-TOKEN': csrfToken,
            'X-Requested-With': 'XMLHttpRequest',
        },
        data: {
            subject: `[E2E] Agent Reply - ${Date.now()}`,
            description: 'Deterministic ticket for the agent reply browser journey.',
            priority: 'LOW',
        },
    });
    if (!response.ok()) {
        throw new Error(`Ticket fixture creation failed: ${response.status()} ${await response.text()}`);
    }
    const ticket = await response.json();
    return ticket.id;
}

test.describe('Agent Reply Flow', () => {
    test('should navigate to a ticket detail and see the message interface', async ({ page }) => {
        const ticketId = await createTicketForReply(page);
        await page.goto(`/tr/tickets/${ticketId}`);

        await expect(page).toHaveURL(new RegExp(`/tickets/${ticketId}$`), { timeout: 30000 });
        await expect(page.locator('textarea, [contenteditable="true"]').first()).toBeVisible();
    });

    test('should send a reply message on ticket detail page', async ({ page }) => {
        const ticketId = await createTicketForReply(page);
        await page.goto(`/tr/tickets/${ticketId}`);
        await page.waitForURL(new RegExp(`/tickets/${ticketId}$`), { timeout: 30000 });

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
