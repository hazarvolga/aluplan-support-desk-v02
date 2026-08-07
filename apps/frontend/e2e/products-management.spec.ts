import { expect, test } from '@playwright/test';

test('admin can create, edit, categorize, and archive a product', async ({ page }) => {
    const suffix = Date.now().toString(36);
    const productName = `E2E Taxonomy ${suffix}`;
    const updatedName = `${productName} Updated`;
    const categoryName = `Licensing ${suffix}`;

    await page.goto('/tr/products');
    await expect(page.getByRole('heading', { name: 'Ürünler ve Modüller' })).toBeVisible();

    await page.getByRole('button', { name: 'Yeni Ürün Ekle' }).click();
    await page.getByPlaceholder('Örn: Aluplan Pro').fill(productName);
    await page.getByPlaceholder('Ürünle ilgili kısa bir açıklama...').fill('Disposable Playwright taxonomy');
    await page.getByRole('button', { name: 'Kaydet' }).click();
    await expect(page.getByText(productName, { exact: true })).toBeVisible();

    await page.getByRole('button', { name: 'Ürünü düzenle' }).last().click();
    await page.getByPlaceholder('Örn: Aluplan Pro').fill(updatedName);
    await page.getByRole('button', { name: 'Kaydet' }).click();
    await expect(page.getByText(updatedName, { exact: true })).toBeVisible();

    await page.getByRole('button', { name: 'Kategori Ekle' }).last().click();
    await page.getByPlaceholder('Örn: Fatura Modülü').fill(categoryName);
    await page.getByPlaceholder('Örn: fatura oluşturma, iptal, kdv, e-fatura').fill('license, wibu, LICENSE');
    await page.getByRole('button', { name: 'Kaydet' }).click();
    await expect(page.getByText(categoryName, { exact: true })).toBeVisible();

    page.once('dialog', (dialog) => dialog.accept());
    await page.getByRole('button', { name: 'Kategoriyi arşivle' }).last().click();
    await expect(page.getByText(categoryName, { exact: true })).toHaveCount(0);

    page.once('dialog', (dialog) => dialog.accept());
    await page.getByRole('button', { name: 'Ürünü arşivle' }).last().click();
    await expect(page.getByText(updatedName, { exact: true })).toHaveCount(0);
});
