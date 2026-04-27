import { defineConfig, devices } from '@playwright/test';
import path from 'path';

const ADMIN_STATE = path.join(__dirname, 'playwright', '.auth', 'admin.json');

export default defineConfig({
    testDir: './e2e',
    timeout: 300 * 1000,
    expect: {
        timeout: 30000
    },
    forbidOnly: !!process.env.CI,
    retries: 2,
    workers: 2, // Reduce concurrency to prevent compilation thrashing
    reporter: 'html',
    use: {
        actionTimeout: 120000,
        navigationTimeout: 120000,
        trace: 'on-first-retry',
        baseURL: 'http://localhost:3000',
        ignoreHTTPSErrors: true,
    },

    projects: [
        // 1) Authenticate once and persist storage state per role
        {
            name: 'setup',
            testMatch: /auth\.setup\.ts/,
        },
        // 2) Tests that need an authenticated admin session reuse the saved state.
        //    Tests that need to test login itself or run as anonymous should
        //    explicitly set `test.use({ storageState: { cookies: [], origins: [] } })`.
        {
            name: 'chromium',
            use: {
                ...devices['Desktop Chrome'],
                storageState: ADMIN_STATE,
            },
            dependencies: ['setup'],
        }
    ],

    webServer: [
        {
            command: 'pnpm --filter @aluplan/backend dev',
            url: 'http://localhost:4000/api/v1/health',
            reuseExistingServer: true,
            timeout: 300 * 1000,
        },
        {
            command: 'pnpm dev',
            url: 'http://localhost:3000',
            reuseExistingServer: true,
            timeout: 300 * 1000,
        }
    ],
});
