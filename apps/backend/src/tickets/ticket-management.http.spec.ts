import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { TicketsController } from './tickets.controller';
import { TicketsService } from './tickets.service';
import { MaintenanceWorkService } from '../common/services/maintenance-work.service';
import { TicketAccessService } from '../common/services/ticket-access.service';
import { RbacGuard } from '../rbac/rbac.guard';
import { NotificationsGateway } from '../notifications/notifications.gateway';

// Real controller, RBAC and services; synthetic authenticated principals and storage.
// JWT/cookie/CSRF validation is covered separately, not claimed by this suite.
describe('Ticket management HTTP authorization', () => {
    let app: INestApplication;
    let update: jest.Mock;
    let messages: jest.Mock;
    const principals = {
        customer: { sub: 'customer-a', role: 'CUSTOMER', permissions: ['ticket:update', 'ticket:read'] },
        staff: { sub: 'staff', role: 'SUPPORT_AGENT', permissions: ['ticket:update', 'ticket:close'] },
        admin: { sub: 'admin', role: 'ADMIN', permissions: ['*'] },
        revoked: { sub: 'staff', role: 'SUPPORT_AGENT', permissions: [] },
    };

    beforeEach(async () => {
        jest.clearAllMocks();
        const rows = [
            { id: 'own', userId: 'customer-a', status: 'OPEN', ticketNumber: 'SYN-1' },
            { id: 'other', userId: 'customer-b', status: 'OPEN', ticketNumber: 'SYN-2' },
        ];
        update = jest.fn(async ({ where, data }) => ({ ...rows.find(row => row.id === where.id), ...data }));
        messages = jest.fn(async () => ({ count: 2 }));
        const prisma = {
            ticket: {
                findFirst: jest.fn(async ({ where }) => rows.find(row => row.id === where.id) ?? null),
                findUnique: jest.fn(async ({ where }) => rows.find(row => row.id === where.id) ?? null),
                findMany: jest.fn(async ({ where }) => rows.filter(row => !where?.id?.in || where.id.in.includes(row.id))),
                count: jest.fn(async ({ where }) => rows.filter(row => where.id.in.includes(row.id)
                    && (!where.userId || row.userId === where.userId)).length),
                updateMany: update,
                update,
            },
            ticketMessage: { createMany: messages },
            $transaction: jest.fn(async (cb: any) => typeof cb === 'function' ? cb(prisma) : Promise.all(cb)),
        };
        const service = new TicketsService(prisma as any, {} as any, {} as any, { emit: jest.fn() } as any,
            {} as any, {} as any, new TicketAccessService(prisma as any), new MaintenanceWorkService());
        const module = await Test.createTestingModule({
            controllers: [TicketsController],
            providers: [RbacGuard, { provide: TicketsService, useValue: service },
                { provide: NotificationsGateway, useValue: { emitTicketUpdated: jest.fn(), emitBulkUpdate: jest.fn() } }],
        }).compile();
        app = module.createNestApplication({ logger: false });
        app.use((req: any, _res: any, next: () => void) => {
            req.user = principals[req.headers['x-test-principal'] as keyof typeof principals];
            next();
        });
        await app.init();
    });

    afterEach(async () => { await app?.close(); });

    it('preserves the customer close/review button on their own ticket', async () => {
        await request(app.getHttpServer()).patch('/tickets/own/status/PENDING_CUSTOMER_REVIEW')
            .set('x-test-principal', 'customer').expect(200);
        expect(update).toHaveBeenCalledTimes(1);
    });

    it.each([
        ['patch', '/tickets/other/status/PENDING_CUSTOMER_REVIEW'],
        ['patch', '/tickets/own/status/RESOLVED'],
        ['patch', '/tickets/other/status/RESOLVED'],
        ['post', '/tickets/own/link/other'],
        ['post', '/tickets/other/link/own'],
        ['patch', '/tickets/other/close'],
    ])('rejects customer %s %s without writes', async (method, path) => {
        const client = request(app.getHttpServer());
        const call = method === 'post' ? client.post(path) : client.patch(path);
        await call.set('x-test-principal', 'customer').expect(403);
        expect(update).not.toHaveBeenCalled();
        expect(messages).not.toHaveBeenCalled();
    });

    it.each(['staff', 'admin'])('preserves %s status and merge API operations', async actor => {
        await request(app.getHttpServer()).patch('/tickets/other/status/RESOLVED').set('x-test-principal', actor).expect(200);
        await request(app.getHttpServer()).post('/tickets/own/link/other').set('x-test-principal', actor).expect(201);
        expect(update).toHaveBeenCalledTimes(2);
        expect(messages).toHaveBeenCalledTimes(1);
    });

    it('does not bypass missing permissions for a staff role', async () => {
        await request(app.getHttpServer()).patch('/tickets/own/status/RESOLVED').set('x-test-principal', 'revoked').expect(403);
        expect(update).not.toHaveBeenCalled();
    });

    it('rejects customer bulk status changes even on owned tickets', async () => {
        await request(app.getHttpServer()).patch('/tickets/bulk').set('x-test-principal', 'customer')
            .send({ ticketIds: ['own'], status: 'RESOLVED' }).expect(403);
        expect(update).not.toHaveBeenCalled();
    });

    it('preserves staff bulk updates while rejecting a mixed missing target batch', async () => {
        await request(app.getHttpServer()).patch('/tickets/bulk').set('x-test-principal', 'staff')
            .send({ ticketIds: ['own', 'missing'], status: 'RESOLVED' }).expect(403);
        expect(update).not.toHaveBeenCalled();
        await request(app.getHttpServer()).patch('/tickets/bulk').set('x-test-principal', 'staff')
            .send({ ticketIds: ['own', 'other'], status: 'RESOLVED' }).expect(200);
        expect(update).toHaveBeenCalledTimes(2);
    });

    it.each(['status', 'priority', 'assignedTo', 'slaPolicyId', 'teamId', 'departmentId', 'tags'])(
        'rejects customer generic update on restricted field %s via HTTP', async (field) => {
            const payload = {
                [field]: field === 'priority' ? 'URGENT' : field === 'tags' ? ['vip'] : 'custom-value',
            };
            await request(app.getHttpServer()).patch('/tickets/own')
                .set('x-test-principal', 'customer')
                .send(payload)
                .expect(403);
            expect(update).not.toHaveBeenCalled();
        },
    );

    it.each(['slaPolicyId', 'teamId', 'departmentId'])(
        'rejects staff generic update on unsupported field %s with 400', async (field) => {
            const payload = { [field]: 'unsupported-value' };
            await request(app.getHttpServer()).patch('/tickets/own')
                .set('x-test-principal', 'staff')
                .send(payload)
                .expect(400);
            expect(update).not.toHaveBeenCalled();
        },
    );

    it('allows customer generic update on subject and description via HTTP', async () => {
        await request(app.getHttpServer()).patch('/tickets/own')
            .set('x-test-principal', 'customer')
            .send({ subject: 'Updated title', description: 'Updated description' })
            .expect(200);
        expect(update).toHaveBeenCalledTimes(1);
    });
});
