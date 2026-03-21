import { defineConfig, devices } from '@playwright/test';
import path from 'path';

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
        {
            name: 'chromium',
            use: { ...devices['Desktop Chrome'] },
        }
    ],

    webServer: [
        {
            command: 'pnpm --filter @aluplan/backend dev',
            url: 'http://localhost:4000/api/v1/health',
            reuseExistingServer: false,
            timeout: 300 * 1000,
        },
        {
            command: 'pnpm dev',
            url: 'http://localhost:3000',
            reuseExistingServer: false,
            timeout: 300 * 1000,
        }
    ],
});
