import { http, HttpResponse } from 'msw';

export const handlers = [
    // Authentication Mocks
    http.post('*/api/v1/auth/login', () => {
        return HttpResponse.json({
            accessToken: 'test-token',
            user: { id: 'user-1', email: 'test@aluplan.com', role: 'ADMIN' },
        });
    }),

    // Tickets Mocks
    http.get('*/api/v1/tickets', () => {
        return HttpResponse.json([
            { id: 'ticket-1', title: 'Test Ticket', status: 'OPEN', priority: 'HIGH' },
        ]);
    }),
];
