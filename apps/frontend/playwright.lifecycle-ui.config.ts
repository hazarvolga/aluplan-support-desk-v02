import { defineConfig, devices } from '@playwright/test';

// Frontend-only synthetic contract smoke: no backend process, database or seeded users.
export default defineConfig({
    testDir: './e2e',
    testMatch: 'lifecycle-ui.spec.ts',
    outputDir: './test-results/lifecycle-ui',
    timeout: 120_000,
    expect: { timeout: 30_000 },
    workers: 1,
    retries: 0,
    reporter: 'list',
    use: {
        ...devices['Desktop Chrome'],
        baseURL: 'http://127.0.0.1:3105',
        viewport: { width: 1440, height: 1000 },
        actionTimeout: 15_000,
        storageState: { cookies: [], origins: [] },
        trace: 'retain-on-failure',
    },
});
