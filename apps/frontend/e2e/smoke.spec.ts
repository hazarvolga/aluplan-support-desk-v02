import { test, expect } from '@playwright/test';

/**
 * Staging Smoke Tests
 * 
 * Quick health checks for staging environment.
 * Run: npx playwright test smoke.spec.ts --project=staging
 */

const BASE_URL = process.env.STAGING_URL || 'https://staging.allplan.net.tr';

test.describe('Staging Smoke Tests', () => {
    test('Landing page loads', async ({ page }) => {
        await page.goto(BASE_URL);
        await expect(page.locator('body')).toBeVisible();
        await expect(page.locator('input[name="email"]')).toBeVisible();
    });

    test('API health check', async ({ request }) => {
        const response = await request.get(`${BASE_URL}/api/v1/health`);
        expect(response.status()).toBe(200);
        const body = await response.json();
        expect(body.status).toBe('ok');
    });

    test('Login page renders', async ({ page }) => {
        await page.goto(`${BASE_URL}/login`);
        await expect(page.locator('button[type="submit"]')).toBeVisible();
    });

    test('API docs protected', async ({ request }) => {
        const response = await request.get(`${BASE_URL}/api/docs`);
        expect(response.status()).toBe(401);
    });
});
