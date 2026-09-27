import { test, expect } from '@playwright/test';

/** Local-only smoke checks. External staging needs its own explicit workflow. */
const FRONTEND_URL = 'http://localhost:3000';
const API_URL = 'http://localhost:4000';

test.describe('Smoke Tests', () => {
    test('Landing page loads', async ({ page }) => {
        await page.goto(FRONTEND_URL);
        await expect(page.locator('#landing-hub-root')).toBeVisible();
        await expect(page.locator('#nav-login-btn')).toBeVisible();
    });

    test('API health check', async ({ request }) => {
        const response = await request.get(`${API_URL}/api/v1/health`);
        expect(response.status()).toBe(200);
        const body = await response.json();
        expect(body.status).toBe('ok');
    });

    test('Login page renders', async ({ page }) => {
        await page.goto(`${FRONTEND_URL}/tr/login`);
        await expect(page.getByTestId('login-submit')).toBeVisible();
    });

    test('API docs protected', async ({ request }) => {
        const response = await request.get(`${API_URL}/api/docs`);
        expect(response.status()).toBe(401);
    });
});
