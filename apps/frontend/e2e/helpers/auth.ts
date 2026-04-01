import { Page, expect } from '@playwright/test';

/**
 * Robust login helper for E2E tests.
 * Retries login if 'Invalid credentials' or timeout occurs.
 */
export async function loginAsAdmin(page: Page) {
    const email = 'e2e-test@aluplan.com';
    const password = 'pass123';

    for (let attempt = 1; attempt <= 3; attempt++) {
        try {
            console.log(`--- [AUTH] Admin Login Attempt ${attempt} ---`);
            await page.goto('/tr/login');
            await page.waitForSelector('[data-testid="login-email"]', { timeout: 30000 });

            // Fill with small delays
            await page.getByTestId('login-email').clear();
            await page.getByTestId('login-email').pressSequentially(email, { delay: 50 });
            await page.getByTestId('login-password').clear();
            await page.getByTestId('login-password').pressSequentially(password, { delay: 50 });

            await page.waitForTimeout(1000);

            // Try to click or press Enter
            await page.getByTestId('login-submit').click();

            // Wait for dashboard with a generous timeout
            try {
                await page.waitForURL(/.*\/dashboard/, { timeout: 30000 });
                console.log('✅ Admin authenticated successfully');
                return;
            } catch (e) {
                // Check if error message is present
                const errorVisible = await page.getByTestId('error-message').isVisible();
                if (!errorVisible) {
                    // Try clicking again, maybe the first click was ignored during hydration
                    await page.getByTestId('login-submit').click();
                    await page.waitForURL(/.*\/dashboard/, { timeout: 30000 });
                    console.log('✅ Admin authenticated successfully (on second click)');
                    return;
                }
                console.log(`⚠️ Login attempt ${attempt} failed with error visible. Retrying...`);
            }
        } catch (e: any) {
            console.log(`⚠️ Login attempt ${attempt} failed: ${e.message}. Retrying...`);
        }

        await page.context().clearCookies();
        await page.waitForTimeout(2000);
    }

    throw new Error('Failed to login as admin after 3 attempts');
}
