import { test, expect } from '@playwright/test';
import { loginAsAdmin } from './helpers/auth';

test.describe('WhatsApp Configuration UI', () => {

    test('should allow admin to access WhatsApp settings', async ({ page }) => {
        // 1. Navigation and Login
        await loginAsAdmin(page);

        // 2. Goto Settings
        await page.goto('/tr/admin/settings');

        // Wait for settings page logic to settle
        await page.waitForLoadState('networkidle');

        // 3. Open the current WhatsApp settings tab. Role and exact labels keep
        // the assertions deterministic when helper text repeats the same words.
        const whatsappTab = page.getByRole('tab', { name: 'WhatsApp', exact: true });
        await expect(whatsappTab).toBeVisible();
        await whatsappTab.click();

        // 4. Verify the three security-sensitive integration fields.
        await expect(page.getByText('Webhook URL', { exact: true })).toBeVisible();
        await expect(page.getByText('Doğrulama Anahtarı (Verify Token)', { exact: true })).toBeVisible();
        await expect(page.getByText('Erişim Anahtarı (Access Token)', { exact: true })).toBeVisible();
    });

});
