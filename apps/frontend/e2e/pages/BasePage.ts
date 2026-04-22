import { Page, Locator } from '@playwright/test';

export class BasePage {
    constructor(protected readonly page: Page) { }

    async navigateTo(path: string) {
        await this.page.goto(path);
    }

    async waitForLoadingFinished() {
        // Wait for skeleton or global spinner to disappear if needed
        await this.page.waitForLoadState('networkidle');
    }

    getErrorMessage(): Locator {
        return this.page.getByTestId('error-message');
    }
}
