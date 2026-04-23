'use server';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

const API_URL = process.env.NEXT_INTERNAL_API_URL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

async function getAuthHeaders() {
    const cookieStore = await cookies();
    const accessToken = cookieStore.get('access_token')?.value;
    const refreshToken = cookieStore.get('refresh_token')?.value;
    const headers: Record<string, string> = {
        'Content-Type': 'application/json',
    };
    if (accessToken) {
        headers['Authorization'] = `Bearer ${accessToken}`;
    }
    return { headers, refreshToken };
}

async function apiFetch<T>(path: string, options: RequestInit = {}): Promise<T> {
    const { headers } = await getAuthHeaders();
    const res = await fetch(`${API_URL}${path}`, {
        ...options,
        headers: { ...headers, ...(options.headers || {}) },
        credentials: 'include',
    });

    if (!res.ok) {
        const err = await res.text();
        throw new Error(err || `HTTP ${res.status}`);
    }

    const text = await res.text();
    return text ? JSON.parse(text) : ({} as T);
}

// ─── TICKET ACTIONS ──────────────────────────────────────────

export async function createTicket(formData: FormData) {
    const subject = formData.get('subject') as string;
    const description = formData.get('description') as string;
    const priority = formData.get('priority') as string;
    const productId = formData.get('productId') as string | null;

    const ticket = await apiFetch<any>('/tickets', {
        method: 'POST',
        body: JSON.stringify({ subject, description, priority, productId }),
    });

    // Add initial message
    await apiFetch(`/tickets/${ticket.id}/messages`, {
        method: 'POST',
        body: JSON.stringify({ message: description, isInternal: false }),
    });

    redirect(`/tickets/${ticket.id}`);
}

export async function updateTicketStatus(id: string, status: string) {
    return apiFetch(`/tickets/${id}/status/${status}`, { method: 'PATCH' });
}

export async function deleteTicket(id: string) {
    return apiFetch(`/tickets/${id}`, { method: 'DELETE' });
}

export async function bulkUpdateTickets(ticketIds: string[], status: string) {
    return apiFetch('/tickets/bulk', {
        method: 'PATCH',
        body: JSON.stringify({ ticketIds, status }),
    });
}

export async function bulkDeleteTickets(ticketIds: string[]) {
    return apiFetch('/tickets/bulk', {
        method: 'DELETE',
        body: JSON.stringify({ ticketIds }),
    });
}

// ─── KNOWLEDGE BASE ACTIONS ──────────────────────────────────

export async function createArticle(formData: FormData) {
    const title = formData.get('title') as string;
    const content = formData.get('content') as string;
    const categoryId = formData.get('categoryId') as string;

    return apiFetch('/kb/articles', {
        method: 'POST',
        body: JSON.stringify({ title, content, categoryId }),
    });
}

export async function updateArticle(id: string, formData: FormData) {
    const title = formData.get('title') as string;
    const content = formData.get('content') as string;

    return apiFetch(`/kb/articles/${id}`, {
        method: 'PATCH',
        body: JSON.stringify({ title, content }),
    });
}

export async function deleteArticle(id: string) {
    return apiFetch(`/kb/articles/${id}`, { method: 'DELETE' });
}

// ─── USER ACTIONS ────────────────────────────────────────────

export async function updateProfile(formData: FormData) {
    const fullName = formData.get('fullName') as string;
    const bio = formData.get('bio') as string;

    return apiFetch('/users/profile', {
        method: 'PATCH',
        body: JSON.stringify({ fullName, bio }),
    });
}

// ─── SETTINGS ACTIONS ────────────────────────────────────────

export async function updateSetting(key: string, value: string) {
    return apiFetch('/settings', {
        method: 'POST',
        body: JSON.stringify({ key, value }),
    });
}
