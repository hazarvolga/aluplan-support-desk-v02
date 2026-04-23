export const dynamic = 'force-dynamic';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import TicketsClient from './TicketsClient';

const API_URL = process.env.NEXT_INTERNAL_API_URL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

async function fetchTickets(token?: string) {
    const headers: Record<string, string> = {};
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const res = await fetch(`${API_URL}/tickets`, {
        headers,
        credentials: 'include',
        cache: 'no-store',
    });

    if (res.status === 401) {
        redirect('/login');
    }

    if (!res.ok) {
        return { data: [], total: 0 };
    }

    return res.json();
}

export default async function TicketsPage() {
    const cookieStore = await cookies();
    const token = cookieStore.get('access_token')?.value;
    const result = await fetchTickets(token);

    return (
        <TicketsClient
            initialTickets={result.data ?? []}
            initialTotal={result.total ?? 0}
        />
    );
}
