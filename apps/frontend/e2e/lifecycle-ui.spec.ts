import { test, expect, type Page } from '@playwright/test';

const fixture = {
    id: 'synthetic-lifecycle', ticketNumber: 'SYNTHETIC-1', userId: 'synthetic-customer',
    subject: 'Synthetic resolution workflow', description: 'Synthetic ticket for local browser verification only.',
    status: 'PENDING_CUSTOMER_REVIEW', priority: 'MEDIUM', channel: 'WEB', chatStatus: 'NORMAL',
    createdAt: '2026-10-01T09:00:00.000Z', updatedAt: '2026-10-01T09:00:00.000Z',
    closedAt: null as string | null, satisfactionScore: null as number | null,
    creator: { id: 'synthetic-customer', fullName: 'Synthetic Customer', email: 'customer@example.invalid' },
    messages: [] as Array<Record<string, unknown>>,
};

async function setup(page: Page, role: 'CUSTOMER' | 'AGENT', status = 'PENDING_CUSTOMER_REVIEW') {
    let ticket = { ...fixture, status };
    const writes: Array<{ path: string; body: any }> = [];
    const user = { id: role === 'CUSTOMER' ? 'synthetic-customer' : 'synthetic-agent', role, fullName: `Synthetic ${role}`, email: 'user@example.invalid', permissions: ['ticket:read', 'ticket:update', ...(role === 'AGENT' ? ['ticket:close'] : [])] };
    await page.context().addCookies([{ name: 'alu_at', value: 'synthetic-local-browser-only', domain: '127.0.0.1', path: '/' }]);
    await page.route('**/*', async route => {
        const url = new URL(route.request().url());
        // Prevent all external requests and all unmocked API traffic.
        if (!['127.0.0.1', 'localhost'].includes(url.hostname)) return route.abort();
        if (url.pathname.startsWith('/socket.io')) return route.abort();
        if (!url.pathname.startsWith('/api/v1/')) return route.continue();
        const path = url.pathname.replace('/api/v1', '');
        const body = route.request().postDataJSON();
        if (['POST', 'PATCH'].includes(route.request().method())) writes.push({ path, body });
        if (path === '/auth/me') return route.fulfill({ json: user });
        if (path === '/tickets/synthetic-lifecycle/resolution') {
            ticket = { ...ticket, status: body.decision === 'CONFIRM' ? 'CLOSED' : 'OPEN', closedAt: body.decision === 'CONFIRM' ? '2026-10-05T12:00:00.000Z' : null };
        } else if (path === '/tickets/synthetic-lifecycle/feedback') {
            ticket = { ...ticket, satisfactionScore: body.score };
        } else if (path === '/tickets/synthetic-lifecycle/close') {
            ticket = { ...ticket, status: 'CLOSED', closedAt: '2026-10-05T12:00:00.000Z' };
        } else if (path === '/tickets/synthetic-lifecycle/reopen-request') {
            ticket = { ...ticket, messages: [...ticket.messages, { id: 'request', senderId: user.id, sender: user, message: body.comment, isInternal: false, createdAt: '2026-10-05T12:01:00.000Z', metadata: { action: 'TICKET_REOPEN_REQUESTED', previousClosedAt: ticket.closedAt } }] };
        } else if (path === '/tickets/synthetic-lifecycle/status/OPEN') {
            ticket = { ...ticket, status: 'OPEN', closedAt: null };
        }
        if (path.startsWith('/tickets/synthetic-lifecycle') && !path.endsWith('/ai-trace') && !path.endsWith('/assignable-agents')) return route.fulfill({ json: ticket });
        if (path.endsWith('/ai-trace')) return route.fulfill({ json: null });
        if (path.includes('/csat/')) return route.fulfill({ json: route.request().method() === 'POST' ? { submitted: true } : { ticketNumber: ticket.ticketNumber } });
        return route.fulfill({ json: [] });
    });
    return { writes, getTicket: () => ticket };
}

test('customer closes without rating, rates independently, then requests reopening', async ({ page }, testInfo) => {
    const state = await setup(page, 'CUSTOMER');
    await page.goto('/tr/tickets/synthetic-lifecycle');
    await expect(page.getByRole('button', { name: 'Sorunum çözüldü — Talebi kapat' })).toBeVisible();
    await expect(page.locator('[contenteditable=true]')).toBeVisible();
    await page.screenshot({ path: testInfo.outputPath('customer-review.png'), fullPage: true });
    await page.getByRole('button', { name: 'Sorunum çözüldü — Talebi kapat' }).click();
    await expect(page.getByRole('button', { name: 'Sorun tekrar oluştu' })).toBeVisible();
    expect(state.getTicket()).toMatchObject({ status: 'CLOSED', satisfactionScore: null });
    await expect(page).toHaveURL(/\/tr\/tickets\/synthetic-lifecycle$/);
    await page.getByRole('radio', { name: '1 yıldız', exact: true }).locator('..').click();
    await page.getByRole('button', { name: 'Değerlendirmeyi gönder' }).click();
    await expect(page.getByText('Önceki değerlendirmeniz: 1/5. Bu puan değiştirilmez.')).toBeVisible();
    expect(state.getTicket().status).toBe('CLOSED');
    await page.getByRole('button', { name: 'Sorun tekrar oluştu' }).click();
    await page.getByLabel('Açıklama (zorunlu)').fill('Synthetic recurring issue');
    await page.getByRole('button', { name: 'Gönder', exact: true }).click();
    await expect(page.getByRole('status').filter({ hasText: 'Yeniden açma isteği destek ekibine iletildi' })).toBeVisible();
    await page.screenshot({ path: testInfo.outputPath('customer-reopen-request.png'), fullPage: true });
    expect(state.getTicket().status).toBe('CLOSED');
    expect(state.writes.map(write => write.path)).toEqual(['/tickets/synthetic-lifecycle/resolution', '/tickets/synthetic-lifecycle/feedback', '/tickets/synthetic-lifecycle/reopen-request']);
});

test('unresolved customer continues support without rating', async ({ page }, testInfo) => {
    const state = await setup(page, 'CUSTOMER', 'RESOLVED');
    await page.goto('/en/tickets/synthetic-lifecycle');
    await page.getByRole('button', { name: 'My issue continues', exact: true }).click();
    await expect(page.getByRole('button', { name: 'Submit', exact: true })).toBeDisabled();
    await page.getByLabel('Explanation (required)').fill('Synthetic unresolved problem');
    await page.getByRole('button', { name: 'Submit', exact: true }).click();
    await expect(page.getByRole('button', { name: 'My issue continues', exact: true })).toHaveCount(0);
    await expect(page.locator('[contenteditable=true]')).toBeVisible();
    expect(state.getTicket()).toMatchObject({ status: 'OPEN', satisfactionScore: null });
    await page.screenshot({ path: testInfo.outputPath('customer-continued.png'), fullPage: true });
});

test('staff closes with an optional explanation and reopens the same ticket', async ({ page }, testInfo) => {
    const state = await setup(page, 'AGENT');
    await page.goto('/tr/tickets/synthetic-lifecycle');
    await expect(page.getByRole('radio')).toHaveCount(0);
    await page.getByRole('button', { name: 'Talebi kapat', exact: true }).click();
    await expect(page.getByRole('button', { name: 'Gönder', exact: true })).toBeEnabled();
    await page.getByLabel('Açıklama (isteğe bağlı)').fill('Synthetic duplicate request');
    await page.screenshot({ path: testInfo.outputPath('staff-close-dialog.png'), fullPage: true });
    await page.getByRole('button', { name: 'Gönder', exact: true }).click();
    await page.getByRole('button', { name: /Yeniden aç/i }).click();
    await expect(page.getByRole('button', { name: 'Çözümü müşterinin onayına gönder' })).toBeVisible();
    expect(state.getTicket().status).toBe('OPEN');
    expect(state.writes).toContainEqual({ path: '/tickets/synthetic-lifecycle/close', body: { reason: 'Synthetic duplicate request' } });
    await page.screenshot({ path: testInfo.outputPath('staff-reopened.png'), fullPage: true });
});

test('staff closes without an explanation or customer rating', async ({ page }, testInfo) => {
    const state = await setup(page, 'AGENT');
    await page.goto('/tr/tickets/synthetic-lifecycle');
    await page.getByRole('button', { name: 'Talebi kapat', exact: true }).click();
    await expect(page.getByLabel('Açıklama (isteğe bağlı)')).toHaveValue('');
    await page.screenshot({ path: testInfo.outputPath('staff-close-optional.png'), fullPage: true });
    await page.getByRole('button', { name: 'Gönder', exact: true }).click();
    await expect(page.getByRole('button', { name: /Yeniden aç/i })).toBeVisible();
    expect(state.getTicket()).toMatchObject({ status: 'CLOSED', satisfactionScore: null });
    expect(state.writes).toEqual([{ path: '/tickets/synthetic-lifecycle/close', body: {} }]);
});

test('public feedback explicitly keeps ticket status unchanged', async ({ page }, testInfo) => {
    await setup(page, 'CUSTOMER', 'CLOSED');
    await page.goto('/de/feedback/synthetic-signed-token');
    await expect(page.getByText(/Diese Bewertung schließt Ihr Ticket nicht/)).toBeVisible();
    await page.locator('label[for="rating-5"]').click();
    await page.getByRole('button', { name: 'Feedback senden' }).click();
    await expect(page.getByText(/Der Ticketstatus bleibt unverändert/)).toBeVisible();
    await page.screenshot({ path: testInfo.outputPath('public-feedback-success.png'), fullPage: true });
});

test('mobile German lifecycle actions fit within the viewport', async ({ page }, testInfo) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await setup(page, 'CUSTOMER');
    await page.goto('/de/tickets/synthetic-lifecycle');
    const close = page.getByRole('button', { name: 'Mein Problem ist gelöst — Ticket schließen' });
    await expect(close).toBeVisible();
    const bounds = await close.boundingBox();
    expect(bounds).not.toBeNull();
    expect(bounds!.x + bounds!.width).toBeLessThanOrEqual(390);
    await page.screenshot({ path: testInfo.outputPath('mobile-customer-review.png'), fullPage: true });
});
