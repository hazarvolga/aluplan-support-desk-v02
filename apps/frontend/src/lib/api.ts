const API = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000/api/v1';

async function request<T>(path: string, options?: RequestInit): Promise<T> {
    const token = typeof window !== 'undefined' ? localStorage.getItem('access_token') : null;
    const headers: any = {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...options?.headers,
    };

    if (!(options?.body instanceof FormData)) {
        headers['Content-Type'] = 'application/json';
    }

    const res = await fetch(`${API}${path}`, {
        ...options,
        headers,
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
        lookup: (email: string) =>
            request<{ action: 'CLAIM' | 'NEW' | 'NEW_MATCHED_COMPANY'; companyName: string | null }>('/auth/lookup', {
                method: 'POST',
                body: JSON.stringify({ email }),
            }),
        me: () => request<{ id: string; fullName: string; email: string; roles: string[] }>('/auth/me'),
    },
    pool: {
        list: () => request<any[]>('/knowledge-pool/sources'),
        addUrl: (name: string, url: string) =>
            request<any>('/knowledge-pool/sources', {
                method: 'POST',
                body: JSON.stringify({ name, url, type: 'URL' }),
            }),
        upload: (name: string, file: File) => {
            const formData = new FormData();
            formData.append('file', file);
            formData.append('name', name);
            return request('/knowledge-pool/sources/upload', {
                method: 'POST',
                body: formData,
            });
        },
        sync: (id: string) => request<any>(`/knowledge-pool/sources/${id}/sync`, { method: 'POST' }),
        logs: (id: string) => request<any[]>(`/knowledge-pool/sources/${id}/logs`),
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
        getSlaStats: () => request<any>('/tickets/sla/stats'),
    },
    kb: {
        list: (params?: Record<string, string>) => {
            const q = params ? '?' + new URLSearchParams(params).toString() : '';
            return request<any>(`/kb/articles${q}`);
        },
        get: (id: string) => request<any>(`/kb/articles/${id}`),
        create: (body: any) =>
            request<any>('/kb/articles', { method: 'POST', body: JSON.stringify(body) }),
        submitForReview: (id: string) =>
            request<any>(`/kb/articles/${id}/submit-for-review`, { method: 'POST' }),
        review: (id: string, approved: boolean) =>
            request<any>(`/kb/articles/${id}/review`, {
                method: 'POST', body: JSON.stringify({ approved }),
            }),
        submitFeedback: (id: string, isHelpful: boolean, comment?: string) =>
            request<any>(`/kb/articles/${id}/feedback`, {
                method: 'POST', body: JSON.stringify({ isHelpful, comment }),
            }),
        incrementView: (id: string) =>
            request<any>(`/kb/articles/${id}/view`, { method: 'POST' }),
        getAnalytics: (id: string) => request<any>(`/kb/articles/${id}/analytics`),
        compare: (id: string, v1: number, v2: number) =>
            request<any>(`/kb/articles/${id}/compare?v1=${v1}&v2=${v2}`),
        suggestCategory: (title: string, content: string) =>
            request<any>('/kb/articles/suggest-category', {
                method: 'POST', body: JSON.stringify({ title, content }),
            }),
        getGlobalAnalytics: () => request<any>('/kb/analytics'),
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
        updateProfile: (body: any) => request<any>('/users/profile', { method: 'PATCH', body: JSON.stringify(body) }),
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
        getById: (id: string) => request<any>(`/customers/${id}`),
        update: (id: string, body: any) => request<any>(`/customers/${id}`, { method: 'PATCH', body: JSON.stringify(body) }),
        bulkDelete: (ids: string[]) => request<any>('/customers/bulk-delete', { method: 'POST', body: JSON.stringify({ ids }) }),
        resetPassword: (id: string) => request<any>(`/customers/${id}/reset-password`, { method: 'POST' }),
        import: (data: any[]) => request<any>('/customers/import', { method: 'POST', body: JSON.stringify(data) }),
    },
    settings: {
        list: (decrypt = false) => request<any[]>(`/settings${decrypt ? '?decrypt=true' : ''}`),
        upsert: (body: any) => request<any>('/settings', { method: 'POST', body: JSON.stringify(body) }),
        delete: (key: string) => request<any>(`/settings/${key}`, { method: 'DELETE' }),
    },
    macros: {
        list: () => request<any[]>('/macros'),
        create: (body: any) => request<any>('/macros', { method: 'POST', body: JSON.stringify(body) }),
        update: (id: string, body: any) => request<any>(`/macros/${id}`, { method: 'PATCH', body: JSON.stringify(body) }),
        delete: (id: string) => request<any>(`/macros/${id}`, { method: 'DELETE' }),
    },
    get: (url: string) => request<any>(url),
    post: (url: string, body: any) => request<any>(url, { method: 'POST', body: JSON.stringify(body) }),
    getBaseUrl: () => API,
};
