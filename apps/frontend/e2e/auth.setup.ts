import { test as setup } from '@playwright/test';
import * as path from 'path';
import { TEST_USERS, login } from './helpers/auth';

/**
 * Playwright auth setup — runs once before the test suite and persists
 * each role's authenticated browser state to disk so individual tests
 * skip the login dance. Eliminates the hydration race that turned
 * single-test login retries into a 6-attempt cascade.
 *
 * Usage in playwright.config.ts:
 *   projects: [
 *     { name: 'setup', testMatch: /auth\.setup\.ts/ },
 *     { name: 'chromium', use: { storageState: 'playwright/.auth/admin.json' }, dependencies: ['setup'] },
 *   ]
 */

export const STATE_DIR = path.join(__dirname, '..', 'playwright', '.auth');
export const ADMIN_STATE = path.join(STATE_DIR, 'admin.json');
export const AGENT_STATE = path.join(STATE_DIR, 'agent.json');
export const CUSTOMER_STATE = path.join(STATE_DIR, 'customer.json');

setup('authenticate as admin', async ({ page }) => {
    await login(page, TEST_USERS.admin.email, TEST_USERS.admin.password);
    await page.context().storageState({ path: ADMIN_STATE });
});

setup('authenticate as agent', async ({ page }) => {
    await login(page, TEST_USERS.agent.email, TEST_USERS.agent.password);
    await page.context().storageState({ path: AGENT_STATE });
});

setup('authenticate as customer', async ({ page }) => {
    await login(page, TEST_USERS.customer.email, TEST_USERS.customer.password);
    await page.context().storageState({ path: CUSTOMER_STATE });
});
