import { env } from './env';

const CLIENT_API = env.apiUrl;
const SERVER_API = (typeof process !== 'undefined' && process.env ? process.env.NEXT_INTERNAL_API_URL : undefined) ?? CLIENT_API;

const getApiUrl = () => {
    return typeof window === 'undefined' ? SERVER_API : CLIENT_API;
};

let isRefreshing = false;
let failedQueue: Array<{ resolve: (value?: any) => void; reject: (reason?: any) => void }> = [];

const processQueue = (error: Error | null, token: string | null = null) => {
    failedQueue.forEach(prom => {
        if (error) {
            prom.reject(error);
        } else {
            prom.resolve(token);
        }
    });
    failedQueue = [];
};

async function request<T>(path: string, options?: RequestInit): Promise<T> {
    const csrfToken = typeof window !== 'undefined'
        ? document.cookie.split('; ').find(row => row.trim().startsWith('XSRF-TOKEN='))?.split('=')[1]
        : null;

    const headers: any = {
        'X-Requested-With': 'XMLHttpRequest',
        'X-Request-Id': (typeof crypto !== 'undefined' && crypto.randomUUID) ? crypto.randomUUID() : Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15),
        ...options?.headers,
    };

    if (csrfToken) {
        headers['X-XSRF-TOKEN'] = csrfToken;
    }

    if (!(options?.body instanceof FormData)) {
        headers['Content-Type'] = 'application/json';
    }

    const fetchOptions: RequestInit = {
        ...options,
        headers,
        credentials: 'include',
    };

    let res = await fetch(`${getApiUrl()}${path}`, fetchOptions);

    if (res.status === 401 && !path.includes('/auth/login') && !path.includes('/auth/refresh')) {
        if (isRefreshing) {
            try {
                await new Promise<void>((resolve, reject) => {
                    failedQueue.push({ resolve, reject });
                });

                res = await fetch(`${getApiUrl()}${path}`, fetchOptions);
                if (res.ok) {
                    const text = await res.text();
                    return text ? JSON.parse(text) : {} as T;
                }
            } catch (e) {
                throw new Error('common.session_expired');
            }
        } else {
            isRefreshing = true;
            try {
                const refreshRes = await fetch(`${getApiUrl()}/auth/refresh`, {
                    method: 'POST',
                    credentials: 'include',
                    headers: { 'Content-Type': 'application/json' }
                });

                if (refreshRes.ok) {
                    processQueue(null);
                    res = await fetch(`${getApiUrl()}${path}`, fetchOptions);
                    if (res.ok) {
                        const text = await res.text();
                        return text ? JSON.parse(text) : {} as T;
                    }
                } else {
                    processQueue(new Error('Session expired'));
                    throw new Error('common.session_expired');
                }
            } catch (err) {
                processQueue(err as Error);
                throw new Error('common.session_expired');
            } finally {
                isRefreshing = false;
            }
        }
    }

    if (!res.ok) {
        let errStr = `HTTP ${res.status}: ${res.statusText}`;
        let errBody: any = {};
        try {
            errBody = await res.json();
            if (Array.isArray(errBody.message)) {
                errStr = errBody.message.join(', ');
            } else if (errBody.message) {
                errStr = errBody.message;
            } else if (Object.keys(errBody).length > 0) {
                errStr = JSON.stringify(errBody);
            } else {
                errStr = `Error Detail Missing (Status ${res.status})`;
            }
            // Suppress noisy 401 logs for auth-check endpoints (handled gracefully by AuthProvider)
            if (!(res.status === 401 && path.includes('/auth/me'))) {
                console.error(`API Error [${res.status}]:`, errBody);
            }
        } catch (e) {
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
            request<{ action: 'CLAIM' | 'NEW' | 'NEW_MATCHED_COMPANY' | 'CRM_REJECTED' | 'DELETED' | 'INACTIVE'; companyName: string | null; errorMessage?: string; status?: string }>('/auth/lookup', {
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
        resetPassword: (token: string, newPassword: string) =>
            request<{ success: boolean; message?: string }>('/auth/reset-password', {
                method: 'POST',
                body: JSON.stringify({ token, newPassword }),
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
        delete: (id: string) => request<{ success: boolean; message: string }>(`/knowledge-pool/sources/${id}`, { method: 'DELETE' }),
        bulkDelete: (ids: string[]) => request<{ success: boolean; count: number }>('/knowledge-pool/sources/bulk-delete', { method: 'POST', body: JSON.stringify({ ids }) }),
    },
    tickets: {
        list: (params?: Record<string, string>) => {
            const q = params ? '?' + new URLSearchParams(params).toString() : '';
            return request<{ data: any[]; total: number }>(`/tickets${q}`);
        },
        get: (id: string) => request<any>(`/tickets/${id}`),
        create: (body: any) => request<any>('/tickets', { method: 'POST', body: JSON.stringify(body) }),
        updateStatus: (id: string, status: string) =>
            request<any>(`/tickets/${id}/status/${status}`, { method: 'PATCH' }),
        addMessage: (id: string, body: any) =>
            request<any>(`/tickets/${id}/messages`, { method: 'POST', body: JSON.stringify(body) }),
        getSlaStats: () => request<any>('/tickets/sla/stats'),
        bulkUpdate: (body: { ticketIds: string[]; status?: string; priority?: string; assignedTo?: string }) =>
            request<any>('/tickets/bulk', { method: 'PATCH', body: JSON.stringify(body) }),
        bulkDelete: (ids: string[]) => request<any>('/tickets/bulk', { method: 'DELETE', body: JSON.stringify({ ticketIds: ids }) }),
        delete: (id: string) => request<any>(`/tickets/${id}`, { method: 'DELETE' }),
    },
    ai: {
        query: (query: string, hotinfoContext?: any, productId?: string | null, language?: string, history?: Array<{ role: 'user' | 'assistant'; content: string }>, attachments?: any[], wait?: boolean) => {
            const url = wait ? '/ai/query?wait=true' : '/ai/query';
            return request<{
                query: string;
                answer: string | null;
                confidence: string;
                sources: any[];
                interactionId: string;
                suggestTicket: boolean;
                jobId?: string;
                status?: string;
            }>(url, {
                method: 'POST',
                body: JSON.stringify({ query, hotinfoContext, productId, language, history, attachments }),
                signal: typeof AbortSignal !== 'undefined' ? AbortSignal.timeout(60000) : undefined, // Increased to 60s for sync waits
            });
        },
        getJobStatus: (jobId: string) =>
            request<{
                jobId: string;
                status: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED';
                result?: { answer?: string; status?: string };
                error?: string;
            }>(`/ai/status/${jobId}`),
        search: (query: string, productId?: string | null, limit = 5, language?: string) =>
            request<{
                results: any[];
                interactionId: string;
            }>('/ai/search', {
                method: 'POST',
                body: JSON.stringify({ query, productId, limit, language }),
            }),
        feedback: (interactionId: string, rating: number, comment?: string) =>
            request<any>(`/ai/interactions/${interactionId}/feedback`, {
                method: 'POST', body: JSON.stringify({ rating, comment }),
            }),
        status: () => request<any>('/ai/status'),
        getHealthStatus: () => request<{
            status: 'HEALTHY' | 'DEGRADED' | 'DOWN';
            chatProvider: string;
            embedProvider: string;
            circuitBreaker: { open: boolean; openUntil: number | null; failureCount: number };
            providers: Record<string, { available: boolean; message: string }>;
        }>('/ai/health-status'),
        testConnection: (provider: string) => request<{ success: boolean; provider: string; message: string }>('/ai/test-connection', {
            method: 'POST',
            body: JSON.stringify({ provider }),
        }),
        testStorage: () => request<any>('/ai/test-storage', { method: 'POST' }),
        listModels: (provider: string, apiKey?: string, baseUrl?: string) => request<{
            chatModels: Array<{ id: string; displayName: string; recommended: boolean }>;
            embedModels: Array<{ id: string; displayName: string; recommended: boolean }>;
        }>('/ai/list-models', { method: 'POST', body: JSON.stringify({ provider, apiKey, baseUrl }) }),
        getCopilotDraft: (ticketId: string) => request<{ draft: string; model: string }>(`/ai/copilot/draft/${ticketId}`),
        getMetrics: (channel?: string) => request<{
            global: {
                _sum: {
                    inputTokens: number | null;
                    outputTokens: number | null;
                    totalTokens: number | null;
                    estimatedCost: number | null;
                };
                _count: { id: number };
            };
            providers: Array<{
                provider: string;
                model: string;
                metrics: {
                    inputTokens: number;
                    outputTokens: number;
                    totalTokens: number;
                    estimatedCost: number;
                    requests: number;
                };
            }>;
            channels?: Array<{
                channel: string;
                requests: number;
                tokens: number;
                cost: number;
            }>;
        }>(`/ai/metrics${channel ? `?channel=${channel}` : ''}`),
        getHealthMetrics: () => request<{
            totalInteractions: number;
            deflectionRate: number;
            aiAccuracy: number;
            confidenceDistribution: Array<{ band: string; count: number }>;
        }>('/ai/health-metrics'),
        getHealthTrends: (days = 7) => request<Array<{
            date: string;
            total: number;
            accuracy: number;
            deflection: number;
        }>>(`/ai/health-trends?days=${days}`),
        getKnowledgeGaps: (limit = 5) => request<Array<{
            query: string;
            frequency: number;
        }>>(`/ai/knowledge-gaps?limit=${limit}`),
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
        getIntelligence: (days = 30) => request<any>(`/ai/intelligence?days=${days}`),
        getHealthEvents: (limit = 50, type?: string, days?: number) =>
            request<any[]>(`/ai/health-events?limit=${limit}${type ? `&type=${type}` : ''}${days ? `&days=${days}` : ''}`),
        getHealthStats: (days = 7) =>
            request<{ total: number; byType: Array<{ type: string; count: number }>; byProvider: Array<{ provider: string; count: number; avgLatencyMs: number | null }>; avgLatencyMs: number | null }>(`/ai/health-stats?days=${days}`),
    },
    kb: {
        listCategories: () => request<any[]>('/kb/categories'),
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
        getStats: (id: string) => request<any>(`/teams/${id}/stats`),
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
        lookup: (email: string) => request<any>(`/users/lookup?email=${encodeURIComponent(email)}`),
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
        // GAP-04: Use cookie-based auth instead of localStorage
        getDownloadUrl: (id: string) => {
            return `${getApiUrl()}/attachments/${id}/download`;
        },
    },
    customers: {
        list: (params?: { page?: number; limit?: number; search?: string }) => {
            const qs = new URLSearchParams();
            if (params?.page) qs.set('page', String(params.page));
            if (params?.limit) qs.set('limit', String(params.limit));
            if (params?.search) qs.set('search', params.search);
            const query = qs.toString();
            return request<{ data: any[]; total: number; page: number; limit: number; totalPages: number }>(`/customers${query ? `?${query}` : ''}`);
        },
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
        get: (key: string) => request<any>(`/settings/${key}`),
        upsert: (body: any) => request<any>('/settings', { method: 'POST', body: JSON.stringify(body) }),
        bulkUpsert: (body: { settings: any[] }) => request<any>('/settings/bulk', { method: 'POST', body: JSON.stringify(body) }),
        delete: (key: string) => request<any>(`/settings/${key}`, { method: 'DELETE' }),
        testStorage: (config: { endpoint: string, region: string, accessKey: string, secretKey: string, bucket: string }) =>
            request<any>('/settings/test-storage', { method: 'POST', body: JSON.stringify(config) }),
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
        getContentBlocks: (name: string) => request<{ blocks: any[] }>(`/email/admin/templates/${name}/content`),
        saveContentBlocks: (name: string, blocks: any[]) => request<{ success: true }>(`/email/admin/templates/${name}/content`, { method: 'POST', body: JSON.stringify({ blocks }) }),
        verifyProvider: () => request<{ provider: string; available: boolean }>('/email/admin/provider/verify', { method: 'POST' }),
        verifyImap: () => request<{ available: boolean; message: string }>('/email/admin/imap/verify', { method: 'POST' }),
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
        getMyAnnouncements: (page = 1, limit = 20) =>
            request<{ data: any[]; total: number }>(`/announcements/my?page=${page}&limit=${limit}`),
        getUnreadCount: () =>
            request<{ count: number }>('/announcements/my/unread-count'),
        markLogRead: (logId: string) =>
            request<any>(`/announcements/logs/${logId}/read`, { method: 'PATCH' }),
    },
    announcementTemplates: {
        list: () => request<any[]>('/announcement-templates'),
        get: (id: string) => request<any>(`/announcement-templates/${id}`),
        create: (body: any) => request<any>('/announcement-templates', { method: 'POST', body: JSON.stringify(body) }),
        update: (id: string, body: any) => request<any>(`/announcement-templates/${id}`, { method: 'PATCH', body: JSON.stringify(body) }),
        delete: (id: string) => request<any>(`/announcement-templates/${id}`, { method: 'DELETE' }),
    },
    preferences: {
        getEmail: () => request<Array<{ emailType: string; enabled: boolean }>>('/preferences/email'),
        updateEmail: (emailType: string, enabled: boolean) =>
            request<any>('/preferences/email', {
                method: 'PATCH',
                body: JSON.stringify({ emailType, enabled }),
            }),
    },
    emailValidator: {
        verify: (email: string) => request<any>(`/email-validator/verify?email=${encodeURIComponent(email)}`),
        verifyBulk: (emails: string[]) => request<any[]>('/email-validator/verify-bulk', { method: 'POST', body: JSON.stringify({ emails }) }),
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
        getDiscoveryData: (id: string) => request<any>(`/crm/discovery/${id}`),
        getLogs: (connectionId: string) => request<any[]>(`/crm/logs/${connectionId}`),
        getAccounts: () => request<any[]>('/crm/accounts'),
        getAccount: (id: string) => request<any>(`/crm/accounts/${id}`),
        bulkDeleteAccounts: (ids: string[]) => request<any>('/crm/accounts/bulk-delete', { method: 'POST', body: JSON.stringify({ ids }) }),
        getFieldDefinitions: () => request<{ account: any[]; contact: any[] }>('/crm/fields-definitions'),
    },
    proactiveChat: {
        createSession: (customerId: string) =>
            request<any>('/proactive-chat/sessions', {
                method: 'POST',
                body: JSON.stringify({ customerId }),
            }),
        acceptSession: (sessionId: string) =>
            request<any>(`/proactive-chat/sessions/${sessionId}/accept`, { method: 'PATCH' }),
        declineSession: (sessionId: string) =>
            request<any>(`/proactive-chat/sessions/${sessionId}/decline`, { method: 'PATCH' }),
        endSession: (sessionId: string) =>
            request<any>(`/proactive-chat/sessions/${sessionId}/end`, { method: 'PATCH' }),
        sendMessage: (sessionId: string, content: string) =>
            request<any>(`/proactive-chat/sessions/${sessionId}/messages`, {
                method: 'POST',
                body: JSON.stringify({ content }),
            }),
        getMessages: (sessionId: string) =>
            request<any[]>(`/proactive-chat/sessions/${sessionId}/messages`),
        convertToTicket: (sessionId: string) =>
            request<any>(`/proactive-chat/sessions/${sessionId}/convert`, { method: 'POST' }),
        listSessions: () =>
            request<any[]>('/proactive-chat/sessions'),
    },
    get: (url: string) => request<any>(url),
    post: (url: string, body: any) =>
        request<any>(url, {
            method: 'POST',
            body: body instanceof FormData ? body : JSON.stringify(body)
        }),
    delete: (url: string) => request<any>(url, { method: 'DELETE' }),
    patch: (url: string, body: any) =>
        request<any>(url, {
            method: 'PATCH',
            body: body instanceof FormData ? body : JSON.stringify(body)
        }),
    getBaseUrl: () => getApiUrl(),
};
