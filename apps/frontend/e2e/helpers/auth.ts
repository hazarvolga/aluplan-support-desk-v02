import { Page, BrowserContext, expect } from '@playwright/test';
import { extractAccessTokenFromSetCookie } from './auth-cookie';

/**
 * Test credentials. Defaults match `apps/backend/seed-e2e.ts`. CI overrides
 * via env vars; do not hardcode secrets in specs.
 */
export const TEST_USERS = {
    admin: {
        email: process.env.E2E_ADMIN_EMAIL || 'e2e-admin@aluplan.test',
        password: process.env.E2E_ADMIN_PASSWORD || 'E2eAdmin!Pass123',
    },
    agent: {
        email: process.env.E2E_AGENT_EMAIL || 'e2e-agent@aluplan.test',
        password: process.env.E2E_AGENT_PASSWORD || 'E2eAgent!Pass123',
    },
    customer: {
        email: process.env.E2E_CUSTOMER_EMAIL || 'e2e-customer@aluplan.test',
        password: process.env.E2E_CUSTOMER_PASSWORD || 'E2eCustomer!Pass123',
    },
} as const;

interface LoginOptions {
    maxRetries?: number;
    timeout?: number;
    debug?: boolean;
}

/**
 * Login a page session with the given credentials. Tolerates hydration
 * races and intermittent CSRF token resets.
 */
export async function login(
    page: Page,
    email: string,
    password: string,
    options: LoginOptions = {},
) {
    const { maxRetries = 3, timeout = 120000, debug = false } = options;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
            if (debug) console.log(`--- [AUTH] Login attempt ${attempt}/${maxRetries} for ${email} ---`);

            await page.goto('/tr/login');
            // Don't waitForLoadState('networkidle') — under `next dev` hot-reload
            // never lets the network settle and the wait expires. The selector
            // wait below is enough to confirm the page is interactive.
            await page.waitForSelector('[data-testid="login-email"]', { timeout: 90000 });

            await page.getByTestId('login-email').clear();
            await page.getByTestId('login-email').fill(email);
            await page.waitForTimeout(500);

            await page.getByTestId('login-password').clear();
            await page.getByTestId('login-password').fill(password);
            await page.waitForTimeout(500);

            await page.getByTestId('login-submit').click();

            // Admin/agent land on /dashboard, customer lands on /my-tickets;
            // accept any post-login URL that no longer points at /login.
            const result = await Promise.race([
                page.waitForURL((url) => !url.pathname.endsWith('/login'), { timeout }).then(() => 'success' as const),
                page.getByTestId('error-message').waitFor({ state: 'visible', timeout: 5000 }).then(() => 'error' as const),
            ]).catch(() => 'timeout' as const);

            if (result === 'success') {
                if (debug) console.log(`Login OK on attempt ${attempt}`);
                return;
            }

            if (result === 'error') {
                const text = await page.getByTestId('error-message').textContent();
                console.log(`Login attempt ${attempt} failed: ${text}`);
            } else {
                console.log(`Login attempt ${attempt} timed out`);
            }

            await page.context().clearCookies();
            await page.waitForTimeout(2000);
        } catch (err: any) {
            console.log(`Login attempt ${attempt} error: ${err.message}`);
            if (attempt === maxRetries) {
                throw new Error(`Failed to login as ${email} after ${maxRetries} attempts: ${err.message}`);
            }
            await page.context().clearCookies();
            await page.waitForTimeout(2000);
        }
    }

    throw new Error(`Failed to login as ${email} after ${maxRetries} attempts`);
}

export const loginAsAdmin = (page: Page, options?: LoginOptions) =>
    login(page, TEST_USERS.admin.email, TEST_USERS.admin.password, options);

export const loginAsAgent = (page: Page, options?: LoginOptions) =>
    login(page, TEST_USERS.agent.email, TEST_USERS.agent.password, options);

export const loginAsCustomer = (page: Page, options?: LoginOptions) =>
    login(page, TEST_USERS.customer.email, TEST_USERS.customer.password, options);

/**
 * Get a JWT for HTTP-level testing (when you don't need a real browser session).
 * Hits the login endpoint directly.
 */
export async function getAuthToken(
    context: BrowserContext,
    email: string,
    password: string,
): Promise<string> {
    const apiBase = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
    const response = await context.request.post(`${apiBase}/api/v1/auth/login`, {
        data: { email, password },
        headers: { 'X-Requested-With': 'XMLHttpRequest' },
    });
    if (!response.ok()) {
        throw new Error(`getAuthToken failed: ${response.status()} ${await response.text()}`);
    }
    return extractAccessTokenFromSetCookie(response.headers()['set-cookie']);
}
