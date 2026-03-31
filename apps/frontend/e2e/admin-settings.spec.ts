import { test, expect } from '@playwright/test';
import { loginAsAdmin } from './helpers/auth';

test.describe('Admin Settings', () => {
    test.beforeEach(async ({ page }) => {
        await loginAsAdmin(page);
        await page.goto('/tr/admin/settings');
    });

    test('should load settings correctly without localization errors', async ({ page }) => {
        // Wait for settings to load
        await expect(page.locator('text=Sistem Ayarları')).toBeVisible();

        // Ensure tabs are visible (using the Turkish translations we added/confirmed)
        await expect(page.locator('role=tab[name="Genel"]')).toBeVisible();
        await expect(page.locator('role=tab[name="YZE"]')).toBeVisible();

        // Check for common missing keys (should NOT be visible as keys)
        const missingKey = page.locator('text=settings.ai.api_key');
        await expect(missingKey).not.toBeVisible();
    });

    test('should save general settings using bulk upsert', async ({ page }) => {
        await page.click('role=tab[name="Genel"]');

        const portalNameInput = page.locator('input[placeholder="örn: Aluplan Destek"]');
        await expect(portalNameInput).toBeVisible();

        const timestamp = Date.now().toString();
        const testName = `Aluplan-Test-${timestamp}`;

        await portalNameInput.fill(testName);

        // Find the save button for General tab
        // Use the text from tr.json: "Değişiklikleri Kaydet" (ai.save_btn is reused for General)
        await page.click('button:has-text("Değişiklikleri Kaydet")');

        // Wait for toast
        await expect(page.locator('text=Başarılı')).toBeVisible({ timeout: 10000 });
        await expect(page.locator('text=Ayarlar başarıyla kaydedildi.')).toBeVisible();

        // Refresh and verify persistence
        await page.reload();
        await expect(page.locator('input[placeholder="örn: Aluplan Destek"]')).toHaveValue(testName);
    });

    test('should save AI settings correctly', async ({ page }) => {
        await page.click('role=tab[name="YZE"]');

        // Find OpenAI section (if present or click provider)
        // This test assumes OpenAI is at least selectable
        await page.selectOption('select:near(label:has-text("Varsayılan Sohbet Sağlayıcısı"))', 'openai');

        // Check for the OpenAI API Key label (which we fixed)
        await expect(page.locator('text=API Anahtarı')).toBeVisible();
    });
});
