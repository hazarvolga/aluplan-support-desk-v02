import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { api } from './api';

type ContractCase = {
    name: string;
    invoke: () => Promise<unknown>;
    path: string;
    method?: string;
    body?: unknown;
    calls?: number;
};

const jsonResponse = (body: unknown = {}, status = 200) => ({
    ok: status >= 200 && status < 300,
    status,
    statusText: status === 401 ? 'Unauthorized' : 'OK',
    text: async () => JSON.stringify(body),
    json: async () => body,
    headers: new Headers(),
    blob: async () => new Blob(['ok']),
}) as Response;

describe('API endpoint contracts', () => {
    const originalFetch = global.fetch;
    const fetchMock = vi.fn();

    beforeEach(() => {
        fetchMock.mockReset();
        fetchMock.mockImplementation(async () => jsonResponse());
        global.fetch = fetchMock as typeof fetch;
    });

    afterEach(() => {
        global.fetch = originalFetch;
    });

    const verifyCases = async (cases: ContractCase[]) => {
        for (const contract of cases) {
            fetchMock.mockClear();
            await contract.invoke();
            expect(fetchMock, contract.name).toHaveBeenCalledTimes(contract.calls ?? 1);
            const [url, init] = fetchMock.mock.calls[0] as [string, RequestInit];
            const parsedUrl = new URL(url, 'http://local.invalid');
            expect(`${parsedUrl.pathname}${parsedUrl.search}`, contract.name).toBe(`/api/v1${contract.path}`);
            expect(init.method ?? 'GET', contract.name).toBe(contract.method ?? 'GET');
            if (contract.body !== undefined) {
                expect(init.body, contract.name).toBe(JSON.stringify(contract.body));
            }
        }
    };

    it('keeps dashboard, auth, tickets, and pool routes stable', async () => {
        await verifyCases([
            { name: 'dashboard ops', invoke: () => api.dashboard.ops(14), path: '/dashboard/ops?days=14' },
            { name: 'review summary', invoke: () => api.reviewCenter.summary(), path: '/review-center/summary' },
            { name: 'auth login', invoke: () => api.auth.login('agent@example.com', 'secret'), path: '/auth/login', method: 'POST', body: { email: 'agent@example.com', password: 'secret', rememberMe: false } },
            { name: 'persistent auth login', invoke: () => api.auth.login('agent@example.com', 'secret', true), path: '/auth/login', method: 'POST', body: { email: 'agent@example.com', password: 'secret', rememberMe: true } },
            { name: 'auth lookup', invoke: () => api.auth.lookup('a+b@example.com'), path: '/auth/lookup', method: 'POST', body: { email: 'a+b@example.com' } },
            { name: 'forgot password', invoke: () => api.auth.forgotPassword('a@example.com'), path: '/auth/forgot-password', method: 'POST', body: { email: 'a@example.com' } },
            { name: 'resend verification', invoke: () => api.auth.resendVerification('a@example.com'), path: '/auth/resend-verification', method: 'POST', body: { email: 'a@example.com' } },
            { name: 'verify email', invoke: () => api.auth.verifyEmail('token'), path: '/auth/verify-email', method: 'POST', body: { token: 'token' } },
            { name: 'reset password', invoke: () => api.auth.resetPassword('token', 'new-secret'), path: '/auth/reset-password', method: 'POST', body: { token: 'token', newPassword: 'new-secret' } },
            { name: 'current user', invoke: () => api.auth.me(), path: '/auth/me' },
            { name: 'logout', invoke: () => api.auth.logout(), path: '/auth/logout', method: 'POST', calls: 2 },
            { name: 'pool sync', invoke: () => api.pool.sync('source-1'), path: '/knowledge-pool/sources/source-1/sync', method: 'POST' },
            { name: 'pool logs', invoke: () => api.pool.logs('source-1'), path: '/knowledge-pool/sources/source-1/logs' },
            { name: 'dataset sync', invoke: () => api.pool.syncDataset(), path: '/knowledge-pool/sync-dataset', method: 'POST' },
            { name: 'start crawl', invoke: () => api.pool.startLearnNowCrawlRun({ search: 'license', maxCandidates: 5 }), path: '/knowledge-pool/crawl/learnnow/runs', method: 'POST', body: { search: 'license', maxCandidates: 5 } },
            { name: 'get crawl run', invoke: () => api.pool.learnNowCrawlRun('run-1'), path: '/knowledge-pool/crawl/learnnow/runs/run-1' },
            { name: 'pause crawl', invoke: () => api.pool.pauseLearnNowCrawlRun('run-1'), path: '/knowledge-pool/crawl/learnnow/runs/run-1/pause', method: 'POST' },
            { name: 'resume crawl', invoke: () => api.pool.resumeLearnNowCrawlRun('run-1'), path: '/knowledge-pool/crawl/learnnow/runs/run-1/resume', method: 'POST' },
            { name: 'discover generic', invoke: () => api.pool.discoverGenericWeb({ startUrl: 'https://example.com' }), path: '/knowledge-pool/crawl/discover', method: 'POST', body: { startUrl: 'https://example.com' } },
            { name: 'discover help', invoke: () => api.pool.discoverAllplanHelp({ startUrl: 'https://help.allplan.com' }), path: '/knowledge-pool/crawl/allplan-help/discover', method: 'POST', body: { startUrl: 'https://help.allplan.com' } },
            { name: 'candidate filters', invoke: () => api.pool.crawlCandidates('PENDING', 'LEARNNOW'), path: '/knowledge-pool/crawl/candidates?status=PENDING&source=LEARNNOW' },
            { name: 'import candidate', invoke: () => api.pool.importCrawlCandidate('candidate-1'), path: '/knowledge-pool/crawl/candidates/candidate-1/import', method: 'POST' },
            { name: 'approve candidate', invoke: () => api.pool.approveCrawlCandidate('candidate-1'), path: '/knowledge-pool/crawl/candidates/candidate-1/approve', method: 'POST' },
            { name: 'reject candidate', invoke: () => api.pool.rejectCrawlCandidate('candidate-1', 'duplicate'), path: '/knowledge-pool/crawl/candidates/candidate-1/reject', method: 'POST', body: { reason: 'duplicate' } },
            { name: 'delete candidate', invoke: () => api.pool.deleteCrawlCandidate('candidate-1'), path: '/knowledge-pool/crawl/candidates/candidate-1', method: 'DELETE' },
            { name: 'bulk delete candidates', invoke: () => api.pool.bulkDeleteCrawlCandidates(['one', 'two']), path: '/knowledge-pool/crawl/candidates/bulk-delete', method: 'POST', body: { ids: ['one', 'two'] } },
            { name: 'delete source', invoke: () => api.pool.delete('source-1'), path: '/knowledge-pool/sources/source-1', method: 'DELETE' },
            { name: 'bulk delete sources', invoke: () => api.pool.bulkDelete(['one', 'two']), path: '/knowledge-pool/sources/bulk-delete', method: 'POST', body: { ids: ['one', 'two'] } },
            { name: 'csat survey', invoke: () => api.tickets.getCsatSurvey('a/b'), path: '/tickets/csat/a%2Fb' },
            { name: 'csat feedback', invoke: () => api.tickets.submitCsatFeedback('token', 4, 'good'), path: '/tickets/csat/token', method: 'POST', body: { score: 4, comment: 'good' } },
            { name: 'ticket filters', invoke: () => api.tickets.list({ status: 'OPEN', search: 'A B' }), path: '/tickets?status=OPEN&search=A+B' },
            { name: 'AI trace', invoke: () => api.tickets.getAiTrace('ticket-1'), path: '/tickets/ticket-1/ai-trace' },
            { name: 'assignable agents', invoke: () => api.tickets.assignableAgents('ticket-1'), path: '/tickets/ticket-1/assignable-agents' },
            { name: 'create ticket', invoke: () => api.tickets.create({ subject: 'Issue' }), path: '/tickets', method: 'POST', body: { subject: 'Issue' } },
            { name: 'update status', invoke: () => api.tickets.updateStatus('ticket-1', 'OPEN'), path: '/tickets/ticket-1/status/OPEN', method: 'PATCH' },
            { name: 'assign ticket', invoke: () => api.tickets.assign('ticket-1', 'agent-1'), path: '/tickets/ticket-1/assign/agent-1', method: 'PATCH' },
            { name: 'add message', invoke: () => api.tickets.addMessage('ticket-1', { message: 'Hello' }), path: '/tickets/ticket-1/messages', method: 'POST', body: { message: 'Hello' } },
            { name: 'bulk update tickets', invoke: () => api.tickets.bulkUpdate({ ticketIds: ['ticket-1'], priority: 'HIGH' }), path: '/tickets/bulk', method: 'PATCH', body: { ticketIds: ['ticket-1'], priority: 'HIGH' } },
            { name: 'bulk delete tickets', invoke: () => api.tickets.bulkDelete(['ticket-1']), path: '/tickets/bulk', method: 'DELETE', body: { ticketIds: ['ticket-1'] } },
            { name: 'delete ticket', invoke: () => api.tickets.delete('ticket-1'), path: '/tickets/ticket-1', method: 'DELETE' },
        ]);
    });

    it('keeps AI, knowledge base, FAQ, and team routes stable', async () => {
        await verifyCases([
            { name: 'AI search', invoke: () => api.ai.search('license', 'product-1', 8, 'tr'), path: '/ai/search', method: 'POST', body: { query: 'license', productId: 'product-1', limit: 8, language: 'tr' } },
            { name: 'AI job', invoke: () => api.ai.getJobStatus('job-1'), path: '/ai/status/job-1' },
            { name: 'AI feedback', invoke: () => api.ai.feedback('interaction-1', 1, 'useful'), path: '/ai/interactions/interaction-1/feedback', method: 'POST', body: { rating: 1, comment: 'useful' } },
            { name: 'AI interactions', invoke: () => api.ai.listInteractions({ page: 2, limit: 10, ticketState: 'TICKETED', confidence: 'LOW', search: ' license ', interactionId: 'i-1' }), path: '/ai/interactions?page=2&limit=10&ticketState=TICKETED&confidence=LOW&search=license&interactionId=i-1' },
            { name: 'AI health', invoke: () => api.ai.getHealthStatus(), path: '/ai/health-status' },
            { name: 'AI test', invoke: () => api.ai.testConnection('OPENAI'), path: '/ai/test-connection', method: 'POST', body: { provider: 'OPENAI' } },
            { name: 'AI storage', invoke: () => api.ai.testStorage(), path: '/ai/test-storage', method: 'POST' },
            { name: 'AI models', invoke: () => api.ai.listModels('OPENAI', 'key', 'https://api.example.com'), path: '/ai/list-models', method: 'POST', body: { provider: 'OPENAI', apiKey: 'key', baseUrl: 'https://api.example.com' } },
            { name: 'AI copilot', invoke: () => api.ai.getCopilotDraft('ticket-1'), path: '/ai/copilot/draft/ticket-1' },
            { name: 'AI metrics', invoke: () => api.ai.getMetrics('WEB'), path: '/ai/metrics?channel=WEB' },
            { name: 'AI health metrics', invoke: () => api.ai.getHealthMetrics(), path: '/ai/health-metrics' },
            { name: 'AI health trends', invoke: () => api.ai.getHealthTrends(30), path: '/ai/health-trends?days=30' },
            { name: 'AI gaps', invoke: () => api.ai.getKnowledgeGaps(9), path: '/ai/knowledge-gaps?limit=9' },
            { name: 'AI source stats', invoke: () => api.ai.getSourcesStats(), path: '/ai/sources-stats' },
            { name: 'AI intelligence', invoke: () => api.ai.getIntelligence(60), path: '/ai/intelligence?days=60' },
            { name: 'AI events', invoke: () => api.ai.getHealthEvents(25, 'ERROR', 3), path: '/ai/health-events?limit=25&type=ERROR&days=3' },
            { name: 'AI stats', invoke: () => api.ai.getHealthStats(14), path: '/ai/health-stats?days=14' },
            { name: 'KB categories', invoke: () => api.kb.listCategories(), path: '/kb/categories' },
            { name: 'KB list', invoke: () => api.kb.list({ status: 'PUBLISHED' }), path: '/kb/articles?status=PUBLISHED' },
            { name: 'KB get', invoke: () => api.kb.get('article-1'), path: '/kb/articles/article-1' },
            { name: 'KB create', invoke: () => api.kb.create({ title: 'Title' }), path: '/kb/articles', method: 'POST', body: { title: 'Title' } },
            { name: 'KB update', invoke: () => api.kb.update('article-1', { title: 'Updated' }), path: '/kb/articles/article-1', method: 'PATCH', body: { title: 'Updated' } },
            { name: 'KB submit', invoke: () => api.kb.submitForReview('article-1'), path: '/kb/articles/article-1/submit', method: 'POST' },
            { name: 'KB review', invoke: () => api.kb.review('article-1', true), path: '/kb/articles/article-1/review', method: 'POST', body: { approved: true } },
            { name: 'KB feedback', invoke: () => api.kb.submitFeedback('article-1', true, 'clear'), path: '/kb/articles/article-1/feedback', method: 'POST', body: { isHelpful: true, comment: 'clear' } },
            { name: 'KB view', invoke: () => api.kb.incrementView('article-1'), path: '/kb/articles/article-1/view', method: 'POST' },
            { name: 'KB analytics', invoke: () => api.kb.getAnalytics('article-1'), path: '/kb/articles/article-1/analytics' },
            { name: 'KB compare', invoke: () => api.kb.compare('article-1', 1, 2), path: '/kb/articles/article-1/compare?v1=1&v2=2' },
            { name: 'KB suggestion', invoke: () => api.kb.suggestCategory('Title', 'Body'), path: '/kb/articles/suggest-category', method: 'POST', body: { title: 'Title', content: 'Body' } },
            { name: 'KB global analytics', invoke: () => api.kb.getGlobalAnalytics(), path: '/kb/analytics' },
            { name: 'KB pending', invoke: () => api.kb.listPending(), path: '/kb/articles?status=REVIEW' },
            { name: 'FAQ published', invoke: () => api.faq.published(), path: '/faq/published' },
            { name: 'FAQ list', invoke: () => api.faq.list('PENDING'), path: '/faq?status=PENDING' },
            { name: 'FAQ approve', invoke: () => api.faq.approve('faq-1'), path: '/faq/faq-1/approve', method: 'POST' },
            { name: 'FAQ dismiss', invoke: () => api.faq.dismiss('faq-1'), path: '/faq/faq-1/dismiss', method: 'POST' },
            { name: 'FAQ remove', invoke: () => api.faq.remove('faq-1'), path: '/faq/faq-1', method: 'DELETE' },
            { name: 'FAQ pipeline', invoke: () => api.faq.runPipeline(), path: '/faq/pipeline/run', method: 'POST' },
            { name: 'team departments', invoke: () => api.teams.departments(), path: '/teams/departments' },
            { name: 'team options', invoke: () => api.teams.departmentOptions(), path: '/teams/departments/options' },
            { name: 'team department', invoke: () => api.teams.getDepartment('department-1'), path: '/teams/departments/department-1' },
            { name: 'team list', invoke: () => api.teams.list(), path: '/teams' },
            { name: 'team get', invoke: () => api.teams.get('team-1'), path: '/teams/team-1' },
            { name: 'team stats', invoke: () => api.teams.getStats('team-1'), path: '/teams/team-1/stats' },
            { name: 'team create', invoke: () => api.teams.create({ name: 'Support' }), path: '/teams', method: 'POST', body: { name: 'Support' } },
            { name: 'team update', invoke: () => api.teams.update('team-1', { name: 'Level 2' }), path: '/teams/team-1', method: 'PATCH', body: { name: 'Level 2' } },
            { name: 'team add member', invoke: () => api.teams.addMember('team-1', { userId: 'agent-1' }), path: '/teams/team-1/members', method: 'POST', body: { userId: 'agent-1' } },
            { name: 'team remove member', invoke: () => api.teams.removeMember('team-1', 'agent-1'), path: '/teams/team-1/members/agent-1', method: 'DELETE' },
            { name: 'agent profile', invoke: () => api.teams.getAgentProfile('agent-1'), path: '/teams/agents/agent-1' },
            { name: 'agent status', invoke: () => api.teams.updateMyStatus('AVAILABLE'), path: '/teams/agents/me/status', method: 'PATCH', body: { status: 'AVAILABLE' } },
            { name: 'agent profile update', invoke: () => api.teams.updateMyProfile({ bio: 'Ready' }), path: '/teams/agents/me/profile', method: 'PATCH', body: { bio: 'Ready' } },
        ]);
    });

    it('keeps admin CRUD and communication routes stable', async () => {
        await verifyCases([
            { name: 'users list', invoke: () => api.users.list('agent'), path: '/users?type=agent' },
            { name: 'users get', invoke: () => api.users.get('user-1'), path: '/users/user-1' },
            { name: 'users lookup', invoke: () => api.users.lookup('a+b@example.com'), path: '/users/lookup?email=a%2Bb%40example.com' },
            { name: 'users create', invoke: () => api.users.create({ email: 'a@example.com' }), path: '/users', method: 'POST', body: { email: 'a@example.com' } },
            { name: 'profile update', invoke: () => api.users.updateProfile({ fullName: 'A' }), path: '/users/profile', method: 'PATCH', body: { fullName: 'A' } },
            { name: 'users update', invoke: () => api.users.update('user-1', { status: 'ACTIVE' }), path: '/users/user-1', method: 'PATCH', body: { status: 'ACTIVE' } },
            { name: 'users delete', invoke: () => api.users.delete('user-1'), path: '/users/user-1', method: 'DELETE' },
            { name: 'customers list', invoke: () => api.customers.list({ page: 2, limit: 25, search: 'Acme A' }), path: '/customers?page=2&limit=25&search=Acme+A' },
            { name: 'customer get', invoke: () => api.customers.getById('customer-1'), path: '/customers/customer-1' },
            { name: 'customer update', invoke: () => api.customers.update('customer-1', { isVip: true }), path: '/customers/customer-1', method: 'PATCH', body: { isVip: true } },
            { name: 'customer bulk delete', invoke: () => api.customers.bulkDelete(['customer-1']), path: '/customers/bulk-delete', method: 'POST', body: { ids: ['customer-1'] } },
            { name: 'customer password', invoke: () => api.customers.resetPassword('customer-1'), path: '/customers/customer-1/reset-password', method: 'POST' },
            { name: 'customer import', invoke: () => api.customers.import([{ email: 'a@example.com' }]), path: '/customers/import', method: 'POST', body: [{ email: 'a@example.com' }] },
            { name: 'products list', invoke: () => api.products.list(), path: '/products' },
            { name: 'products create', invoke: () => api.products.create({ name: 'Allplan' }), path: '/products', method: 'POST', body: { name: 'Allplan' } },
            { name: 'products update', invoke: () => api.products.update('product-1', { description: 'CAD' }), path: '/products/product-1', method: 'PATCH', body: { description: 'CAD' } },
            { name: 'products archive', invoke: () => api.products.archive('product-1'), path: '/products/product-1', method: 'DELETE' },
            { name: 'category create', invoke: () => api.products.createCategory('product-1', { name: 'License' }), path: '/products/product-1/categories', method: 'POST', body: { name: 'License' } },
            { name: 'category update', invoke: () => api.products.updateCategory('category-1', { keywords: ['license'] }), path: '/products/categories/category-1', method: 'PATCH', body: { keywords: ['license'] } },
            { name: 'category archive', invoke: () => api.products.archiveCategory('category-1'), path: '/products/categories/category-1', method: 'DELETE' },
            { name: 'redacted settings list', invoke: () => api.settings.list(), path: '/settings' },
            { name: 'redacted setting get', invoke: () => api.settings.get('AI_PROVIDER'), path: '/settings/AI_PROVIDER' },
            { name: 'settings upsert', invoke: () => api.settings.upsert({ key: 'x', value: 'y' }), path: '/settings', method: 'POST', body: { key: 'x', value: 'y' } },
            { name: 'settings bulk', invoke: () => api.settings.bulkUpsert({ settings: [{ key: 'x' }] }), path: '/settings/bulk', method: 'POST', body: { settings: [{ key: 'x' }] } },
            { name: 'settings delete', invoke: () => api.settings.delete('x'), path: '/settings/x', method: 'DELETE' },
            { name: 'SLA list', invoke: () => api.sla.list(), path: '/tickets/sla/policies' },
            { name: 'SLA create', invoke: () => api.sla.create({ name: 'High', priority: 'HIGH', departmentId: '11111111-1111-4111-8111-111111111111', firstResponseMinutes: 60, resolutionMinutes: 240, businessHoursOnly: true }), path: '/tickets/sla/policies', method: 'POST', body: { name: 'High', priority: 'HIGH', departmentId: '11111111-1111-4111-8111-111111111111', firstResponseMinutes: 60, resolutionMinutes: 240, businessHoursOnly: true } },
            { name: 'SLA update', invoke: () => api.sla.update('sla-1', { resolutionMinutes: 240 }), path: '/tickets/sla/policies/sla-1', method: 'PATCH', body: { resolutionMinutes: 240 } },
            { name: 'SLA delete', invoke: () => api.sla.delete('sla-1'), path: '/tickets/sla/policies/sla-1', method: 'DELETE' },
            { name: 'macros list', invoke: () => api.macros.list(), path: '/macros' },
            { name: 'macros create', invoke: () => api.macros.create({ name: 'Hello' }), path: '/macros', method: 'POST', body: { name: 'Hello' } },
            { name: 'macros update', invoke: () => api.macros.update('macro-1', { name: 'Hi' }), path: '/macros/macro-1', method: 'PATCH', body: { name: 'Hi' } },
            { name: 'macros delete', invoke: () => api.macros.delete('macro-1'), path: '/macros/macro-1', method: 'DELETE' },
            { name: 'email logs', invoke: () => api.email.logs(2, 10, 'FAILED'), path: '/email/admin/logs?page=2&limit=10&status=FAILED' },
            { name: 'email templates', invoke: () => api.email.templates(), path: '/email/admin/templates' },
            { name: 'email source', invoke: () => api.email.getTemplateSource('welcome'), path: '/email/admin/templates/welcome/source' },
            { name: 'email save', invoke: () => api.email.saveTemplate('welcome', '<mjml />'), path: '/email/admin/templates/welcome/save', method: 'POST', body: { content: '<mjml />' } },
            { name: 'email preview', invoke: () => api.email.previewTemplate('welcome', { name: 'Ada' }), path: '/email/admin/templates/welcome/preview', method: 'POST', body: { name: 'Ada' } },
            { name: 'email provider', invoke: () => api.email.verifyProvider(), path: '/email/admin/provider/verify', method: 'POST' },
            { name: 'email imap', invoke: () => api.email.verifyImap(), path: '/email/admin/imap/verify', method: 'POST' },
            { name: 'email gmail', invoke: () => api.email.getGmailAuthUrl(), path: '/email/gmail/auth-url' },
        ]);
    });

    it('keeps production settings reads fail-closed without requesting plaintext values', async () => {
        await api.settings.list();
        await api.settings.get('AI_PROVIDER');
        await (api.settings.list as unknown as (legacyDecrypt?: boolean) => Promise<unknown>)(true);
        await (api.settings.get as unknown as (key: string, legacyDecrypt?: boolean) => Promise<unknown>)('AI_PROVIDER', true);

        expect(api.settings.list.toString()).not.toContain('decrypt');
        expect(api.settings.get.toString()).not.toContain('decrypt');

        expect(fetchMock).toHaveBeenCalledTimes(4);
        for (const [url] of fetchMock.mock.calls as [string, RequestInit][]) {
            const parsedUrl = new URL(url, 'http://local.invalid');
            expect(parsedUrl.pathname).toMatch(/^\/api\/v1\/settings(?:\/AI_PROVIDER)?$/);
            expect(parsedUrl.searchParams.has('decrypt')).toBe(false);
        }
    });

    it('keeps announcements, CRM, preferences, and proactive chat routes stable', async () => {
        await verifyCases([
            { name: 'announcements list', invoke: () => api.announcements.list(), path: '/announcements' },
            { name: 'announcement filters', invoke: () => api.announcements.getFilters(), path: '/announcements/filters' },
            { name: 'announcement get', invoke: () => api.announcements.get('announcement-1'), path: '/announcements/announcement-1' },
            { name: 'announcement create', invoke: () => api.announcements.create({ title: 'News' }), path: '/announcements', method: 'POST', body: { title: 'News' } },
            { name: 'announcement update', invoke: () => api.announcements.update('announcement-1', { title: 'Updated' }), path: '/announcements/announcement-1', method: 'PATCH', body: { title: 'Updated' } },
            { name: 'announcement delete', invoke: () => api.announcements.delete('announcement-1'), path: '/announcements/announcement-1', method: 'DELETE' },
            { name: 'announcement target', invoke: () => api.announcements.getTargetCount({ industries: ['AEC'] }), path: '/announcements/target-count', method: 'POST', body: { industries: ['AEC'] } },
            { name: 'announcement broadcast', invoke: () => api.announcements.broadcast('announcement-1'), path: '/announcements/announcement-1/broadcast', method: 'POST' },
            { name: 'my announcements', invoke: () => api.announcements.getMyAnnouncements(3, 15), path: '/announcements/my?page=3&limit=15' },
            { name: 'unread announcements', invoke: () => api.announcements.getUnreadCount(), path: '/announcements/my/unread-count' },
            { name: 'read announcement', invoke: () => api.announcements.markLogRead('log-1'), path: '/announcements/logs/log-1/read', method: 'PATCH' },
            { name: 'templates list', invoke: () => api.announcementTemplates.list(), path: '/announcement-templates' },
            { name: 'templates get', invoke: () => api.announcementTemplates.get('template-1'), path: '/announcement-templates/template-1' },
            { name: 'templates create', invoke: () => api.announcementTemplates.create({ name: 'Alert' }), path: '/announcement-templates', method: 'POST', body: { name: 'Alert' } },
            { name: 'templates update', invoke: () => api.announcementTemplates.update('template-1', { name: 'Notice' }), path: '/announcement-templates/template-1', method: 'PATCH', body: { name: 'Notice' } },
            { name: 'templates delete', invoke: () => api.announcementTemplates.delete('template-1'), path: '/announcement-templates/template-1', method: 'DELETE' },
            { name: 'preferences get', invoke: () => api.preferences.getEmail(), path: '/preferences/email' },
            { name: 'preferences update', invoke: () => api.preferences.updateEmail('TICKET_REPLY', false), path: '/preferences/email', method: 'PATCH', body: { emailType: 'TICKET_REPLY', enabled: false } },
            { name: 'email verify', invoke: () => api.emailValidator.verify('a+b@example.com'), path: '/email-validator/verify?email=a%2Bb%40example.com' },
            { name: 'email bulk', invoke: () => api.emailValidator.verifyBulk(['a@example.com']), path: '/email-validator/verify-bulk', method: 'POST', body: { emails: ['a@example.com'] } },
            { name: 'CRM connections', invoke: () => api.crm.getConnections(), path: '/crm/connections' },
            { name: 'CRM upsert', invoke: () => api.crm.upsertConnection({ provider: 'DYNAMICS_365', tenantId: 'tenant', clientId: 'client', clientSecret: 'secret', instanceUrl: 'https://crm.example.com' }), path: '/crm/connections', method: 'POST', body: { provider: 'DYNAMICS_365', tenantId: 'tenant', clientId: 'client', clientSecret: 'secret', instanceUrl: 'https://crm.example.com' } },
            { name: 'CRM sync', invoke: () => api.crm.triggerSync('connection-1'), path: '/crm/sync/connection-1', method: 'POST' },
            { name: 'CRM delta', invoke: () => api.crm.triggerDeltaSync('connection-1'), path: '/crm/delta-sync/connection-1', method: 'POST' },
            { name: 'CRM discovery', invoke: () => api.crm.getDiscoveryData('connection-1'), path: '/crm/discovery/connection-1' },
            { name: 'CRM logs', invoke: () => api.crm.getLogs('connection-1'), path: '/crm/logs/connection-1' },
            { name: 'CRM changes', invoke: () => api.crm.getChanges('connection-1', 25), path: '/crm/changes?connectionId=connection-1&limit=25' },
            { name: 'CRM accounts', invoke: () => api.crm.getAccounts(), path: '/crm/accounts' },
            { name: 'CRM account', invoke: () => api.crm.getAccount('account-1'), path: '/crm/accounts/account-1' },
            { name: 'CRM account delete', invoke: () => api.crm.bulkDeleteAccounts(['account-1']), path: '/crm/accounts/bulk-delete', method: 'POST', body: { ids: ['account-1'] } },
            { name: 'CRM fields', invoke: () => api.crm.getFieldDefinitions(), path: '/crm/fields-definitions' },
            { name: 'chat create', invoke: () => api.proactiveChat.createSession('customer-1'), path: '/proactive-chat/sessions', method: 'POST', body: { customerId: 'customer-1' } },
            { name: 'chat accept', invoke: () => api.proactiveChat.acceptSession('session-1'), path: '/proactive-chat/sessions/session-1/accept', method: 'PATCH' },
            { name: 'chat decline', invoke: () => api.proactiveChat.declineSession('session-1'), path: '/proactive-chat/sessions/session-1/decline', method: 'PATCH' },
            { name: 'chat end', invoke: () => api.proactiveChat.endSession('session-1'), path: '/proactive-chat/sessions/session-1/end', method: 'PATCH' },
            { name: 'chat message', invoke: () => api.proactiveChat.sendMessage('session-1', 'Hello'), path: '/proactive-chat/sessions/session-1/messages', method: 'POST', body: { content: 'Hello' } },
            { name: 'chat messages', invoke: () => api.proactiveChat.getMessages('session-1'), path: '/proactive-chat/sessions/session-1/messages' },
            { name: 'chat convert', invoke: () => api.proactiveChat.convertToTicket('session-1'), path: '/proactive-chat/sessions/session-1/convert', method: 'POST' },
            { name: 'chat sessions', invoke: () => api.proactiveChat.listSessions(), path: '/proactive-chat/sessions' },
            { name: 'generic delete', invoke: () => api.delete('/custom/1'), path: '/custom/1', method: 'DELETE' },
            { name: 'generic patch', invoke: () => api.patch('/custom/1', { active: true }), path: '/custom/1', method: 'PATCH', body: { active: true } },
        ]);
    });

    it('preserves binary upload and download behavior', async () => {
        const file = new File(['data'], 'sample.txt', { type: 'text/plain' });

        await api.pool.upload('sample', file);
        expect(fetchMock.mock.calls[0][0]).toContain('/knowledge-pool/sources/upload');
        expect(fetchMock.mock.calls[0][1]).toEqual(expect.objectContaining({ method: 'POST', body: expect.any(FormData) }));

        fetchMock.mockClear();
        await api.attachments.upload('message-1', file);
        expect(fetchMock.mock.calls[0][0]).toContain('/attachments/upload/message-1');
        expect(fetchMock.mock.calls[0][1]).toEqual(expect.objectContaining({ method: 'POST', body: expect.any(FormData) }));

        fetchMock.mockClear();
        await api.branding.uploadLogo(file);
        expect(fetchMock.mock.calls[0][0]).toContain('/branding/upload-logo');
        expect(fetchMock.mock.calls[0][1]).toEqual(expect.objectContaining({ method: 'POST', body: expect.any(FormData) }));

        fetchMock.mockClear();
        await api.customers.downloadHotinfo('customer-1');
        expect(fetchMock.mock.calls[0][0]).toContain('/customers/customer-1/hotinfo/download');
        expect(fetchMock.mock.calls[0][1]).toEqual(expect.objectContaining({ method: 'GET' }));

        expect(api.attachments.getDownloadUrl('attachment-1')).toContain('/attachments/attachment-1/download');
    });

    it('does not report logout success when backend session revocation fails', async () => {
        fetchMock
            .mockRejectedValueOnce(new Error('Backend unavailable'))
            .mockResolvedValueOnce(jsonResponse());

        await expect(api.auth.logout()).rejects.toMatchObject({ code: 'BACKEND_UNAVAILABLE' });
        expect(fetchMock).toHaveBeenCalledTimes(2);
        expect(fetchMock.mock.calls[1][0]).toBe('/api/auth/clear-session');
    });

    it('falls back to refresh-authenticated logout when access has expired', async () => {
        fetchMock
            .mockResolvedValueOnce(jsonResponse({}, 401))
            .mockResolvedValueOnce(jsonResponse({ success: true }))
            .mockResolvedValueOnce(jsonResponse());

        await expect(api.auth.logout()).resolves.toEqual({ success: true });

        expect(fetchMock).toHaveBeenCalledTimes(3);
        expect(fetchMock.mock.calls[0][0]).toContain('/auth/logout');
        expect(fetchMock.mock.calls[1][0]).toContain('/auth/refresh/logout');
        expect(fetchMock.mock.calls[2][0]).toBe('/api/auth/clear-session');
    });
});
