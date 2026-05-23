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

    http.get(`${API_BASE}/dashboard/ops`, () => {
        return HttpResponse.json({
            generatedAt: new Date().toISOString(),
            window: { days: 7, todayStart: new Date().toISOString(), trendStart: new Date().toISOString() },
            kpis: {
                activeTickets: 1,
                unassignedTickets: 0,
                crmUpdatesToday: 2,
                crawlCandidates: 3,
                aiConfidence: 92,
                slaBreaches: 0,
                resolvedToday: 1,
            },
            decision: { level: 'ok', code: 'operationally_stable', primaryAction: '/tickets' },
            cost: {
                currency: 'USD',
                source: 'estimated',
                today: { requests: 2, inputTokens: 100, outputTokens: 50, totalTokens: 150, estimatedCost: 0.01 },
                rolling30d: { requests: 12, inputTokens: 1000, outputTokens: 500, totalTokens: 1500, estimatedCost: 0.12 },
                providers: [{ provider: 'gemini', model: 'gemini-2.5-flash', requests: 12, inputTokens: 1000, outputTokens: 500, totalTokens: 1500, estimatedCost: 0.12 }],
            },
            system: { status: 'HEALTHY', aiEvents: { success: 3 }, activeAgents: 1, dndAgents: 0, recentErrors: [] },
            queues: {
                knowledge: { waiting: 0, active: 0, delayed: 0, failed: 0, completed: 2, paused: 0 },
                crm: { waiting: 0, active: 0, delayed: 0, failed: 0, completed: 1, paused: 0 },
                ai: { waiting: 0, active: 0, delayed: 0, failed: 0, completed: 3, paused: 0 },
            },
            activeDesk: {
                total: 1,
                tickets: [{
                    id: 'tik-1',
                    ticketNumber: 'SUP-00001',
                    subject: 'Test ticket',
                    priority: 'HIGH',
                    creator: { fullName: 'John Customer', customerProfile: { companyName: 'Customer Corp' } },
                    assignee: { fullName: 'Agent One' },
                }],
                trend: [{ date: '2026-05-23', created: 1, resolved: 0 }],
            },
            actions: [
                { id: 'unassigned', severity: 'ok', count: 0, href: '/tickets' },
                { id: 'low_confidence_ai', severity: 'warning', count: 1, href: '/ai-health' },
            ],
            pulse: {
                ticketTrend: [{ date: '2026-05-23', created: 1, resolved: 0 }],
                aiQuality: { summary: { total: 2, confidenceRate: 92, fallbackRate: 0, sourceLeaks: 0, languageRisks: 0 }, trend: [{ date: '2026-05-23', total: 2, confidence: 92, lowConfidence: 0 }] },
                crm: { updatedToday: 2, failuresToday: 0, trend: [{ date: '2026-05-23', count: 2 }], recentChanges: [] },
                knowledge: { activeSources: 10, syncFailuresToday: 0, embeddings: 120, genericCandidatesPending: 3, datasetSources: 5, trend: [{ date: '2026-05-23', count: 10 }] },
            },
            learnNow: { pendingReview: 2, byStatus: { IMPORTED: 5, SKIPPED_DUPLICATE: 1 }, byFormat: {}, recent: [] },
            liveFeed: [{ id: 'feed-1', type: 'ticket', title: 'SUP-00001', description: 'Test ticket', status: 'OPEN', at: new Date().toISOString(), href: '/tickets/tik-1' }],
        });
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
