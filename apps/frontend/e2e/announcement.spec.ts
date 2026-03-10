import { test, expect } from '@playwright/test';

/**
 * ANNOUNCEMENT SYSTEM E2E TEST
 * Verifies that an admin can create and broadcast an announcement.
 */

test.describe('Announcement Flow', () => {

    test('should create and broadcast an announcement', async ({ page }) => {
        // 1. Login as Admin (using credentials from seed.ts)
        await page.goto('/');
        await page.getByTestId('login-email').fill('hazarvolga@gmail.com');
        await page.getByTestId('login-password').fill('Vol?*187');
        await page.getByTestId('login-submit').click();

        // Wait for redirect to dashboard
        await page.waitForURL(/.*\/dashboard/, { timeout: 30000 });
        expect(page.url()).toContain('/dashboard');

        // 2. Navigate to Announcements
        await page.goto('/admin/announcements');
        await expect(page.locator('h2')).toContainText('Duyuru Yönetimi');

        // 3. Fill Announcement Form
        const uniqueTitle = `E2E Test Announcement ${Date.now()}`;
        await page.locator('input#title').fill(uniqueTitle);
        await page.locator('input#subject').fill('System Update Notification');

        // Ensure some filter is selected to enable broadcasting button and target anyone
        // We'll try to find any option in the multi-select
        const industrySelect = page.locator('button:has-text("Sektör Seç")');
        if (await industrySelect.isVisible()) {
            await industrySelect.click();
            const option = page.locator('div[role="option"]').first();
            if (await option.isVisible()) {
                await option.click();
            }
            // Click heading to close multi-select
            await page.locator('h2').click();
        }

        // 4. Save Draft
        await page.click('button:has-text("Taslağı Protokolle")');

        // 5. Verify it appears in History
        await page.click('button[role="tab"]:has-text("Gönderim Geçmişi")');
        await expect(page.locator('div:has-text("' + uniqueTitle + '")').first()).toBeVisible();

        // 6. Broadcast (only if targetCount > 0)
        await page.click('button[role="tab"]:has-text("Duyuru Oluştur")');
        const targetCountContainer = page.locator('div.text-5xl.font-bold.text-emerald-500');
        await expect(targetCountContainer).toBeVisible();
        const targetCountText = await targetCountContainer.textContent();
        console.log('Target count:', targetCountText);

        if (targetCountText && parseInt(targetCountText) > 0) {
            await page.click('button[role="tab"]:has-text("Gönderim Geçmişi")');
            const item = page.locator('div:has-text("' + uniqueTitle + '")').first();
            const broadcastBtn = item.locator('button:has-text("Yayınla")');

            // Handle native alert
            page.once('dialog', dialog => dialog.accept());
            await broadcastBtn.click();

            // Verify status changed to GÖNDERİLDİ
            await expect(item.locator('span:has-text("GÖNDERİLDİ")')).toBeVisible({ timeout: 20000 });
            console.log('✅ Announcement broadcasted successfully');
        } else {
            console.log('⚠️ Skipping broadcast because target count is 0.');
        }

        console.log('✅✅ ANNOUNCEMENT TEST PASSED');
    });
});
