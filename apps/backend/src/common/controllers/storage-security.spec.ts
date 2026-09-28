import { ForbiddenException, NotFoundException } from '@nestjs/common';
import * as fs from 'node:fs/promises';
import * as os from 'node:os';
import * as path from 'node:path';
import { StorageController } from './storage.controller';
import { TicketAccessService } from '../services/ticket-access.service';
import { BrandingController } from '../../branding/branding.controller';
import { Test } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../prisma/prisma.service';
import { RedisService } from '../../redis/redis.service';
import { JwtStrategy } from '../../auth/strategies/jwt.strategy';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { JwtService } from '@nestjs/jwt';
import httpRequest from 'supertest';
import { StorageService } from '../services/storage.service';

describe('StorageController private file isolation', () => {
    let root: string;
    let controller: any;
    const key = 'tickets/msg_123/private.txt';
    const prisma = {
        attachment: { findMany: jest.fn() },
        ticket: { findFirst: jest.fn() },
    };
    const response = { set: jest.fn() };
    const testSecret = 'storage-auth-test-only-not-production';

    beforeAll(async () => {
        root = await fs.mkdtemp(path.join(os.tmpdir(), 'aluplan-storage-auth-test-'));
        await fs.mkdir(path.join(root, 'tickets/msg_123'), { recursive: true });
        await fs.mkdir(path.join(root, 'brand/logos'), { recursive: true });
        await fs.writeFile(path.join(root, key), 'private test data');
        await fs.writeFile(path.join(root, 'tickets/msg_123/binary'), 'binary test data');
        await fs.mkdir(path.join(root, 'tickets/msg_123/directory'));
        await fs.writeFile(path.join(root, 'brand/logos/logo.png'), 'public test logo');
        await fs.symlink(path.join(root, key), path.join(root, 'brand/logos/leak.png'));
    });

    afterAll(async () => { await fs.rm(root, { recursive: true, force: true }); });

    beforeEach(() => {
        jest.resetAllMocks();
        prisma.attachment.findMany.mockResolvedValue([{ message: { ticketId: 'ticket-1', isInternal: false } }]);
        prisma.ticket.findFirst.mockResolvedValue({ userId: 'owner-1' });
        const config = { get: (key: string) => key === 'storage.localPath' ? path.relative(process.cwd(), root) : undefined };
        controller = Reflect.construct(StorageController, [config, prisma, new TicketAccessService(prisma as any)]);
    });

    it('denies anonymous direct access to private ticket bytes', async () => {
        await expect(controller.getFile(key, response, {})).rejects.toThrow(ForbiddenException);
        expect(response.set).not.toHaveBeenCalled();
    });

    it.each(['CUSTOMER', 'VIEWER'])('denies own internal attachment bytes to %s', async (role) => {
        prisma.attachment.findMany.mockResolvedValue([{ message: { ticketId: 'ticket-1', isInternal: true } }]);
        await expect(controller.getFile(key, response, { user: { id: 'owner-1', role } })).rejects.toThrow(ForbiddenException);
        expect(response.set).not.toHaveBeenCalled();
    });

    it.each(['CUSTOMER', 'VIEWER', 'ADMIN', 'SUPPORT_AGENT'])('allows authorized public-message bytes to %s', async (role) => {
        const result = await controller.getFile(key.split('/'), response, { user: { id: 'owner-1', role } });
        const chunks = [];
        for await (const chunk of result.getStream()) chunks.push(chunk);
        expect(Buffer.concat(chunks).toString()).toBe('private test data');
    });

    it('denies other customers', async () => {
        await expect(controller.getFile(key, response, { user: { id: 'other', role: 'CUSTOMER' } })).rejects.toThrow(ForbiddenException);
    });

    it('denies deleted tickets', async () => {
        prisma.ticket.findFirst.mockResolvedValue(null);
        await expect(controller.getFile(key, response, { user: { id: 'owner-1', role: 'ADMIN' } })).rejects.toThrow(ForbiddenException);
    });

    it('denies unregistered file keys', async () => {
        prisma.attachment.findMany.mockResolvedValue([]);
        await expect(controller.getFile(key, response, { user: { id: 'owner-1', role: 'ADMIN' } })).rejects.toThrow(NotFoundException);
    });

    it('denies non-ticket private namespaces before querying attachment mappings', async () => {
        await expect(controller.getFile('knowledge-pool/source.pdf', response, { user: { id: 'owner-1', role: 'ADMIN' } })).rejects.toThrow(NotFoundException);
        expect(prisma.attachment.findMany).not.toHaveBeenCalled();
    });

    it('supports object role aliases and forces an unknown file type to download as binary', async () => {
        const result = await controller.getFile('tickets/msg_123/binary', response, { user: { sub: 'owner-1', role: { name: 'support-agent' } } });
        const chunks = [];
        for await (const chunk of result.getStream()) chunks.push(chunk);
        expect(Buffer.concat(chunks).toString()).toBe('binary test data');
        expect(response.set).toHaveBeenCalledWith(expect.objectContaining({
            'Content-Type': 'application/octet-stream',
            'Content-Disposition': 'attachment',
            'Cache-Control': 'private, no-store',
        }));
    });

    it('rejects directories even when a mapping grants ticket access', async () => {
        await expect(controller.getFile('tickets/msg_123/directory', response, { user: { id: 'owner-1', role: 'ADMIN' } })).rejects.toThrow(NotFoundException);
        expect(response.set).not.toHaveBeenCalled();
    });

    it('denies attachments with missing message context', async () => {
        prisma.attachment.findMany.mockResolvedValue([{ message: null }]);
        await expect(controller.getFile(key, response, { user: { id: 'owner-1', role: 'ADMIN' } })).rejects.toThrow(ForbiddenException);
        expect(response.set).not.toHaveBeenCalled();
    });

    it('denies a shared key if any mapped attachment is internal', async () => {
        prisma.attachment.findMany.mockResolvedValue([
            { message: { ticketId: 'ticket-1', isInternal: false } },
            { message: { ticketId: 'ticket-1', isInternal: true } },
        ]);
        await expect(controller.getFile(key, response, { user: { id: 'owner-1', role: { name: 'customer' } } })).rejects.toThrow(ForbiddenException);
        expect(response.set).not.toHaveBeenCalled();
    });

    it.each(['../secret', 'tickets/../secret', 'tickets\\secret', '', 'tickets/%2e%2e/secret'])('rejects noncanonical key %s', async (key) => {
        await expect(controller.getFile(key, response, { user: { id: 'owner-1', role: 'ADMIN' } })).rejects.toThrow(NotFoundException);
    });

    it('serves normal public logos without ticket authorization', async () => {
        const result = await controller.getLogo('logo.png', response);
        const chunks = [];
        for await (const chunk of result.getStream()) chunks.push(chunk);
        expect(Buffer.concat(chunks).toString()).toBe('public test logo');
        expect(prisma.attachment.findMany).not.toHaveBeenCalled();
    });

    it('rejects symlinks from public logos into ticket files', async () => {
        await expect(controller.getLogo('leak.png', response)).rejects.toThrow(NotFoundException);
        expect(response.set).not.toHaveBeenCalled();
    });

    it.each(['logo.png', 'leak.png'])('applies identical local branding boundary to %s', async (filename) => {
        const storage = { isS3: () => false, getFile: jest.fn() };
        const config = { get: () => root };
        const branding = new BrandingController(storage as any, config as any);
        const res = { setHeader: jest.fn(), status: jest.fn().mockReturnThis(), send: jest.fn() } as any;
        await branding.getAsset(`brand/logos/${filename}`, res);
        if (filename === 'logo.png') expect(res.send).toHaveBeenCalledWith(Buffer.from('public test logo'));
        else expect(res.status).toHaveBeenCalledWith(404);
        expect(storage.getFile).not.toHaveBeenCalled();
    });

    it('enforces real JWT guard for private HTTP files while retaining anonymous logos', async () => {
        const config = { get: (key: string) => key === 'JWT_SECRET' ? testSecret : key === 'storage.localPath' ? root : undefined };
        const module = await Test.createTestingModule({
            controllers: [StorageController],
            providers: [
                JwtStrategy, JwtAuthGuard, TicketAccessService,
                { provide: ConfigService, useValue: config },
                { provide: PrismaService, useValue: {
                    ...prisma, user: { findUnique: jest.fn().mockResolvedValue({
                        status: 'ACTIVE', deletedAt: null, sessionVersion: 0,
                        role: { name: 'CUSTOMER', permissions: [{ permission: { name: 'ticket:read' } }] },
                    }) },
                } },
                { provide: RedisService, useValue: { get: jest.fn().mockResolvedValue(null) } },
            ],
        }).compile();
        const app = module.createNestApplication();
        app.useGlobalGuards(module.get(JwtAuthGuard));
        try {
            const fixedPort = process.env.ALUPLAN_HTTP_TEST_FIXED_PORT;
            if (fixedPort !== undefined && fixedPort !== '52984') throw new Error('Invalid ALUPLAN_HTTP_TEST_FIXED_PORT');
            const testPort = fixedPort === '52984' ? 52984 : 0;
            await app.listen(testPort, '127.0.0.1');
            const address = app.getHttpServer().address();
            expect(address).toMatchObject({ address: '127.0.0.1', port: expect.any(Number) });
            expect(address.port).toBeGreaterThan(0);
            if (testPort) expect(address.port).toBe(testPort);
            await httpRequest(app.getHttpServer()).get(`/storage/${key}`).expect(401);
            expect(prisma.attachment.findMany).not.toHaveBeenCalled();
            await httpRequest(app.getHttpServer()).get('/storage/brand/logos/logo.png').expect(200);
            await httpRequest(app.getHttpServer()).get('/storage/brand/logos/leak.png').expect(404);
            const token = new JwtService({ secret: testSecret }).sign({ sub: 'owner-1', role: 'CUSTOMER', sessionVersion: 0 }, { expiresIn: '1h' });
            await httpRequest(app.getHttpServer()).get(`/storage/${key}`).set('Authorization', `Bearer ${token}`).expect(200);
            prisma.attachment.findMany.mockResolvedValue([{ message: { ticketId: 'ticket-1', isInternal: true } }]);
            await httpRequest(app.getHttpServer()).get(`/storage/${key}`).set('Authorization', `Bearer ${token}`).expect(403);
        } finally {
            await app.close();
        }
    });

    it.each(['logo.png', 'leak.png'])('keeps S3 missing-credentials local fallback safe for %s', async (filename) => {
        const config = { get: (key: string) => key === 'storage' ? { type: 'S3', localPath: root } : key === 'storage.localPath' ? root : undefined };
        const storage = new StorageService(config as any, { getValue: jest.fn().mockResolvedValue('') } as any);
        const branding = new BrandingController(storage, config as any);
        const res = { setHeader: jest.fn(), status: jest.fn().mockReturnThis(), send: jest.fn() } as any;
        await branding.getAsset(`brand/logos/${filename}`, res);
        if (filename === 'logo.png') expect(res.send).toHaveBeenCalledWith(Buffer.from('public test logo'));
        else expect(res.status).toHaveBeenCalledWith(404);
    });
});
