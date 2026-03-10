import { test, expect } from '@playwright/test';

/**
 * 🛠️ DIAGNOSTIC E2E TEST
 * Goal: Identify why the Admin Panel is unclickable and capture the 7 console errors.
 * 
 * Run with: 
 * pnpm --filter @aluplan/frontend exec playwright test e2e/diagnose-admin-ui.spec.ts --project=chromium --headed
 */

test.describe('Admin Panel Interactivity Diagnostic', () => {

    test('should login and detect interaction blockers', async ({ page }) => {
        const errors: string[] = [];

        // 1. Capture all console errors and network failures
        page.on('console', msg => {
            console.log(`[BROWSER ${msg.type().toUpperCase()}]: ${msg.text()}`);
            if (msg.type() === 'error') errors.push(msg.text());
        });

        page.on('requestfailed', request => {
            console.log(`[NETWORK ERROR]: ${request.method()} ${request.url()} - ${request.failure()?.errorText}`);
        });

        page.on('response', response => {
            if (response.url().includes('/auth/login') || response.url().includes('/auth/me')) {
                console.log(`[API RESPONSE]: ${response.url()} -> Status ${response.status()}`);
            }
        });

        // 2. Navigate to root (localized)
        console.log('Navigating to root page...');
        await page.goto('/tr');
        console.log(`Current URL: ${page.url()}`);

        // 3. Perform login using data-testid
        console.log('Filling login credentials...');
        await page.fill('[data-testid="login-email"]', 'hazarvolga@gmail.com');
        await page.fill('[data-testid="login-password"]', 'Vol?*187');

        console.log('Clicking submit...');
        await page.click('[data-testid="login-submit"]');

        // 4. Wait for dashboard transition with more feedback
        console.log('Waiting for dashboard redirect...');
        try {
            await page.waitForURL('**/dashboard', { timeout: 30000 });
            console.log(`✅ Redirected to: ${page.url()}`);
        } catch (e) {
            console.log(`❌ TIMEOUT waiting for dashboard. Current URL: ${page.url()}`);
            await page.screenshot({ path: 'e2e-timeout-diagnostic.png', fullPage: true });
            throw e;
        }

        // 5. Short wait for hydration/animations
        console.log('Waiting for hydration (3s)...');
        await page.waitForTimeout(3000);

        // 6. ATTEMPT CLICK - This is the critical part
        // We use "force: false" (default) so Playwright will error with details if intercepted.
        console.log('Attempting to click "Bilet Kuyruğu"...');
        try {
            // Looking for the sidebar link
            const ticketQueueLink = page.getByTestId('nav-tickets');
            await ticketQueueLink.click({ timeout: 10000 });
            console.log('✅ Click succeeded! UI is responsive.');
        } catch (e) {
            console.log('❌ CLICK FAILED or INTERCEPTED');
            console.log('--- ERROR DETAILS ---');
            console.error(e.message);

            // Capture a diagnostic screenshot
            await page.screenshot({ path: 'e2e-blocker-diagnostic.png', fullPage: true });

            // Check for visibility of suspected overlays
            const commandMenu = page.locator('[role="combobox"]');
            const isCommandVisible = await commandMenu.isVisible();
            console.log(`Is Command Menu visible? ${isCommandVisible}`);

            const dialogOverlay = page.locator('[data-state="open"]');
            const openOverlaysCount = await dialogOverlay.count();
            console.log(`Currently open overlays/dialogs: ${openOverlaysCount}`);
        }

        // 7. Summary of console errors
        console.log(`\nCaptured ${errors.length} console errors:`);
        errors.forEach((err, i) => console.log(`${i + 1}: ${err}`));

        // We expect at least the login to have worked if we got here
        expect(page.url()).toContain('/dashboard');
    });
});
