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
        let errStr = `HTTP ${res.status}: ${res.statusText}`;
        let errBody: any = {};
        try {
            errBody = await res.json();
            // NestJS returns error details in `message` (sometimes an array of strings for validation)
            if (Array.isArray(errBody.message)) {
                errStr = errBody.message.join(', ');
            } else if (errBody.message) {
                errStr = errBody.message;
            } else if (Object.keys(errBody).length > 0) {
                errStr = JSON.stringify(errBody);
            } else {
                errStr = `Error Detail Missing (Status ${res.status})`;
            }
            console.error(`API Error [${res.status}]:`, errBody);
        } catch (e) {
            // response was not JSON, try text
            try {
                const text = await res.clone().text();
                console.error(`API Error [${res.status}] (Non-JSON):`, text);
                errStr = text || errStr;
            } catch (te) {
                console.error(`API Error [${res.status}] (Parse Failed)`);
            }
        }
        throw new Error(errStr);
    }
    const text = await res.text();
    return text ? JSON.parse(text) : {} as T;
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
        forgotPassword: (email: string) =>
            request<{ success: boolean }>('/auth/forgot-password', {
                method: 'POST',
                body: JSON.stringify({ email }),
            }),
        verifyEmail: (token: string) =>
            request<{ success: boolean; message: string }>(`/auth/verify-email?token=${token}`, {
                method: 'GET',
            }),
        me: () => request<{
            id: string;
            fullName: string;
            email: string;
            role: string;
            permissions: string[];
            status?: string;
            agentStatus?: string;
            customerProfile?: {
                id: string;
                hotinfoData?: any;
                hotinfoUpdatedAt?: string;
                [key: string]: any;
            }
        }>('/auth/me'),
        logout: () => request<{ success: boolean }>('/auth/logout', { method: 'POST' }),
        mfa: {
            generate: () => request<{ secret: string; qrCodeDataUrl: string }>('/auth/mfa/generate', { method: 'POST' }),
            setup: (token: string, secret: string) =>
                request<{ success: boolean }>('/auth/mfa/setup', {
                    method: 'POST',
                    body: JSON.stringify({ token, secret }),
                }),
            verify: (userId: string, token: string) =>
                request<{
                    user: any;
                    access_token: string;
                    refresh_token: string;
                }>('/auth/mfa/verify', {
                    method: 'POST',
                    body: JSON.stringify({ userId, token }),
                }),
            disable: () => request<{ success: boolean }>('/auth/mfa/disable', { method: 'POST' }),
        },
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
        syncDataset: () => request<any>('/knowledge-pool/sync-dataset', { method: 'POST' }),
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
        bulkUpdate: (body: { ticketIds: string[]; status?: string; priority?: string; assignedTo?: string }) =>
            request<any>('/tickets/bulk', { method: 'PATCH', body: JSON.stringify(body) }),
    },
    kb: {
        list: (params?: Record<string, string>) => {
            const q = params ? '?' + new URLSearchParams(params).toString() : '';
            return request<any>(`/kb/articles${q}`);
        },
        get: (id: string) => request<any>(`/kb/articles/${id}`),
        create: (body: any) =>
            request<any>('/kb/articles', { method: 'POST', body: JSON.stringify(body) }),
        update: (id: string, body: any) =>
            request<any>(`/kb/articles/${id}`, { method: 'PATCH', body: JSON.stringify(body) }),
        submitForReview: (id: string) =>
            request<any>(`/kb/articles/${id}/submit`, { method: 'POST' }),
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
        listPending: () => request<any>('/kb/articles?status=REVIEW'),
    },
    ai: {
        query: (userQuery: string) =>
            request<any>('/ai/query', { method: 'POST', body: JSON.stringify({ query: userQuery }) }),
        feedback: (interactionId: string, rating: number, comment?: string) =>
            request<any>(`/ai/interactions/${interactionId}/feedback`, {
                method: 'POST', body: JSON.stringify({ rating, comment }),
            }),
        status: () => request<any>('/ai/status'),
        getCopilotDraft: (ticketId: string) => request<{ draft: string; model: string }>(`/ai/copilot/draft/${ticketId}`),
        getHealthMetrics: () => request<{
            totalInteractions: number;
            deflectionRate: number;
            aiAccuracy: number;
            confidenceDistribution: Array<{ band: string; count: number }>;
        }>('/ai/health-metrics'),
        getSourcesStats: () => request<{
            pillars: {
                DOCUMENTS: number;
                ARTICLES: number;
                URLS: number;
                TICKETS: number;
            };
            pendingFaqs: number;
            totalSources: number;
        }>('/ai/sources-stats'),
    },
    faq: {
        published: () => request<any[]>('/faq/published'),
        list: (status?: string) =>
            request<any>(`/faq${status ? `?status=${status}` : ''}`),
        approve: (id: string) => request<any>(`/faq/${id}/approve`, { method: 'POST' }),
        dismiss: (id: string) => request<any>(`/faq/${id}/dismiss`, { method: 'POST' }),
        runPipeline: () => request<any>('/faq/pipeline/run', { method: 'POST' }),
    },
    teams: {
        departments: () => request<any[]>('/teams/departments'),
        getDepartment: (id: string) => request<any>(`/teams/departments/${id}`),
        list: () => request<any[]>('/teams'),
        get: (id: string) => request<any>(`/teams/${id}`),
        create: (body: any) => request<any>('/teams', { method: 'POST', body: JSON.stringify(body) }),
        addMember: (teamId: string, body: any) => request<any>(`/teams/${teamId}/members`, { method: 'POST', body: JSON.stringify(body) }),
        removeMember: (teamId: string, userId: string) => request<any>(`/teams/${teamId}/members/${userId}`, { method: 'DELETE' }),
        getAgentProfile: (id: string) => request<any>(`/teams/agents/${id}`),
        updateMyStatus: (status: string) => request<any>('/teams/agents/me/status', { method: 'PATCH', body: JSON.stringify({ status }) }),
        updateMyProfile: (body: any) => request<any>('/teams/agents/me/profile', { method: 'PATCH', body: JSON.stringify(body) }),
    },
    users: {
        list: (type?: 'agent' | 'customer') => request<any[]>(`/users${type ? `?type=${type}` : ''}`),
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
    products: {
        list: () => request<any[]>('/products'),
    },
    settings: {
        list: (decrypt = false) => request<any[]>(`/settings${decrypt ? '?decrypt=true' : ''}`),
        upsert: (body: any) => request<any>('/settings', { method: 'POST', body: JSON.stringify(body) }),
        delete: (key: string) => request<any>(`/settings/${key}`, { method: 'DELETE' }),
    },
    sla: {
        list: () => request<any[]>('/tickets/sla/policies'),
        create: (body: any) => request<any>('/tickets/sla/policies', { method: 'POST', body: JSON.stringify(body) }),
        update: (id: string, body: any) => request<any>(`/tickets/sla/policies/${id}`, { method: 'PATCH', body: JSON.stringify(body) }),
        delete: (id: string) => request<any>(`/tickets/sla/policies/${id}`, { method: 'DELETE' }),
    },
    macros: {
        list: () => request<any[]>('/macros'),
        create: (body: any) => request<any>('/macros', { method: 'POST', body: JSON.stringify(body) }),
        update: (id: string, body: any) => request<any>(`/macros/${id}`, { method: 'PATCH', body: JSON.stringify(body) }),
        delete: (id: string) => request<any>(`/macros/${id}`, { method: 'DELETE' }),
    },
    email: {
        logs: (page = 1, limit = 50, status?: string) => {
            const q = new URLSearchParams({ page: String(page), limit: String(limit) });
            if (status) q.append('status', status);
            return request<{ data: any[]; total: number; page: number; limit: number }>(`/email/admin/logs?${q}`);
        },
        templates: () => request<{ templates: string[] }>('/email/admin/templates'),
        getTemplateSource: (name: string) => request<{ content: string }>(`/email/admin/templates/${name}/source`),
        saveTemplate: (name: string, content: string) => request<{ success: true }>(`/email/admin/templates/${name}/save`, { method: 'POST', body: JSON.stringify({ content }) }),
        previewTemplate: (name: string, data: any) => request<any>(`/email/admin/templates/${name}/preview`, { method: 'POST', body: JSON.stringify(data) }),
        verifyProvider: () => request<{ provider: string; available: boolean }>('/email/admin/provider/verify', { method: 'POST' }),
        getGmailAuthUrl: () => request<{ url: string }>('/email/gmail/auth-url'),
    },
    announcements: {
        list: () => request<any[]>('/announcements'),
        getFilters: () => request<{ industries: string[], statuses: string[], companies: string[] }>('/announcements/filters'),
        get: (id: string) => request<any>(`/announcements/${id}`),
        create: (body: any) => request<any>('/announcements', { method: 'POST', body: JSON.stringify(body) }),
        update: (id: string, body: any) => request<any>(`/announcements/${id}`, { method: 'PATCH', body: JSON.stringify(body) }),
        delete: (id: string) => request<any>(`/announcements/${id}`, { method: 'DELETE' }),
        getTargetCount: (criteria: any) => request<{ count: number }>('/announcements/target-count', { method: 'POST', body: JSON.stringify(criteria) }),
        broadcast: (id: string) => request<{ success: true; count: number }>(`/announcements/${id}/broadcast`, { method: 'POST' }),
    },
    announcementTemplates: {
        list: () => request<any[]>('/announcement-templates'),
        get: (id: string) => request<any>(`/announcement-templates/${id}`),
        create: (body: any) => request<any>('/announcement-templates', { method: 'POST', body: JSON.stringify(body) }),
        update: (id: string, body: any) => request<any>(`/announcement-templates/${id}`, { method: 'PATCH', body: JSON.stringify(body) }),
        delete: (id: string) => request<any>(`/announcement-templates/${id}`, { method: 'DELETE' }),
    },
    branding: {
        uploadLogo: (file: File) => {
            const formData = new FormData();
            formData.append('file', file);
            return request<{ url: string; filename: string }>('/branding/upload-logo', {
                method: 'POST',
                body: formData,
            });
        },
    },
    crm: {
        getConnections: () => request<any[]>('/crm/connections'),
        upsertConnection: (data: any) => request<any>('/crm/connections', {
            method: 'POST',
            body: JSON.stringify(data)
        }),
        triggerSync: (id: string) => request<any>(`/crm/sync/${id}`, { method: 'POST' }),
        getLogs: (connectionId: string) => request<any[]>(`/crm/logs/${connectionId}`),
        getAccounts: () => request<any[]>('/crm/accounts'),
        getAccount: (id: string) => request<any>(`/crm/accounts/${id}`),
        bulkDeleteAccounts: (ids: string[]) => request<any>('/crm/accounts/bulk-delete', { method: 'POST', body: JSON.stringify({ ids }) }),
    },
    get: (url: string) => request<any>(url),
    post: (url: string, body: any) =>
        request<any>(url, {
            method: 'POST',
            body: body instanceof FormData ? body : JSON.stringify(body)
        }),
    getBaseUrl: () => API,
};
