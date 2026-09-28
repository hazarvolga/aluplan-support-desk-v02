import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Response } from 'express';
import { AttachmentsController } from '../attachments.controller';
import { AttachmentsService } from '../attachments.service';
import { PrismaService } from '../../prisma/prisma.service';
import { TicketAccessService } from '../../common/services/ticket-access.service';
import { StorageService } from '../../common/services/storage.service';
import { HotinfoParserService } from '../../customers/hotinfo-parser.service';
import { RbacGuard } from '../../rbac/rbac.guard';
import httpRequest from 'supertest';

const fixedPort = process.env.ALUPLAN_HTTP_TEST_FIXED_PORT;
if (fixedPort !== undefined && fixedPort !== '52984') throw new Error('Invalid ALUPLAN_HTTP_TEST_FIXED_PORT');
const testPort = fixedPort === '52984' ? 52984 : 0;

describe('AttachmentsController download authorization', () => {
    let controller: AttachmentsController;
    let module: TestingModule;
    const attachmentId = '11111111-1111-4111-8111-111111111111';
    const ticketId = '22222222-2222-4222-8222-222222222222';
    const ownerId = '33333333-3333-4333-8333-333333333333';
    const prisma = {
        attachment: { findUnique: jest.fn() },
        ticket: { findFirst: jest.fn() },
    };
    const storage = { getDownloadUrl: jest.fn() };
    const redirect = jest.fn();
    const response = { redirect } as unknown as Response;
    const attachment = {
        id: attachmentId,
        url: 'tickets/internal-document.pdf',
        message: { ticketId, isInternal: false },
    };

    beforeEach(async () => {
        jest.resetAllMocks();
        prisma.attachment.findUnique.mockResolvedValue(attachment);
        prisma.ticket.findFirst.mockResolvedValue({ userId: ownerId });
        storage.getDownloadUrl.mockResolvedValue('https://storage.example/signed-file');
        module = await Test.createTestingModule({
            controllers: [AttachmentsController],
            providers: [
                AttachmentsService,
                TicketAccessService,
                { provide: PrismaService, useValue: prisma },
                { provide: EventEmitter2, useValue: { emit: jest.fn() } },
                { provide: StorageService, useValue: storage },
                { provide: HotinfoParserService, useValue: {} },
            ],
        }).overrideGuard(RbacGuard).useValue({ canActivate: () => true }).compile();
        controller = module.get(AttachmentsController);
    });

    const request = (role: string | { name: string }, id = ownerId) => ({ user: { id, role } });
    const expectNoDownload = () => {
        expect(storage.getDownloadUrl).not.toHaveBeenCalled();
        expect(redirect).not.toHaveBeenCalled();
    };

    it.each(['CUSTOMER', 'VIEWER', { name: ' customer ' }, { name: 'viewer' }])(
        'denies own internal-message attachment for %j before signing or redirecting', async (role) => {
            prisma.attachment.findUnique.mockResolvedValue({
                ...attachment, message: { ticketId, isInternal: true },
            });
            await expect(controller.download(attachmentId, request(role), response)).rejects.toThrow(ForbiddenException);
            expectNoDownload();
        },
    );

    it.each(['CUSTOMER', 'VIEWER'])('allows own public-message attachment for %s', async (role) => {
        await controller.download(attachmentId, request(role), response);
        expect(storage.getDownloadUrl).toHaveBeenCalledWith(attachment.url);
        expect(redirect).toHaveBeenCalledWith('https://storage.example/signed-file');
    });

    it.each(['ADMIN', 'AGENT', 'SUPPORT_AGENT', { name: 'support-manager' }])(
        'allows internal-message attachment for authorized staff %j', async (role) => {
            prisma.attachment.findUnique.mockResolvedValue({
                ...attachment, message: { ticketId, isInternal: true },
            });
            await controller.download(attachmentId, request(role), response);
            expect(storage.getDownloadUrl).toHaveBeenCalledWith(attachment.url);
        },
    );

    it.each(['CUSTOMER', 'VIEWER'])('denies another customer ticket for %s', async (role) => {
        await expect(controller.download(attachmentId, request(role, 'other-user'), response)).rejects.toThrow(ForbiddenException);
        expectNoDownload();
    });

    it('denies deleted tickets even for staff', async () => {
        prisma.ticket.findFirst.mockResolvedValue(null);
        await expect(controller.download(attachmentId, request('ADMIN'), response)).rejects.toThrow(ForbiddenException);
        expectNoDownload();
    });

    it('denies unknown roles even when the requester owns the ticket', async () => {
        await expect(controller.download(attachmentId, request('UNRECOGNIZED'), response)).rejects.toThrow(ForbiddenException);
        expectNoDownload();
    });

    it('denies missing requester identity', async () => {
        await expect(controller.download(attachmentId, { user: { role: 'ADMIN' } }, response)).rejects.toThrow(ForbiddenException);
        expectNoDownload();
    });

    it('rejects missing attachment without signing or redirecting', async () => {
        prisma.attachment.findUnique.mockResolvedValue(null);
        await expect(controller.download(attachmentId, request('ADMIN'), response)).rejects.toThrow(NotFoundException);
        expectNoDownload();
    });

    it('rejects missing message context without signing or redirecting', async () => {
        prisma.attachment.findUnique.mockResolvedValue({ ...attachment, message: null });
        await expect(controller.download(attachmentId, request('ADMIN'), response)).rejects.toThrow(ForbiddenException);
        expectNoDownload();
    });

    it('rejects malformed download IDs at the HTTP boundary before any database or storage call', async () => {
        const app = module.createNestApplication();
        app.use((req, _res, next) => { req.user = request('ADMIN').user; next(); });
        try {
            await app.listen(testPort, '127.0.0.1');
            const address = app.getHttpServer().address();
            expect(address).toMatchObject({ address: '127.0.0.1', port: expect.any(Number) });
            expect(address.port).toBeGreaterThan(0);
            if (testPort) expect(address.port).toBe(testPort);
            await httpRequest(app.getHttpServer()).get('/attachments/not-a-uuid/download').expect(400);
            expect(prisma.attachment.findUnique).not.toHaveBeenCalled();
            expectNoDownload();
        } finally {
            await app.close();
        }
    });

    it('returns HTTP 403 for an internal attachment without a redirect Location', async () => {
        prisma.attachment.findUnique.mockResolvedValue({
            ...attachment, message: { ticketId, isInternal: true },
        });
        const app = module.createNestApplication();
        app.use((req, _res, next) => { req.user = request('CUSTOMER').user; next(); });
        try {
            await app.listen(testPort, '127.0.0.1');
            const address = app.getHttpServer().address();
            expect(address).toMatchObject({ address: '127.0.0.1', port: expect.any(Number) });
            expect(address.port).toBeGreaterThan(0);
            if (testPort) expect(address.port).toBe(testPort);
            const result = await httpRequest(app.getHttpServer()).get(`/attachments/${attachmentId}/download`).expect(403);
            expect(result.headers.location).toBeUndefined();
            expectNoDownload();
        } finally {
            await app.close();
        }
    });
});
