import { test as setup } from '@playwright/test';
import * as path from 'path';
import { TEST_USERS, login } from './helpers/auth';

/**
 * Playwright auth setup — runs once before the test suite and persists
 * each role's authenticated browser state to disk so individual tests
 * skip the login dance. Eliminates the hydration race that turned
 * single-test login retries into a 6-attempt cascade.
 *
 * The three role setups run in a single `setup()` block sequentially
 * (rather than three parallel `setup()` calls) because Playwright would
 * otherwise spin up two of them concurrently with `workers: 2`, and the
 * second navigation would abort the first with ERR_ABORTED.
 */

export const STATE_DIR = path.join(__dirname, '..', 'playwright', '.auth');
export const ADMIN_STATE = path.join(STATE_DIR, 'admin.json');
export const AGENT_STATE = path.join(STATE_DIR, 'agent.json');
export const CUSTOMER_STATE = path.join(STATE_DIR, 'customer.json');

setup('authenticate admin (required)', async ({ browser }) => {
    const context = await browser.newContext();
    const page = await context.newPage();
    try {
        await login(page, TEST_USERS.admin.email, TEST_USERS.admin.password);
        await context.storageState({ path: ADMIN_STATE });
        console.log('[auth.setup] admin state persisted');
    } finally {
        await page.close();
        await context.close();
    }
});

// Agent/customer setups are best-effort — failures are logged but don't
// block the suite. Tests that require these roles should fail individually
// with a clear error, not poison the entire run.
for (const [role, creds, state] of [
    ['agent', TEST_USERS.agent, AGENT_STATE] as const,
    ['customer', TEST_USERS.customer, CUSTOMER_STATE] as const,
]) {
    setup(`authenticate ${role} (best-effort)`, async ({ browser }) => {
        const context = await browser.newContext();
        const page = await context.newPage();
        try {
            await login(page, creds.email, creds.password, { maxRetries: 1 });
            await context.storageState({ path: state });
            console.log(`[auth.setup] ${role} state persisted`);
        } catch (err: any) {
            console.warn(`[auth.setup] ${role} setup failed (will skip ${role}-dependent tests): ${err.message}`);
        } finally {
            await page.close();
            await context.close();
        }
    });
}
