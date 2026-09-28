import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { server } from '@/test/setup';
import ProductsPage from './page';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1';
const toast = vi.hoisted(() => ({ success: vi.fn(), error: vi.fn() }));

vi.mock('sonner', () => ({ toast }));

describe('ProductsPage', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        vi.stubGlobal('confirm', vi.fn(() => true));
        server.use(
            http.get(`${API_BASE}/products`, () => HttpResponse.json([
                {
                    id: 'product-1',
                    name: 'ALLPLAN',
                    description: 'BIM',
                    categories: [],
                },
            ])),
        );
    });

    it('creates products through the authenticated API client and refreshes the list', async () => {
        let createRequests = 0;
        server.use(
            http.post(`${API_BASE}/products`, async ({ request }) => {
                createRequests += 1;
                expect(request.headers.get('x-requested-with')).toBe('XMLHttpRequest');
                expect(await request.json()).toEqual({ name: 'AX3000', description: 'MEP' });
                return HttpResponse.json({ id: 'product-2', name: 'AX3000', description: 'MEP' }, { status: 201 });
            }),
        );

        render(<ProductsPage />);
        await screen.findByText('ALLPLAN');
        fireEvent.click(screen.getByText('actions.add_product'));
        fireEvent.change(screen.getByPlaceholderText('placeholders.product_name'), { target: { value: 'AX3000' } });
        fireEvent.change(screen.getByPlaceholderText('placeholders.description'), { target: { value: 'MEP' } });
        fireEvent.click(screen.getByText('save'));

        await waitFor(() => expect(createRequests).toBe(1));
        expect(toast.success).toHaveBeenCalledWith('toasts.product_added');
        expect(toast.error).not.toHaveBeenCalled();
    });

    it('does not show a success toast when product creation fails', async () => {
        server.use(
            http.post(`${API_BASE}/products`, () => HttpResponse.json({ message: 'Duplicate product' }, { status: 409 })),
        );

        render(<ProductsPage />);
        await screen.findByText('ALLPLAN');
        fireEvent.click(screen.getByText('actions.add_product'));
        fireEvent.change(screen.getByPlaceholderText('placeholders.product_name'), { target: { value: 'ALLPLAN' } });
        fireEvent.click(screen.getByText('save'));

        await waitFor(() => expect(toast.error).toHaveBeenCalled());
        expect(toast.success).not.toHaveBeenCalled();
    });

    it('creates a category through the authenticated API client', async () => {
        let categoryRequests = 0;
        server.use(
            http.post(`${API_BASE}/products/product-1/categories`, async ({ request }) => {
                categoryRequests += 1;
                expect(request.headers.get('x-requested-with')).toBe('XMLHttpRequest');
                expect(await request.json()).toEqual({ name: 'Lisans', keywords: ['wibu', 'aktivasyon'] });
                return HttpResponse.json({ id: 'category-1', name: 'Lisans' }, { status: 201 });
            }),
        );

        render(<ProductsPage />);
        await screen.findByText('ALLPLAN');
        fireEvent.click(screen.getByText('actions.add_category'));
        fireEvent.change(screen.getByPlaceholderText('placeholders.category_name'), { target: { value: 'Lisans' } });
        fireEvent.change(screen.getByPlaceholderText('placeholders.keywords'), { target: { value: 'wibu, aktivasyon' } });
        fireEvent.click(screen.getByText('save'));

        await waitFor(() => expect(categoryRequests).toBe(1));
        expect(toast.success).toHaveBeenCalledWith('toasts.category_added');
    });

    it('updates a product once through the authenticated API client', async () => {
        let updateRequests = 0;
        server.use(
            http.patch(`${API_BASE}/products/product-1`, async ({ request }) => {
                updateRequests += 1;
                expect(request.headers.get('x-requested-with')).toBe('XMLHttpRequest');
                expect(await request.json()).toEqual({ name: 'ALLPLAN 2027', description: 'BIM Next' });
                return HttpResponse.json({ id: 'product-1', name: 'ALLPLAN 2027', description: 'BIM Next' });
            }),
        );

        render(<ProductsPage />);
        await screen.findByText('ALLPLAN');
        fireEvent.click(screen.getByRole('button', { name: 'actions.edit_product' }));
        fireEvent.change(screen.getByPlaceholderText('placeholders.product_name'), { target: { value: 'ALLPLAN 2027' } });
        fireEvent.change(screen.getByPlaceholderText('placeholders.description'), { target: { value: 'BIM Next' } });
        fireEvent.click(screen.getByText('save'));

        await waitFor(() => expect(updateRequests).toBe(1));
        expect(toast.success).toHaveBeenCalledWith('toasts.product_updated');
    });

    it('archives a product only after confirmation', async () => {
        let archiveRequests = 0;
        server.use(
            http.delete(`${API_BASE}/products/product-1`, ({ request }) => {
                archiveRequests += 1;
                expect(request.headers.get('x-requested-with')).toBe('XMLHttpRequest');
                return HttpResponse.json({ id: 'product-1', isActive: false });
            }),
        );

        render(<ProductsPage />);
        await screen.findByText('ALLPLAN');
        fireEvent.click(screen.getByRole('button', { name: 'actions.archive_product' }));

        await waitFor(() => expect(archiveRequests).toBe(1));
        expect(confirm).toHaveBeenCalledWith('confirms.delete_product');
        expect(toast.success).toHaveBeenCalledWith('toasts.product_deleted');
    });

    it('updates and archives an existing category through the authenticated API client', async () => {
        let updateRequests = 0;
        let archiveRequests = 0;
        server.use(
            http.get(`${API_BASE}/products`, () => HttpResponse.json([
                {
                    id: 'product-1',
                    name: 'ALLPLAN',
                    description: 'BIM',
                    categories: [{ id: 'category-1', name: 'Lisans', keywords: ['wibu'] }],
                },
            ])),
            http.patch(`${API_BASE}/products/categories/category-1`, async ({ request }) => {
                updateRequests += 1;
                expect(request.headers.get('x-requested-with')).toBe('XMLHttpRequest');
                expect(await request.json()).toEqual({ name: 'Aktivasyon', keywords: ['wibu', 'license'] });
                return HttpResponse.json({ id: 'category-1', name: 'Aktivasyon' });
            }),
            http.delete(`${API_BASE}/products/categories/category-1`, () => {
                archiveRequests += 1;
                return HttpResponse.json({ id: 'category-1', isActive: false });
            }),
        );

        render(<ProductsPage />);
        await screen.findByText('Lisans');
        fireEvent.click(screen.getByRole('button', { name: 'actions.edit_category' }));
        fireEvent.change(screen.getByPlaceholderText('placeholders.category_name'), { target: { value: 'Aktivasyon' } });
        fireEvent.change(screen.getByPlaceholderText('placeholders.keywords'), { target: { value: 'wibu, license' } });
        fireEvent.click(screen.getByText('save'));
        await waitFor(() => expect(updateRequests).toBe(1));

        fireEvent.click(screen.getByRole('button', { name: 'actions.archive_category' }));
        await waitFor(() => expect(archiveRequests).toBe(1));
        expect(toast.success).toHaveBeenCalledWith('toasts.category_deleted');
    });
});
