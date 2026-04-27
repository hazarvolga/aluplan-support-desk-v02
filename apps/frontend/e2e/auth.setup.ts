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

setup('authenticate all roles', async ({ browser }) => {
    for (const [role, creds, state] of [
        ['admin', TEST_USERS.admin, ADMIN_STATE] as const,
        ['agent', TEST_USERS.agent, AGENT_STATE] as const,
        ['customer', TEST_USERS.customer, CUSTOMER_STATE] as const,
    ]) {
        const context = await browser.newContext();
        const page = await context.newPage();
        try {
            await login(page, creds.email, creds.password);
            await context.storageState({ path: state });
            console.log(`[auth.setup] ${role} state persisted`);
        } finally {
            await page.close();
            await context.close();
        }
    }
});
