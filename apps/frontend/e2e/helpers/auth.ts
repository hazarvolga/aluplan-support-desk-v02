import { Page, expect } from '@playwright/test';

/**
 * Robust login helper for E2E tests v2.
 * 
 * Improvements:
 * - Single click with race condition handling
 * - Proper hydration waits
 * - Better error detection
 * - Configurable timeouts and retries
 */

interface LoginOptions {
    maxRetries?: number;
    timeout?: number;
    debug?: boolean;
}

export async function loginAsAdmin(page: Page, options: LoginOptions = {}) {
    const {
        maxRetries = 3,
        timeout = 45000,
        debug = false
    } = options;

    const email = process.env.E2E_ADMIN_EMAIL || 'hazarvolga@gmail.com';
    const password = process.env.E2E_ADMIN_PASSWORD || 'Vol1872017';

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
            if (debug) console.log(`--- [AUTH] Admin Login Attempt ${attempt}/${maxRetries} ---`);
            
            await page.goto('/tr/login');
            
            // Wait for page to be fully loaded and hydrated
            await page.waitForLoadState('networkidle');
            await page.waitForSelector('[data-testid="login-email"]', { timeout });
            
            if (debug) await page.screenshot({ path: `debug-login-${attempt}-1-page-loaded.png` });

            // Fill credentials with delays for React hydration
            await page.getByTestId('login-email').clear();
            await page.getByTestId('login-email').fill(email);
            await page.waitForTimeout(500); // Hydration buffer
            
            await page.getByTestId('login-password').clear();
            await page.getByTestId('login-password').fill(password);
            await page.waitForTimeout(500); // Hydration buffer

            if (debug) await page.screenshot({ path: `debug-login-${attempt}-2-form-filled.png` });

            // Single click with race condition handling
            await page.getByTestId('login-submit').click();
            
            if (debug) console.log('Waiting for navigation or error...');

            // Wait for either success (navigation) or error message
            const result = await Promise.race([
                page.waitForURL(/.*\/dashboard/, { timeout }).then(() => 'success' as const),
                page.getByTestId('error-message').waitFor({ 
                    state: 'visible', 
                    timeout: 5000 
                }).then(() => 'error' as const)
            ]).catch(() => 'timeout' as const);

            if (result === 'success') {
                if (debug) console.log(`✅ Admin authenticated successfully (attempt ${attempt})`);
                return;
            }

            // Handle error or timeout
            if (result === 'error') {
                const errorText = await page.getByTestId('error-message').textContent();
                console.log(`⚠️ Login attempt ${attempt} failed with error: ${errorText}`);
            } else {
                console.log(`⚠️ Login attempt ${attempt} timed out`);
            }

            if (debug) await page.screenshot({ path: `debug-login-${attempt}-3-failed.png` });

            // Clear cookies and wait before retry
            await page.context().clearCookies();
            await page.waitForTimeout(2000);

        } catch (error: any) {
            console.log(`⚠️ Login attempt ${attempt} error: ${error.message}`);
            
            if (debug) {
                await page.screenshot({ path: `debug-login-${attempt}-error.png` });
            }

            if (attempt === maxRetries) {
                throw new Error(`Failed to login as admin after ${maxRetries} attempts: ${error.message}`);
            }

            await page.context().clearCookies();
            await page.waitForTimeout(2000);
        }
    }

    throw new Error(`Failed to login as admin after ${maxRetries} attempts`);
}
