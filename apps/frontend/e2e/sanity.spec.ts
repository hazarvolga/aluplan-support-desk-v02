import { test, expect } from '@playwright/test';

test.describe('Sanity Check', () => {
    test('homepage basic load', async ({ page }) => {
        await page.goto('/');

        // Uygulama ayaga kalkiyor mu ve head tag'inde title var mi?
        // Title 'Aluplan' kelimesini icerebilir veya icermeyebilir, temel HTML kontrolu
        const html = await page.locator('html');
        await expect(html).toBeVisible();
    });
});
