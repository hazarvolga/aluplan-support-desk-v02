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
                },
            ],
            meta: { total: 1, page: 1, limit: 20 },
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
];
