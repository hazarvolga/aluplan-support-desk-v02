const PRODUCTION_LOGIN_LIMIT = 20;
const ISOLATED_TEST_LOGIN_LIMIT = 1000;

/**
 * Keep brute-force protection unchanged outside the isolated test runtime.
 * Browser E2E deliberately reuses three seeded identities across many flows,
 * so its synthetic traffic must not exhaust the production login budget.
 */
export function getLoginThrottleLimit(nodeEnv: string | undefined): number {
    return nodeEnv === 'test' ? ISOLATED_TEST_LOGIN_LIMIT : PRODUCTION_LOGIN_LIMIT;
}
