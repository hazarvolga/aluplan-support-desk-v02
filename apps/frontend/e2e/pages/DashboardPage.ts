import { Page, Locator } from '@playwright/test';
import { BasePage } from './BasePage';

export class DashboardPage extends BasePage {
    readonly welcomeMessage: Locator;

    constructor(page: Page) {
        super(page);
        this.welcomeMessage = page.getByRole('heading', { level: 1 });
    }

    async isAtDashboard(): Promise<boolean> {
        return this.page.url().includes('/dashboard');
    }
}
