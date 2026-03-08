import '@testing-library/jest-dom/vitest';
import { setupServer } from 'msw/node';
import { handlers } from './handlers';
import { afterAll, afterEach, beforeAll } from 'vitest';

// ── MSW Server Setup ──────────────────────────────────────────────────
// Intercepts all API calls during tests using mock handlers.
// No real backend needed for Vitest unit tests.
const server = setupServer(...handlers);

beforeAll(() => {
    server.listen({ onUnhandledRequest: 'warn' });
});

afterEach(() => {
    // Reset handlers after each test to avoid state leakage
    server.resetHandlers();
});

afterAll(() => {
    server.close();
});

export { server };
