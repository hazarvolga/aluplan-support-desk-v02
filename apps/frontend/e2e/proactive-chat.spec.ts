import { test, expect, Page } from '@playwright/test';
import { extractAccessTokenFromSetCookie } from './helpers/auth-cookie';
import { TEST_USERS } from './helpers/auth';

/**
 * PROACTIVE CHAT E2E TESTS
 *
 * Covers:
 * 1. Agent-initiated chat flow (happy path)
 * 2. Customer decline scenario
 * 3. Timeout scenario (MISSED)
 * 4. Ticket conversion
 * 5. Multi-tab protection (customer side)
 * 6. Session isolation (authorization)
 * 7. Disconnect timeout (60s)
 * 8. Offline customer notification
 * 9. Multiple concurrent sessions
 *
 * Architecture:
 * - Uses two browser contexts (agent + customer) to simulate real-time interaction
 * - WebSocket events are verified through UI state changes
 * - API calls are used for setup and verification
 */

const BASE_API = 'http://localhost:4000/api/v1';

type AuthSession = Readonly<{
    accessToken: string;
    csrfToken: string;
}>;

// ── API Helpers ──────────────────────────────────────────────────────────────

async function apiPost(url: string, body: any, session?: AuthSession) {
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (session) {
        headers.Authorization = `Bearer ${session.accessToken}`;
        headers.Cookie = `XSRF-TOKEN=${encodeURIComponent(session.csrfToken)}`;
        headers['X-XSRF-TOKEN'] = session.csrfToken;
        headers['X-Requested-With'] = 'XMLHttpRequest';
    }
    const res = await fetch(`${BASE_API}${url}`, {
        method: 'POST',
        headers,
        body: JSON.stringify(body)
    });
    if (!res.ok) {
        const err = await res.text();
        throw new Error(`API POST ${url} failed (${res.status}): ${err}`);
    }
    const payload = await res.json();
    if (url !== '/auth/login') return payload;

    const setCookie = res.headers.get('set-cookie');
    const csrfMatch = setCookie?.match(/(?:^|[,;]\s*)XSRF-TOKEN=([^;,]+)/);
    return {
        ...payload,
        access_token: extractAccessTokenFromSetCookie(setCookie),
        csrf_token: csrfMatch ? decodeURIComponent(csrfMatch[1]) : undefined,
    };
}

async function apiGet(url: string, session: AuthSession) {
    const res = await fetch(`${BASE_API}${url}`, {
        method: 'GET',
        headers: { 'Authorization': `Bearer ${session.accessToken}` }
    });
    if (!res.ok) {
        const err = await res.text();
        throw new Error(`API GET ${url} failed (${res.status}): ${err}`);
    }
    return res.json();
}

async function apiPatch(url: string, session: AuthSession, body?: any) {
    const headers: Record<string, string> = { 
        'Authorization': `Bearer ${session.accessToken}`,
        'Content-Type': 'application/json',
        Cookie: `XSRF-TOKEN=${encodeURIComponent(session.csrfToken)}`,
        'X-XSRF-TOKEN': session.csrfToken,
        'X-Requested-With': 'XMLHttpRequest',
    };
    const res = await fetch(`${BASE_API}${url}`, {
        method: 'PATCH',
        headers,
        body: body ? JSON.stringify(body) : undefined
    });
    if (!res.ok) {
        const err = await res.text();
        throw new Error(`API PATCH ${url} failed (${res.status}): ${err}`);
    }
    return res.json();
}

// ── Auth Helpers ─────────────────────────────────────────────────────────────

async function loginAsAgent(page: Page) {
    const { email, password } = TEST_USERS.agent;

    console.log('--- [AUTH] Agent Login ---');
    await page.context().clearCookies();
    await page.goto('/tr/login');
    await page.waitForSelector('[data-testid="login-email"]', { timeout: 30000 });
    
    await page.getByTestId('login-email').clear();
    await page.getByTestId('login-email').fill(email);
    await page.getByTestId('login-password').clear();
    await page.getByTestId('login-password').fill(password);
    
    await page.getByTestId('login-submit').click();
    await page.waitForURL(/.*\/dashboard/, { timeout: 30000 });
    console.log('✅ Agent authenticated');
}

async function loginAsCustomer(page: Page) {
    const { email, password } = TEST_USERS.customer;

    console.log('--- [AUTH] Customer Login ---');
    await page.context().clearCookies();
    await page.goto('/tr/login');
    await page.waitForSelector('[data-testid="login-email"]', { timeout: 30000 });
    
    await page.getByTestId('login-email').clear();
    await page.getByTestId('login-email').fill(email);
    await page.getByTestId('login-password').clear();
    await page.getByTestId('login-password').fill(password);
    
    await page.getByTestId('login-submit').click();
    await page.waitForURL(/.*\/(my-tickets|dashboard)/, { timeout: 30000 });
    console.log('✅ Customer authenticated');
}

async function getAuthSession(email: string, password: string): Promise<AuthSession> {
    const auth = await apiPost('/auth/login', { email, password });
    expect(auth.access_token).toBeTruthy();
    expect(auth.csrf_token).toBeTruthy();
    return Object.freeze({
        accessToken: auth.access_token,
        csrfToken: auth.csrf_token,
    });
}

// ── Test Suite ───────────────────────────────────────────────────────────────

test.describe('Proactive Chat E2E Tests', () => {
    const { email: agentEmail, password: agentPassword } = TEST_USERS.agent;
    const { email: customerEmail, password: customerPassword } = TEST_USERS.customer;
    const { email: customerTwoEmail, password: customerTwoPassword } = TEST_USERS.customerTwo;
    const { email: adminEmail, password: adminPassword } = TEST_USERS.admin;
    let vipFixture: Readonly<{
        customerId: string;
        originalStatus: boolean;
        adminSession: AuthSession;
        customerSession: AuthSession;
    }> | undefined;

    test.beforeAll(async () => {
        const [adminSession, customerSession] = await Promise.all([
            getAuthSession(adminEmail, adminPassword),
            getAuthSession(customerEmail, customerPassword),
        ]);
        const customer = await apiGet('/auth/me', customerSession);
        const originalStatus = Boolean(customer.customerProfile?.isVip);
        await apiPatch(`/customers/${customer.id}`, adminSession, { isVip: true });
        vipFixture = Object.freeze({
            customerId: customer.id,
            originalStatus,
            adminSession,
            customerSession,
        });
    });

    async function cleanupCustomerSessions() {
        if (!vipFixture) return;
        const sessions = await apiGet('/proactive-chat/sessions', vipFixture.customerSession);
        for (const session of sessions) {
            if (session.status === 'PENDING') {
                await apiPatch(
                    `/proactive-chat/sessions/${session.id}/decline`,
                    vipFixture.customerSession,
                );
            } else if (session.status === 'ACTIVE') {
                await apiPatch(
                    `/proactive-chat/sessions/${session.id}/end`,
                    vipFixture.customerSession,
                );
            }
        }
    }

    async function openActiveSessionsPanel(page: Page) {
        await page.goto('/tr/customers');
        await page.getByRole('tab', { name: 'Proaktif Chat' }).click();

        const panel = page.getByTestId('active-sessions-panel');
        await expect(panel).toBeVisible({ timeout: 10000 });
        return panel;
    }

    test.beforeEach(cleanupCustomerSessions);
    test.afterEach(cleanupCustomerSessions);

    test.afterAll(async () => {
        if (!vipFixture) return;
        await apiPatch(
            `/customers/${vipFixture.customerId}`,
            vipFixture.adminSession,
            { isVip: vipFixture.originalStatus },
        );
    });

    test('1. Happy Path: Agent initiates chat → Customer accepts → Messaging → End session', async ({ browser }) => {
        // Create two separate contexts for agent and customer
        const agentContext = await browser.newContext();
        const customerContext = await browser.newContext();
        
        const agentPage = await agentContext.newPage();
        const customerPage = await customerContext.newPage();

        try {
            // ── SETUP: Get customer ID via API ──────────────────────────────
            console.log('--- [SETUP] Getting customer ID ---');
            const agentToken = await getAuthSession(agentEmail, agentPassword);
            const customerToken = await getAuthSession(customerEmail, customerPassword);
            
            const customerProfile = await apiGet('/auth/me', customerToken);
            const agentProfile = await apiGet('/auth/me', agentToken);
            const customerId = customerProfile.id;
            console.log('✅ Customer ID:', customerId);

            // ── AGENT: Login and navigate to customers page ─────────────────
            await loginAsAgent(agentPage);
            const agentCookies = await agentContext.cookies();
            const browserAccessToken = agentCookies.find(cookie => cookie.name === 'alu_at')?.value;
            const browserCsrfToken = agentCookies.find(cookie => cookie.name === 'XSRF-TOKEN')?.value;
            expect(browserAccessToken).toBeTruthy();
            expect(browserCsrfToken).toBeTruthy();
            const browserAgentProfile = await apiGet('/auth/me', {
                accessToken: browserAccessToken!,
                csrfToken: browserCsrfToken!,
            });
            expect(browserAgentProfile.id).toBe(agentProfile.id);
            await agentPage.goto('/tr/customers');
            await agentPage.waitForLoadState('networkidle');
            console.log('✅ Agent on customers page');

            // ── CUSTOMER: Login and wait on dashboard ───────────────────────
            await loginAsCustomer(customerPage);
            console.log('✅ Customer waiting on dashboard');

            // ── AGENT: Start proactive chat ─────────────────────────────────
            console.log('--- [AGENT] Starting proactive chat ---');
            
            // Find the customer row and click "Start Proactive Chat" button
            // The button should have data-testid="start-proactive-chat-{customerId}"
            const startChatButton = agentPage.locator(`[data-testid="start-proactive-chat-${customerId}"]`);
            await expect(startChatButton).toBeVisible({ timeout: 10000 });
            const createSessionResponse = agentPage.waitForResponse(response =>
                response.request().method() === 'POST'
                && response.url().includes('/api/v1/proactive-chat/sessions'));
            await startChatButton.click();
            const sessionResponse = await createSessionResponse;
            expect(
                sessionResponse.ok(),
                `Create proactive chat failed (${sessionResponse.status()}): ${await sessionResponse.text()}`,
            ).toBeTruthy();
            console.log('✅ Agent clicked "Start Proactive Chat"');

            // Agent should see pending badge
            const pendingBadge = agentPage.locator('[data-testid="proactive-chat-pending-badge"]');
            await expect(pendingBadge).toBeVisible({ timeout: 5000 });
            console.log('✅ Agent sees pending badge');

            // ── CUSTOMER: Receive invitation and accept ─────────────────────
            console.log('--- [CUSTOMER] Receiving invitation ---');
            
            // Customer should see invitation card
            const inviteCard = customerPage.locator('[data-testid="proactive-chat-invite"]');
            await expect(inviteCard).toBeVisible({ timeout: 10000 });
            console.log('✅ Customer sees invitation');

            // Verify invitation content
            await expect(inviteCard.getByText(browserAgentProfile.fullName, { exact: true })).toBeVisible();
            
            // Click accept button
            const acceptButton = inviteCard.locator('[data-testid="accept-chat-button"]');
            await acceptButton.click();
            console.log('✅ Customer accepted invitation');

            // ── BOTH: Chat window should open ───────────────────────────────
            console.log('--- [BOTH] Verifying chat windows opened ---');
            
            const agentChatWindow = agentPage.locator('[data-testid="proactive-chat-window"]');
            const customerChatWindow = customerPage.locator('[data-testid="proactive-chat-window"]');
            
            await expect(agentChatWindow).toBeVisible({ timeout: 10000 });
            await expect(customerChatWindow).toBeVisible({ timeout: 10000 });
            console.log('✅ Both chat windows opened');

            // ── MESSAGING: Agent sends message ──────────────────────────────
            console.log('--- [MESSAGING] Agent → Customer ---');
            
            const agentMessageInput = agentChatWindow.locator('[data-testid="chat-message-input"]');
            const agentSendButton = agentChatWindow.locator('[data-testid="chat-send-button"]');
            
            const agentMessage = `Hello! This is an E2E test message from agent - ${Date.now()}`;
            await agentMessageInput.fill(agentMessage);
            await agentSendButton.click();
            console.log('✅ Agent sent message');

            // Customer should receive the message
            await expect(customerChatWindow.getByText(agentMessage, { exact: false })).toBeVisible({ timeout: 10000 });
            console.log('✅ Customer received agent message');

            // ── MESSAGING: Customer sends message ───────────────────────────
            console.log('--- [MESSAGING] Customer → Agent ---');
            
            const customerMessageInput = customerChatWindow.locator('[data-testid="chat-message-input"]');
            const customerSendButton = customerChatWindow.locator('[data-testid="chat-send-button"]');
            
            const customerMessage = `Thank you! E2E test reply from customer - ${Date.now()}`;
            await customerMessageInput.fill(customerMessage);
            await customerSendButton.click();
            console.log('✅ Customer sent message');

            // Agent should receive the message
            await expect(agentChatWindow.getByText(customerMessage, { exact: false })).toBeVisible({ timeout: 10000 });
            console.log('✅ Agent received customer message');

            // ── TYPING INDICATOR: Verify typing events ──────────────────────
            console.log('--- [TYPING] Verifying typing indicator ---');
            
            await customerMessageInput.fill('Customer is typing...');
            
            // Agent should see typing indicator
            const typingIndicator = agentChatWindow.locator('[data-testid="typing-indicator"]');
            await expect(typingIndicator).toBeVisible({ timeout: 5000 });
            console.log('✅ Agent sees typing indicator');

            // Clear input to stop typing
            await customerMessageInput.clear();
            await expect(typingIndicator).not.toBeVisible({ timeout: 5000 });
            console.log('✅ Typing indicator disappeared');

            // ── END SESSION: Agent ends the chat ────────────────────────────
            console.log('--- [END] Agent ending session ---');
            
            const endButton = agentChatWindow.locator('[data-testid="end-chat-button"]');
            await endButton.click();
            console.log('✅ Agent clicked end button');

            // The initiating agent closes the window; the remote customer stays in read-only mode.
            await expect(agentChatWindow).not.toBeVisible({ timeout: 5000 });
            await expect(customerChatWindow.getByText(/Oturum sona erdi|session ended/i).first()).toBeVisible({ timeout: 5000 });
            console.log('✅ Agent window closed and customer sees session ended');

            // Chat input is removed when the session becomes read-only.
            await expect(customerMessageInput).not.toBeVisible({ timeout: 5000 });
            console.log('✅ Customer input removed after session end');

            console.log('✅✅ HAPPY PATH COMPLETE');

        } finally {
            await agentContext.close();
            await customerContext.close();
        }
    });

    test('2. Customer Decline Scenario', async ({ browser }) => {
        const agentContext = await browser.newContext();
        const customerContext = await browser.newContext();
        
        const agentPage = await agentContext.newPage();
        const customerPage = await customerContext.newPage();

        try {
            // ── SETUP ────────────────────────────────────────────────────────
            const agentToken = await getAuthSession(agentEmail, agentPassword);
            const customerToken = await getAuthSession(customerEmail, customerPassword);
            const customerProfile = await apiGet('/auth/me', customerToken);
            const customerId = customerProfile.id;

            // ── AGENT: Start chat ───────────────────────────────────────────
            await loginAsAgent(agentPage);
            await agentPage.goto('/tr/customers');
            await agentPage.waitForLoadState('networkidle');

            const startChatButton = agentPage.locator(`[data-testid="start-proactive-chat-${customerId}"]`);
            await startChatButton.click();
            console.log('✅ Agent started chat');

            // ── CUSTOMER: Decline invitation ────────────────────────────────
            await loginAsCustomer(customerPage);
            
            const inviteCard = customerPage.locator('[data-testid="proactive-chat-invite"]');
            await expect(inviteCard).toBeVisible({ timeout: 10000 });
            
            const declineButton = inviteCard.locator('[data-testid="decline-chat-button"]');
            await declineButton.click();
            console.log('✅ Customer declined invitation');

            // Invite should disappear
            await expect(inviteCard).not.toBeVisible({ timeout: 5000 });
            console.log('✅ Invite card disappeared');

            // ── AGENT: Should receive decline notification ──────────────────
            // The WebSocket decline event removes the pending badge.
            const pendingBadge = agentPage.locator('[data-testid="proactive-chat-pending-badge"]');
            await expect(pendingBadge).not.toBeVisible({ timeout: 5000 });
            console.log('✅ Agent received decline state and pending badge disappeared');

            console.log('✅✅ DECLINE SCENARIO COMPLETE');

        } finally {
            await agentContext.close();
            await customerContext.close();
        }
    });

    test('3. Timeout Scenario (MISSED)', async ({ browser }) => {
        const agentContext = await browser.newContext();
        const customerContext = await browser.newContext();
        
        const agentPage = await agentContext.newPage();
        const customerPage = await customerContext.newPage();

        try {
            // ── SETUP ────────────────────────────────────────────────────────
            const agentToken = await getAuthSession(agentEmail, agentPassword);
            const customerToken = await getAuthSession(customerEmail, customerPassword);
            const customerProfile = await apiGet('/auth/me', customerToken);
            const customerId = customerProfile.id;

            // ── AGENT: Start chat ───────────────────────────────────────────
            await loginAsAgent(agentPage);
            await agentPage.goto('/tr/customers');
            await agentPage.waitForLoadState('networkidle');

            const startChatButton = agentPage.locator(`[data-testid="start-proactive-chat-${customerId}"]`);
            const createSessionResponse = agentPage.waitForResponse(response =>
                response.request().method() === 'POST'
                && response.url().includes('/api/v1/proactive-chat/sessions'));
            await startChatButton.click();
            const createdSession = await (await createSessionResponse).json();
            console.log('✅ Agent started chat');

            const pendingBadge = agentPage.locator('[data-testid="proactive-chat-pending-badge"]');
            await expect(pendingBadge).toBeVisible({ timeout: 5000 });

            // ── CUSTOMER: Login but don't respond ───────────────────────────
            await loginAsCustomer(customerPage);
            
            const inviteCard = customerPage.locator('[data-testid="proactive-chat-invite"]');
            await expect(inviteCard).toBeVisible({ timeout: 10000 });
            console.log('✅ Customer sees invite but will not respond');

            // ── WAIT: For timeout (120 seconds) ─────────────────────────────
            // Note: In real scenario this is 120s, but for E2E we might want to reduce
            // For now, we'll wait the full 120s to test the real behavior
            console.log('⏳ Waiting for 120s timeout...');
            
            await expect.poll(async () => {
                const sessions = await apiGet('/proactive-chat/sessions', agentToken);
                return sessions.find((session: any) => session.id === createdSession.id)?.status;
            }, { timeout: 125000, intervals: [1000, 2000, 5000] }).toBe('MISSED');
            console.log('✅ Session reached persisted MISSED status');

            // Pending badge should disappear
            await expect(pendingBadge).not.toBeVisible({ timeout: 5000 });
            console.log('✅ Pending badge disappeared');

            // ── CUSTOMER: Invite should disappear ───────────────────────────
            await expect(inviteCard).not.toBeVisible({ timeout: 5000 });
            console.log('✅ Customer invite disappeared after timeout');

            console.log('✅✅ TIMEOUT SCENARIO COMPLETE');

        } finally {
            await agentContext.close();
            await customerContext.close();
        }
    });

    test('4. Ticket Conversion', async ({ browser }) => {
        const agentContext = await browser.newContext();
        const customerContext = await browser.newContext();
        
        const agentPage = await agentContext.newPage();
        const customerPage = await customerContext.newPage();

        try {
            // ── SETUP: Create active chat session ───────────────────────────
            const agentToken = await getAuthSession(agentEmail, agentPassword);
            const customerToken = await getAuthSession(customerEmail, customerPassword);
            const customerProfile = await apiGet('/auth/me', customerToken);
            const customerId = customerProfile.id;

            // Start chat via API for faster setup
            const session = await apiPost('/proactive-chat/sessions', { customerId }, agentToken);
            const sessionId = session.id;
            console.log('✅ Session created via API:', sessionId);

            // Accept via API
            await apiPatch(`/proactive-chat/sessions/${sessionId}/accept`, customerToken);
            console.log('✅ Session accepted via API');

            // Send some messages via API
            await apiPost(`/proactive-chat/sessions/${sessionId}/messages`, {
                content: 'Agent message 1'
            }, agentToken);
            await apiPost(`/proactive-chat/sessions/${sessionId}/messages`, {
                content: 'Customer message 1'
            }, customerToken);
            await apiPost(`/proactive-chat/sessions/${sessionId}/messages`, {
                content: 'Agent message 2'
            }, agentToken);
            console.log('✅ Messages sent via API');

            // ── AGENT: Login and open chat window ───────────────────────────
            await loginAsAgent(agentPage);
            
            // Navigate to active sessions panel
            const activeSessionsPanel = await openActiveSessionsPanel(agentPage);
            
            // Click on the session to open chat window
            const sessionRow = activeSessionsPanel.locator(`[data-testid="session-row-${sessionId}"]`);
            await sessionRow.click();
            console.log('✅ Agent opened chat window');

            const chatWindow = agentPage.locator('[data-testid="proactive-chat-window"]');
            await expect(chatWindow).toBeVisible({ timeout: 5000 });

            // ── AGENT: Convert to ticket ────────────────────────────────────
            console.log('--- [CONVERT] Converting to ticket ---');
            
            const convertButton = chatWindow.locator('[data-testid="convert-to-ticket-button"]');
            await expect(convertButton).toBeVisible({ timeout: 5000 });
            const convertResponse = agentPage.waitForResponse(response =>
                response.request().method() === 'POST'
                && response.url().includes(`/api/v1/proactive-chat/sessions/${sessionId}/convert`));
            await convertButton.click();
            const conversion = await convertResponse;
            expect(
                conversion.ok(),
                `Convert session failed (${conversion.status()}): ${await conversion.text()}`,
            ).toBeTruthy();
            console.log('✅ Agent clicked convert button');

            // ── VERIFY: Check ticket was created via API ────────────────────
            const sessions = await apiGet('/proactive-chat/sessions', agentToken);
            const convertedSession = sessions.find((s: any) => s.id === sessionId);
            expect(convertedSession.convertedTicketId).toBeTruthy();
            console.log('✅ Ticket ID in session:', convertedSession.convertedTicketId);

            // Verify ticket exists and has messages
            const ticket = await apiGet(`/tickets/${convertedSession.convertedTicketId}`, agentToken);
            expect(ticket.id).toBe(convertedSession.convertedTicketId);
            console.log('✅ Ticket exists');

            // Verify messages were copied
            const ticketMessages = ticket.messages ?? [];
            expect(ticketMessages.length).toBeGreaterThanOrEqual(3); // At least 3 messages
            console.log('✅ Messages copied to ticket:', ticketMessages.length);

            // Verify the source session remains traceable on the ticket.
            expect(ticket.hotinfoSnapshot?.proactiveChatSessionId).toBe(sessionId);
            console.log('✅ Ticket source snapshot contains session ID');

            console.log('✅✅ TICKET CONVERSION COMPLETE');

        } finally {
            await agentContext.close();
            await customerContext.close();
        }
    });

    test('5. Multi-tab Protection (Customer)', async ({ browser }) => {
        const customerContext = await browser.newContext();
        
        const customerPage1 = await customerContext.newPage();
        const customerPage2 = await customerContext.newPage();

        try {
            // ── SETUP: Create pending session ───────────────────────────────
            const agentToken = await getAuthSession(agentEmail, agentPassword);
            const customerToken = await getAuthSession(customerEmail, customerPassword);
            const customerProfile = await apiGet('/auth/me', customerToken);
            const customerId = customerProfile.id;

            // ── CUSTOMER: Login in both tabs ────────────────────────────────
            await loginAsCustomer(customerPage1);
            await loginAsCustomer(customerPage2);
            console.log('✅ Customer logged in both tabs');

            // ── AGENT: Start chat via API ───────────────────────────────────
            const session = await apiPost('/proactive-chat/sessions', { customerId }, agentToken);
            console.log('✅ Session created via API');

            // ── CUSTOMER: Only one tab should show invite ───────────────────
            console.log('--- [MULTI-TAB] Checking invite visibility ---');
            
            // Wait a bit for WebSocket events to propagate
            await customerPage1.waitForTimeout(2000);
            await customerPage2.waitForTimeout(2000);

            const invite1 = customerPage1.locator('[data-testid="proactive-chat-invite"]');
            const invite2 = customerPage2.locator('[data-testid="proactive-chat-invite"]');

            // Check visibility in both tabs
            const visible1 = await invite1.isVisible().catch(() => false);
            const visible2 = await invite2.isVisible().catch(() => false);

            // Exactly one should be visible
            expect(visible1 || visible2).toBe(true);
            expect(visible1 && visible2).toBe(false);
            console.log('✅ Invite shown in only one tab');

            // The tab with the invite should be able to accept
            const activeTab = visible1 ? customerPage1 : customerPage2;
            const activeInvite = visible1 ? invite1 : invite2;

            const acceptButton = activeInvite.locator('[data-testid="accept-chat-button"]');
            await acceptButton.click();
            console.log('✅ Customer accepted in active tab');

            // Both tabs should now show chat window (or at least the active one)
            const chatWindow = activeTab.locator('[data-testid="proactive-chat-window"]');
            await expect(chatWindow).toBeVisible({ timeout: 10000 });
            console.log('✅ Chat window opened');

            console.log('✅✅ MULTI-TAB PROTECTION VERIFIED');

        } finally {
            await customerContext.close();
        }
    });

    test('6. Session Isolation (Authorization)', async ({ browser }) => {
        const agentContext = await browser.newContext();
        const customer1Context = await browser.newContext();
        const customer2Context = await browser.newContext();
        
        const agentPage = await agentContext.newPage();
        const customer1Page = await customer1Context.newPage();
        const customer2Page = await customer2Context.newPage();

        try {
            // ── SETUP: Get tokens ───────────────────────────────────────────
            const agentToken = await getAuthSession(agentEmail, agentPassword);
            const [customer1Token, customer2Token] = await Promise.all([
                getAuthSession(customerEmail, customerPassword),
                getAuthSession(customerTwoEmail, customerTwoPassword),
            ]);
            
            // For customer2, we'll use a different customer if available
            // For this test, we'll just verify API-level isolation
            const customer1Profile = await apiGet('/auth/me', customer1Token);
            const customer1Id = customer1Profile.id;

            // ── AGENT: Create session with customer1 ────────────────────────
            const session = await apiPost('/proactive-chat/sessions', { customerId: customer1Id }, agentToken);
            const sessionId = session.id;
            console.log('✅ Session created with customer1');

            // Accept and send messages
            await apiPatch(`/proactive-chat/sessions/${sessionId}/accept`, customer1Token);
            await apiPost(`/proactive-chat/sessions/${sessionId}/messages`, {
                content: 'Private message from customer1'
            }, customer1Token);
            console.log('✅ Session active with messages');

            // ── VERIFY: Customer1 can access messages ───────────────────────
            const messages = await apiGet(`/proactive-chat/sessions/${sessionId}/messages`, customer1Token);
            expect(messages.length).toBeGreaterThan(0);
            console.log('✅ Customer1 can access messages');

            // ── VERIFY: A different authenticated customer is forbidden ─────
            const unauthorizedAttempt = await fetch(`${BASE_API}/proactive-chat/sessions/${sessionId}/messages`, {
                method: 'GET',
                headers: { 'Authorization': `Bearer ${customer2Token.accessToken}` }
            });
            expect(unauthorizedAttempt.status).toBe(403);
            console.log('✅ Cross-customer access rejected');

            // ── VERIFY: Agent can access (they're part of the session) ──────
            const agentMessages = await apiGet(`/proactive-chat/sessions/${sessionId}/messages`, agentToken);
            expect(agentMessages.length).toBeGreaterThan(0);
            console.log('✅ Agent can access messages (authorized)');

            console.log('✅✅ SESSION ISOLATION VERIFIED');

        } finally {
            await agentContext.close();
            await customer1Context.close();
            await customer2Context.close();
        }
    });

    test('7. Disconnect Timeout (60s)', async ({ browser }) => {
        test.setTimeout(150000);
        const agentContext = await browser.newContext();
        const customerContext = await browser.newContext();
        
        const agentPage = await agentContext.newPage();
        const customerPage = await customerContext.newPage();

        try {
            // ── SETUP: Create active session ────────────────────────────────
            const agentToken = await getAuthSession(agentEmail, agentPassword);
            const customerToken = await getAuthSession(customerEmail, customerPassword);
            const customerProfile = await apiGet('/auth/me', customerToken);
            const customerId = customerProfile.id;

            // Create through the API, then accept in the browser so websocket
            // presence is established before the disconnect assertion.
            const session = await apiPost('/proactive-chat/sessions', { customerId }, agentToken);
            console.log('✅ Pending session created');

            await loginAsCustomer(customerPage);
            const inviteCard = customerPage.getByTestId('proactive-chat-invite');
            await expect(inviteCard).toBeVisible({ timeout: 10000 });
            await inviteCard.getByTestId('accept-chat-button').click();
            await expect(customerPage.getByTestId('proactive-chat-window')).toBeVisible({ timeout: 10000 });
            console.log('✅ Customer accepted and live chat opened');

            // ── AGENT: Login and open chat ──────────────────────────────────
            await loginAsAgent(agentPage);
            const activeSessionsPanel = await openActiveSessionsPanel(agentPage);
            
            const sessionRow = activeSessionsPanel.locator(`[data-testid="session-row-${session.id}"]`);
            await sessionRow.click();
            
            const agentChatWindow = agentPage.locator('[data-testid="proactive-chat-window"]');
            await expect(agentChatWindow).toBeVisible({ timeout: 5000 });
            console.log('✅ Agent chat window opened');

            // ── CUSTOMER: Login and open chat ───────────────────────────────
            // ── DISCONNECT: Close customer page ─────────────────────────────
            console.log('--- [DISCONNECT] Closing customer context ---');
            await customerContext.close();
            console.log('✅ Customer disconnected');

            // ── WAIT: For disconnect timeout (60s) ──────────────────────────
            console.log('⏳ Waiting for 60s disconnect timeout...');
            await expect.poll(async () => {
                const sessions = await apiGet('/proactive-chat/sessions', agentToken);
                return sessions.find((candidate: any) => candidate.id === session.id)?.status;
            }, { timeout: 90000, intervals: [1000, 2000, 5000] }).toBe('ENDED');

            // ── VERIFY: Session should be ENDED ─────────────────────────────
            console.log('✅ Session marked as ENDED after disconnect timeout');

            // Agent should see session ended notification
            await expect(agentChatWindow.getByText('Oturum sona erdi', { exact: true })).toBeVisible({ timeout: 5000 });
            await expect(agentChatWindow.getByTestId('chat-message-input')).not.toBeVisible();
            console.log('✅ Agent sees session ended notification');

            console.log('✅✅ DISCONNECT TIMEOUT COMPLETE');

        } finally {
            await agentContext.close();
            await customerContext.close().catch(() => undefined);
        }
    });

    test('8. Offline Customer Notification', async ({ browser }) => {
        const agentContext = await browser.newContext();
        
        const agentPage = await agentContext.newPage();

        try {
            // ── SETUP: Get customer ID ──────────────────────────────────────
            const agentToken = await getAuthSession(agentEmail, agentPassword);
            const customerToken = await getAuthSession(customerEmail, customerPassword);
            const customerProfile = await apiGet('/auth/me', customerToken);
            const customerId = customerProfile.id;

            console.log('--- [SETUP] Customer is offline (not logged in) ---');

            // ── AGENT: Start chat while customer is offline ─────────────────
            await loginAsAgent(agentPage);
            await agentPage.goto('/tr/customers');
            await agentPage.waitForLoadState('networkidle');

            const startChatButton = agentPage.locator(`[data-testid="start-proactive-chat-${customerId}"]`);
            await startChatButton.click();
            console.log('✅ Agent started chat with offline customer');

            // Wait a bit for backend to process
            await agentPage.waitForTimeout(2000);

            // ── VERIFY: Notification should be created in database ──────────
            // Check via API that a notification was created for the customer
            const notifications = await apiGet('/notifications', customerToken);
            const proactiveChatNotification = notifications.find((n: any) => 
                n.type === 'PROACTIVE_CHAT_INCOMING' || 
                n.message?.includes('chat') || 
                n.message?.includes('proactive')
            );

            expect(proactiveChatNotification).toBeTruthy();
            console.log('✅ Notification created for offline customer');

            // ── VERIFY: Session should remain PENDING ───────────────────────
            const sessions = await apiGet('/proactive-chat/sessions', agentToken);
            const pendingSession = sessions.find((s: any) => 
                s.customerId === customerId && s.status === 'PENDING'
            );

            expect(pendingSession).toBeTruthy();
            console.log('✅ Session remains PENDING for offline customer');

            console.log('✅✅ OFFLINE CUSTOMER NOTIFICATION COMPLETE');

        } finally {
            await agentContext.close();
        }
    });

    test('9. Duplicate Session Protection', async ({ browser }) => {
        const agentContext = await browser.newContext();
        const customer1Context = await browser.newContext();
        const customer2Context = await browser.newContext();
        
        const agentPage = await agentContext.newPage();
        const customer1Page = await customer1Context.newPage();
        const customer2Page = await customer2Context.newPage();

        try {
            // ── SETUP: Get tokens and customer IDs ──────────────────────────
            const agentToken = await getAuthSession(agentEmail, agentPassword);
            const customer1Token = await getAuthSession(customerEmail, customerPassword);
            
            // For customer2, we'll use the same customer but simulate different sessions
            // In a real scenario, you'd have a second customer account
            const customer1Profile = await apiGet('/auth/me', customer1Token);
            const customer1Id = customer1Profile.id;

            // Note: For this test to work properly, you need a second customer
            // For now, we'll test that an agent can't have multiple PENDING sessions
            // with the same customer

            console.log('--- [SETUP] Testing concurrent session limits ---');

            // ── AGENT: Try to create two sessions with same customer ────────
            const session1 = await apiPost('/proactive-chat/sessions', { customerId: customer1Id }, agentToken);
            console.log('✅ First session created');

            // Try to create second session - should fail with 409
            try {
                await apiPost('/proactive-chat/sessions', { customerId: customer1Id }, agentToken);
                throw new Error('Second session should have been rejected');
            } catch (error: any) {
                expect(error.message).toContain('409');
                console.log('✅ Second session rejected (409 Conflict)');
            }

            // ── VERIFY: Agent can have multiple sessions with different customers ──
            // This would require a second customer account
            // For now, we verify the single session works correctly

            await loginAsAgent(agentPage);
            const activeSessionsPanel = await openActiveSessionsPanel(agentPage);
            
            // Should see the one pending session
            const sessionRow = activeSessionsPanel.locator(`[data-testid="session-row-${session1.id}"]`);
            await expect(sessionRow).toBeVisible({ timeout: 5000 });
            console.log('✅ Agent sees pending session in panel');

            // ── CUSTOMER: Accept first session ──────────────────────────────
            await loginAsCustomer(customer1Page);
            
            const inviteCard = customer1Page.locator('[data-testid="proactive-chat-invite"]');
            await expect(inviteCard).toBeVisible({ timeout: 10000 });
            
            const acceptButton = inviteCard.locator('[data-testid="accept-chat-button"]');
            await acceptButton.click();
            console.log('✅ Customer accepted first session');

            // The same pair cannot create a duplicate ACTIVE session.
            await expect(apiPost(
                '/proactive-chat/sessions',
                { customerId: customer1Id },
                agentToken,
            )).rejects.toThrow('409');
            console.log('✅ Duplicate ACTIVE session rejected (409 Conflict)');

            // Verify only one non-terminal session exists for this pair.
            const sessions = await apiGet('/proactive-chat/sessions', agentToken);
            const pairSessions = sessions.filter((candidate: any) =>
                candidate.customerId === customer1Id
                && ['PENDING', 'ACTIVE'].includes(candidate.status),
            );
            expect(pairSessions).toHaveLength(1);
            expect(pairSessions[0].id).toBe(session1.id);
            console.log('✅ Exactly one non-terminal session remains for the pair');

            console.log('✅✅ DUPLICATE SESSION PROTECTION COMPLETE');

        } finally {
            await agentContext.close();
            await customer1Context.close();
            await customer2Context.close();
        }
    });
});
