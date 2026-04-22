import { test, expect } from '@playwright/test';
import { LoginPage } from './pages/LoginPage';
import { DashboardPage } from './pages/DashboardPage';

test.describe('Authentication Flow', () => {

    test('should load login page with correct elements', async ({ page }) => {
        const loginPage = new LoginPage(page);
        await loginPage.navigateTo('/tr/login');

        await expect(loginPage.emailInput).toBeVisible();
        await expect(loginPage.passwordInput).toBeVisible();
        await expect(loginPage.submitButton).toBeVisible();
    });

    test('should show error message on invalid credentials', async ({ page }) => {
        const loginPage = new LoginPage(page);
        await loginPage.navigateTo('/tr/login');

        await loginPage.login('invalid@example.com', 'wrongpassword123');

        await expect(loginPage.getErrorMessage()).toBeVisible({ timeout: 10000 });
    });

    test('should redirect to dashboard on valid credentials', async ({ page }) => {
        const loginPage = new LoginPage(page);
        const dashboardPage = new DashboardPage(page);

        await loginPage.navigateTo('/tr/login');
        // Note: Real login would require seeded data, we use the logic flow here
        // as configured in the project's existing tests.
        const email = 'e2e-test@aluplan.com';
        const password = 'pass123';

        await loginPage.loginWithRetry(email, password);
        expect(await dashboardPage.isAtDashboard()).toBe(true);
    });

    test('should display system requirements accordion', async ({ page }) => {
        const loginPage = new LoginPage(page);
        await loginPage.navigateTo('/tr/login');

        await expect(loginPage.requirementAccordion).toBeVisible({ timeout: 120000 });
        await expect(page.getByText(/ALLPLAN 2026/i)).toBeVisible();
    });
});
