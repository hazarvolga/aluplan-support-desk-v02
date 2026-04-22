import { http, HttpResponse } from 'msw';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1';

export const handlers = [
    // ── Auth ──────────────────────────────────────────────────────────
    http.post(`${API_BASE}/auth/login`, async ({ request }) => {
        const body = await request.json() as Record<string, string>;

        if (body.email === 'admin@aluplan.com' && body.password === 'admin123') {
            return HttpResponse.json({
                accessToken: 'mock-access-token',
                refreshToken: 'mock-refresh-token',
                user: { id: 'user-1', email: 'admin@aluplan.com', fullName: 'Test Admin', role: { name: 'admin' } },
            });
        }

        return HttpResponse.json({ message: 'AUTH_FAILURE: Invalid credentials' }, { status: 401 });
    }),

    http.post(`${API_BASE}/auth/refresh`, () => {
        return HttpResponse.json({
            accessToken: 'mock-access-token-refreshed',
        });
    }),

    http.post(`${API_BASE}/auth/logout`, () => {
        return HttpResponse.json({ success: true });
    }),

    // ── Tickets ───────────────────────────────────────────────────────
    http.get(`${API_BASE}/tickets`, () => {
        return HttpResponse.json({
            data: [
                {
                    id: 'tik-1', ticketNumber: 'SUP-00001', subject: 'Test ticket',
                    status: 'OPEN', priority: 'HIGH', createdAt: new Date().toISOString(),
                    channel: 'WEB', knowledgeBaseAdded: false, isSlaBreached: false,
                    creator: { fullName: 'John Customer', customerProfile: { companyName: 'Customer Corp', contractStatus: 'ACTIVE' } }
                },
            ],
            total: 1,
        });
    }),

    http.post(`${API_BASE}/tickets`, async ({ request }) => {
        const body = await request.json() as Record<string, string>;
        return HttpResponse.json(
            {
                id: 'tik-new', ticketNumber: 'SUP-00002',
                subject: body.subject, status: 'NEW', priority: body.priority || 'MEDIUM',
                createdAt: new Date().toISOString(),
            },
            { status: 201 }
        );
    }),

    // ── AI Query ──────────────────────────────────────────────────────
    http.post(`${API_BASE}/ai/query`, async () => {
        return HttpResponse.json({
            answer: 'This is a mock AI answer for testing.',
            confidence: 'HIGH',
            sources: [],
            interactionId: 'int-mock-1',
            suggestTicket: false,
        });
    }),

    http.get(`${API_BASE}/ai/status`, () => {
        return HttpResponse.json({ available: true, model: 'gpt-4o' });
    }),

    http.get(`${API_BASE}/ai/health-metrics`, () => {
        return HttpResponse.json({ aiAccuracy: 95, totalQueries: 1000 });
    }),

    // ── SLA Stats ─────────────────────────────────────────────────────
    http.get(`${API_BASE}/tickets/sla/stats`, () => {
        return HttpResponse.json({
            total: 10,
            active: 5,
            breached: 1,
            resolvedToday: 2,
            byPriority: [
                { priority: 'URGENT', _count: 1 },
                { priority: 'HIGH', _count: 2 },
                { priority: 'MEDIUM', _count: 5 },
                { priority: 'LOW', _count: 2 },
            ],
        });
    }),

    // ── KB ────────────────────────────────────────────────────────────
    http.get(`${API_BASE}/kb/articles`, () => {
        return HttpResponse.json({
            data: [
                {
                    id: 'kb-1',
                    title: 'How to reset password',
                    status: 'PUBLISHED',
                    tags: ['auth', 'account'],
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString(),
                    creator: { fullName: 'Admin' }
                },
            ],
            total: 1,
        });
    }),

    http.post(`${API_BASE}/kb/articles/:id/review`, async ({ params }) => {
        return HttpResponse.json({ success: true, id: params.id });
    }),
];
