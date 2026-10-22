import { test, expect } from '@playwright/test';
import { LoginPage } from './pages/LoginPage';
import { DashboardPage } from './pages/DashboardPage';
import { TEST_USERS } from './helpers/auth';

test.describe('Authentication Flow', () => {
    test.use({ storageState: { cookies: [], origins: [] } });

    test('should load login page with correct elements', async ({ page }) => {
        const loginPage = new LoginPage(page);
        await loginPage.navigateTo('/tr/login');

        await expect(loginPage.emailInput).toBeVisible();
        await expect(loginPage.passwordInput).toBeVisible();
        await expect(loginPage.submitButton).toBeVisible();
    });

    test('should show error message on invalid credentials', async ({ page }) => {
        const loginPage = new LoginPage(page);
        await loginPage.navigateTo('/tr/login');

        await loginPage.login('invalid@example.com', 'wrongpassword123');

        await expect(loginPage.getErrorMessage()).toBeVisible({ timeout: 10000 });
    });

    test('should redirect to dashboard on valid credentials', async ({ page }) => {
        const loginPage = new LoginPage(page);
        const dashboardPage = new DashboardPage(page);

        await loginPage.navigateTo('/tr/login');
        const { email, password } = TEST_USERS.admin;

        await loginPage.loginWithRetry(email, password);
        expect(await dashboardPage.isAtDashboard()).toBe(true);
    });

    test('should display system requirements accordion', async ({ page }) => {
        const loginPage = new LoginPage(page);
        await loginPage.navigateTo('/tr/login');

        await expect(loginPage.requirementAccordion).toBeVisible({ timeout: 120000 });
        await expect(page.getByText(/ALLPLAN 2026/i)).toBeVisible();
    });

    test('a stale refresh in one tab cannot clear a newer shared session marker', async ({ page, context }) => {
        const apiBase = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1').replace(/\/$/, '');
        const { email, password } = TEST_USERS.rememberMe;
        const waitForAnonymousRefresh = () => page.waitForResponse((response) =>
            response.url().endsWith('/api/v1/auth/refresh')
            && response.request().method() === 'POST',
        );
        const browserLogin = async () => page.evaluate(async ({ baseUrl, userEmail, userPassword }) => {
            const response = await fetch(`${baseUrl}/auth/login`, {
                method: 'POST',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json',
                    'X-Requested-With': 'XMLHttpRequest',
                },
                body: JSON.stringify({ email: userEmail, password: userPassword, rememberMe: true }),
            });
            return response.status;
        }, { baseUrl: apiBase, userEmail: email, userPassword: password });

        const anonymousRefresh = waitForAnonymousRefresh();
        await page.goto('/tr/login');
        expect((await anonymousRefresh).status()).toBe(401);
        expect(await browserLogin()).toBe(200);

        const staleTab = await context.newPage();
        let releaseStaleRefresh: (() => void) | undefined;
        let staleRefreshHeaders: Record<string, string> | undefined;
        const staleRefreshStarted = new Promise<void>((resolve) => {
            staleTab.route(`${apiBase}/auth/refresh`, async (route) => {
                staleRefreshHeaders = route.request().headers();
                resolve();
                await new Promise<void>((release) => {
                    releaseStaleRefresh = release;
                });
                await route.continue({ headers: staleRefreshHeaders ?? route.request().headers() });
            });
        });

        await staleTab.goto('/tr/login');
        const staleRefresh = staleTab.evaluate(async (baseUrl) => {
            const response = await fetch(`${baseUrl}/auth/refresh`, {
                method: 'POST',
                credentials: 'include',
                headers: { 'X-Requested-With': 'XMLHttpRequest' },
            });
            return response.status;
        }, apiBase);
        await staleRefreshStarted;

        expect(await browserLogin()).toBe(200);
        releaseStaleRefresh?.();
        expect(await staleRefresh).toBe(403);

        const authCookieNames = (await context.cookies())
            .filter(({ name }) => ['alu_at', 'alu_rt', 'alu_session'].includes(name))
            .map(({ name }) => name)
            .sort();
        expect(authCookieNames).toEqual(['alu_at', 'alu_rt', 'alu_session']);
        expect(await page.evaluate(async (baseUrl) => {
            const response = await fetch(`${baseUrl}/auth/me`, { credentials: 'include' });
            return response.status;
        }, apiBase)).toBe(200);

        await staleTab.close();
    });

    test('remember me persists, rotates at the absolute deadline, and logout revokes replay', async ({ page, context }) => {
        const daySeconds = 24 * 60 * 60;
        const apiBase = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1').replace(/\/$/, '');
        const { email, password } = TEST_USERS.rememberMe;
        const loginPage = new LoginPage(page);
        const authCookies = async () => (await context.cookies())
            .filter(({ name }) => ['alu_at', 'alu_rt', 'alu_session'].includes(name));
        const cookie = async (name: string) => {
            const found = (await authCookies()).find((candidate) => candidate.name === name);
            expect(found, `${name} cookie should exist`).toBeDefined();
            return found!;
        };

        const waitForAnonymousRefresh = () => page.waitForResponse((response) =>
            response.url().endsWith('/api/v1/auth/refresh')
            && response.request().method() === 'POST',
        );

        const initialAnonymousRefresh = waitForAnonymousRefresh();
        await loginPage.navigateTo('/tr/login');
        expect((await initialAnonymousRefresh).status()).toBe(401);
        const initialLoginResponse = page.waitForResponse((response) =>
            response.url().endsWith('/api/v1/auth/login')
            && response.request().method() === 'POST',
        );
        await loginPage.login(email, password);
        const initialLoginCookieHeaders = (await (await initialLoginResponse).headersArray())
            .filter(({ name }) => name.toLowerCase() === 'set-cookie')
            .map(({ value }) => value);
        const initialSessionCookie = initialLoginCookieHeaders
            .find((value) => value.startsWith('alu_session='));
        expect(initialSessionCookie).toBeDefined();
        expect(initialSessionCookie!.split(';', 1)[0].length).toBeGreaterThan(30);
        expect(initialSessionCookie).not.toContain('Domain=undefined');
        await page.waitForURL((url) => !url.pathname.endsWith('/login'));
        await expect.poll(async () => (await authCookies()).map(({ name }) => name).sort())
            .toEqual(['alu_at', 'alu_rt', 'alu_session']);
        expect((await cookie('alu_at')).expires).toBe(-1);
        expect((await cookie('alu_rt')).expires).toBe(-1);
        expect((await cookie('alu_session')).expires).toBe(-1);

        await context.clearCookies();
        const rememberedAnonymousRefresh = waitForAnonymousRefresh();
        await loginPage.navigateTo('/tr/login');
        expect((await rememberedAnonymousRefresh).status()).toBe(401);
        await page.getByTestId('login-email').fill(email);
        await page.getByTestId('login-password').fill(password);
        await page.getByTestId('login-remember-me').check();
        await page.getByTestId('login-submit').click();
        await page.waitForURL((url) => !url.pathname.endsWith('/login'));
        await expect.poll(async () => (await authCookies()).map(({ name }) => name).sort())
            .toEqual(['alu_at', 'alu_rt', 'alu_session']);

        const originalRefresh = await cookie('alu_rt');
        const originalSession = await cookie('alu_session');
        const now = Date.now() / 1000;
        expect((await cookie('alu_at')).expires).toBe(-1);
        expect(originalRefresh.expires).toBeGreaterThan(now + 29 * daySeconds);
        expect(originalRefresh.expires).toBeLessThan(now + 31 * daySeconds);
        expect(originalSession.expires).toBeGreaterThan(now + 29 * daySeconds);
        expect(originalRefresh.path).toBe('/api/v1/auth/refresh');
        expect(originalSession.path).toBe('/');

        await context.clearCookies({ name: 'alu_at' });
        const refreshed = await page.evaluate(async (baseUrl) => {
            const response = await fetch(`${baseUrl}/auth/refresh`, {
                method: 'POST',
                credentials: 'include',
                headers: { 'X-Requested-With': 'XMLHttpRequest' },
            });
            return { status: response.status, body: await response.text() };
        }, apiBase);
        expect(refreshed).toEqual({
            status: 200,
            body: '{"success":true}',
        });
        await page.goto('/tr/my-tickets');
        await expect(page.getByRole('button', { name: 'Güvenli Çıkış' })).toBeVisible();

        const rotatedAccess = await cookie('alu_at');
        const rotatedRefresh = await cookie('alu_rt');
        expect(rotatedRefresh.value).not.toBe(originalRefresh.value);
        expect(Math.abs(rotatedRefresh.expires - originalRefresh.expires)).toBeLessThanOrEqual(5);

        await context.clearCookies({ name: 'alu_at' });
        const accessLogoutResponse = page.waitForResponse((response) =>
            response.url().endsWith('/api/v1/auth/logout')
            && response.request().method() === 'POST',
        );
        const refreshLogoutResponse = page.waitForResponse((response) =>
            response.url().endsWith('/api/v1/auth/refresh/logout')
            && response.request().method() === 'POST',
        );
        await page.getByRole('button', { name: 'Güvenli Çıkış' }).click();
        expect([401, 403]).toContain((await accessLogoutResponse).status());
        expect((await refreshLogoutResponse).status()).toBe(200);
        await expect(page).toHaveURL(/\/tr\/login$/);
        await expect.poll(authCookies).toEqual([]);

        const replayHeaders = {
            Origin: 'http://localhost:3000',
            'X-Requested-With': 'XMLHttpRequest',
        };
        expect((await context.request.get(`${apiBase}/auth/me`, {
            headers: { ...replayHeaders, Cookie: `alu_at=${rotatedAccess.value}` },
        })).status()).toBe(401);
        expect([401, 403]).toContain((await context.request.post(`${apiBase}/auth/refresh`, {
            headers: { ...replayHeaders, Cookie: `alu_rt=${rotatedRefresh.value}` },
        })).status());
    });
});
