import { Page, Locator, expect } from '@playwright/test';
import { BasePage } from './BasePage';

export class LoginPage extends BasePage {
    readonly emailInput: Locator;
    readonly passwordInput: Locator;
    readonly submitButton: Locator;
    readonly requirementAccordion: Locator;

    constructor(page: Page) {
        super(page);
        this.emailInput = page.getByTestId('login-email');
        this.passwordInput = page.getByTestId('login-password');
        this.submitButton = page.getByTestId('login-submit');
        this.requirementAccordion = page.getByTestId('requirement-accordion');
    }

    async login(email: string, pass: string) {
        await this.emailInput.fill(email);
        await this.passwordInput.fill(pass);
        await this.submitButton.click();
    }

    async loginWithRetry(email: string, pass: string, maxAttempts = 3) {
        for (let attempt = 1; attempt <= maxAttempts; attempt++) {
            try {
                await this.login(email, pass);
                await this.page.waitForURL(/.*\/dashboard/, { timeout: 10000 });
                return;
            } catch (e) {
                if (attempt === maxAttempts) throw e;
                await this.page.context().clearCookies();
                await this.navigateTo('/tr/login');
            }
        }
    }
}
