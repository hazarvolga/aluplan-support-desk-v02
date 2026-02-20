const API = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000/api/v1';

async function request<T>(path: string, options?: RequestInit): Promise<T> {
    const token = typeof window !== 'undefined' ? localStorage.getItem('access_token') : null;
    const res = await fetch(`${API}${path}`, {
        ...options,
        headers: {
            'Content-Type': 'application/json',
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
            ...options?.headers,
        },
    });
    if (!res.ok) {
        const err = await res.json().catch(() => ({ message: res.statusText }));
        throw new Error(err.message ?? 'API Error');
    }
    return res.json();
}

export const api = {
    auth: {
        login: (email: string, password: string) =>
            request<{ access_token: string; refresh_token: string }>('/auth/login', {
                method: 'POST',
                body: JSON.stringify({ email, password }),
            }),
        me: () => request<{ id: string; fullName: string; email: string; role: string }>('/auth/me'),
    },
    tickets: {
        list: (params?: Record<string, string>) => {
            const q = params ? '?' + new URLSearchParams(params).toString() : '';
            return request<{ data: any[]; total: number }>(`/tickets${q}`);
        },
        get: (id: string) => request<any>(`/tickets/${id}`),
        create: (body: any) => request<any>('/tickets', { method: 'POST', body: JSON.stringify(body) }),
        updateStatus: (id: string, status: string) =>
            request<any>(`/tickets/${id}/status`, { method: 'PATCH', body: JSON.stringify({ status }) }),
        addMessage: (id: string, body: any) =>
            request<any>(`/tickets/${id}/messages`, { method: 'POST', body: JSON.stringify(body) }),
    },
    kb: {
        list: (params?: Record<string, string>) => {
            const q = params ? '?' + new URLSearchParams(params).toString() : '';
            return request<any>(`/knowledge-base/articles${q}`);
        },
        get: (id: string) => request<any>(`/knowledge-base/articles/${id}`),
        create: (body: any) =>
            request<any>('/knowledge-base/articles', { method: 'POST', body: JSON.stringify(body) }),
        submitForReview: (id: string) =>
            request<any>(`/knowledge-base/articles/${id}/submit-for-review`, { method: 'POST' }),
        review: (id: string, approved: boolean) =>
            request<any>(`/knowledge-base/articles/${id}/review`, {
                method: 'POST', body: JSON.stringify({ approved }),
            }),
    },
    ai: {
        query: (userQuery: string) =>
            request<any>('/ai/query', { method: 'POST', body: JSON.stringify({ query: userQuery }) }),
        feedback: (interactionId: string, rating: number, comment?: string) =>
            request<any>(`/ai/interactions/${interactionId}/feedback`, {
                method: 'POST', body: JSON.stringify({ rating, comment }),
            }),
        status: () => request<any>('/ai/status'),
    },
    faq: {
        published: () => request<any[]>('/faq/published'),
        list: (status?: string) =>
            request<any>(`/faq${status ? `?status=${status}` : ''}`),
        approve: (id: string) => request<any>(`/faq/${id}/approve`, { method: 'POST' }),
        dismiss: (id: string) => request<any>(`/faq/${id}/dismiss`, { method: 'POST' }),
        runPipeline: () => request<any>('/faq/pipeline/run', { method: 'POST' }),
    },
    users: {
        list: () => request<any[]>('/users'),
        get: (id: string) => request<any>(`/users/${id}`),
        create: (body: any) => request<any>('/users', { method: 'POST', body: JSON.stringify(body) }),
        update: (id: string, body: any) => request<any>(`/users/${id}`, { method: 'PATCH', body: JSON.stringify(body) }),
        delete: (id: string) => request<any>(`/users/${id}`, { method: 'DELETE' }),
    },
    attachments: {
        upload: (messageId: string, file: File) => {
            const formData = new FormData();
            formData.append('file', file);
            return request(`/attachments/upload/${messageId}`, {
                method: 'POST',
                body: formData,
            });
        },
    },
    customers: {
        list: () => request<any[]>('/customers'),
        get: (id: string) => request<any>(`/customers/${id}`),
    },
    getBaseUrl: () => API,
};
