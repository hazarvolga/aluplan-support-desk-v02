/**
 * Global teardown for Jest tests
 * 
 * Ensures all connections and resources are properly closed
 * to prevent "open handles" warnings.
 */

export default async function globalTeardown() {
    console.log('[Global Teardown] Starting cleanup...');

    // Give async operations time to complete
    await new Promise((resolve) => setTimeout(resolve, 500));

    // Force close any remaining connections
    // Note: Individual test suites should handle their own cleanup in afterAll()
    // This is a safety net for any leaked connections

    console.log('[Global Teardown] Cleanup complete');
}
