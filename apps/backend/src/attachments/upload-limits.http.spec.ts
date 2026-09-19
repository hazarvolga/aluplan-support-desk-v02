import 'reflect-metadata';
import { request } from 'node:http';
import { once } from 'node:events';
import { INestApplication, ExecutionContext, ServiceUnavailableException } from '@nestjs/common';
import { Test } from '@nestjs/testing';

jest.mock('./attachments.service', () => ({ AttachmentsService: class {} }));
jest.mock('../common/services/storage.service', () => ({ StorageService: class {} }));
jest.mock('../customers/hotinfo-parser.service', () => ({ HotinfoParserService: class {} }));
jest.mock('../rbac/rbac.guard', () => ({ RbacGuard: class {} }));
jest.mock('../auth/guards/jwt-auth.guard', () => ({ JwtAuthGuard: class {} }));
jest.mock('../knowledge-pool/knowledge-pool.service', () => ({ KnowledgePoolService: class {} }));
jest.mock('../prisma/prisma.service', () => ({ PrismaService: class {} }));
jest.mock('../knowledge-pool/learnnow-crawler.service', () => ({ LearnNowCrawlerService: class {} }));
jest.mock('../knowledge-pool/generic-web-crawler.service', () => ({ GenericWebCrawlerService: class {} }));
jest.mock('../knowledge-pool/allplan-help-crawler.service', () => ({ AllplanHelpCrawlerService: class {} }));
jest.mock('@aluplan/database', () => ({ KnowledgeSourceType: { FILE_TXT: 'FILE_TXT' } }));

import { ConfigService } from '@nestjs/config';
import { AttachmentsController } from './attachments.controller';
import { AttachmentsService } from './attachments.service';
import { StorageService } from '../common/services/storage.service';
import { HotinfoParserService } from '../customers/hotinfo-parser.service';
import { BrandingController } from '../branding/branding.controller';
import { KnowledgePoolController } from '../knowledge-pool/knowledge-pool.controller';
import { KnowledgePoolService } from '../knowledge-pool/knowledge-pool.service';
import { PrismaService } from '../prisma/prisma.service';
import { LearnNowCrawlerService } from '../knowledge-pool/learnnow-crawler.service';
import { GenericWebCrawlerService } from '../knowledge-pool/generic-web-crawler.service';
import { AllplanHelpCrawlerService } from '../knowledge-pool/allplan-help-crawler.service';
import { RbacGuard } from '../rbac/rbac.guard';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

const boundary = 'http-upload-regression';
const fixedPort = process.env.ALUPLAN_HTTP_TEST_FIXED_PORT;
if (fixedPort !== undefined && fixedPort !== '52984') throw new Error('Invalid ALUPLAN_HTTP_TEST_FIXED_PORT');
const testPort = fixedPort === '52984' ? 52984 : 0;
let listeningPort = 0;
const png = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+aVRsAAAAASUVORK5CYII=', 'base64');
const routes = [
    { path: '/attachments/upload/11111111-1111-4111-8111-111111111111', max: 25 * 1024 * 1024, fields: 0 },
    { path: '/branding/upload-logo', max: 5 * 1024 * 1024, fields: 0 },
    { path: '/knowledge-pool/sources/upload', max: 50 * 1024 * 1024, fields: 1 },
];

async function upload(path: string, bytes: number, fields: string[] = [], allowed = true, extraFile = false) {
    if (listeningPort <= 0) throw new Error('Upload test server is not listening');
    const client = request({
        hostname: '127.0.0.1', port: listeningPort, path, method: 'POST', agent: false,
        headers: {
            'content-type': `multipart/form-data; boundary=${boundary}`,
            'x-test-allowed': allowed ? 'yes' : 'no',
        },
    });
    const response = new Promise<{ status: number; body: string }>((resolve, reject) => {
        client.on('error', reject);
        client.on('response', (res) => {
            const chunks: Buffer[] = [];
            res.on('data', (chunk: Buffer) => chunks.push(chunk));
            res.on('error', reject);
            res.on('end', () => resolve({ status: res.statusCode!, body: Buffer.concat(chunks).toString() }));
        });
    });
    client.setTimeout(10000, () => client.destroy(new Error('Upload fixture timed out')));
    async function write(chunk: Buffer | string) {
        if (!client.write(chunk)) await once(client, 'drain');
    }
    try {
        for (const name of fields) await write(`--${boundary}\r\nContent-Disposition: form-data; name="${name}"\r\n\r\nTest document\r\n`);
        for (let index = 0; index < (extraFile ? 2 : 1); index++) {
            const metadata = path.includes('knowledge-pool') ? ['fixture.txt', 'text/plain'] : ['fixture.png', 'image/png'];
            await write(`--${boundary}\r\nContent-Disposition: form-data; name="file"; filename="${metadata[0]}"\r\nContent-Type: ${metadata[1]}\r\n\r\n`);
            await write(png.subarray(0, Math.min(bytes, png.length)));
            for (let remaining = bytes - png.length; remaining > 0; remaining -= 65536) {
                await write(Buffer.alloc(Math.min(remaining, 65536), 97));
            }
            await write('\r\n');
        }
        client.end(`--${boundary}--\r\n`);
        return await response;
    } finally {
        client.destroy();
    }
}

describe('real HTTP upload boundary (isolated loopback test app)', () => {
    let app: INestApplication;
    const storage = {
        uploadFile: jest.fn(async () => 'brand/logos/fixture.png'),
        getFile: jest.fn(async () => png),
    };
    const attachments = { assertCanCreateForMessage: jest.fn(), create: jest.fn(async () => ({ id: 'attachment-fixture' })) };
    const knowledge = { createFileSource: jest.fn(async () => ({ id: 'knowledge-fixture' })) };

    beforeAll(async () => {
        // Tests routing/guard ordering, NOT real JWT/RBAC authorization policy.
        const testGuard = { canActivate: (context: ExecutionContext) => context.switchToHttp().getRequest().headers['x-test-allowed'] === 'yes' };
        const module = await Test.createTestingModule({
            controllers: [AttachmentsController, BrandingController, KnowledgePoolController],
            providers: [
                { provide: StorageService, useValue: storage },
                { provide: AttachmentsService, useValue: attachments },
                { provide: HotinfoParserService, useValue: {} },
                { provide: ConfigService, useValue: { get: () => undefined } },
                { provide: KnowledgePoolService, useValue: knowledge },
                { provide: PrismaService, useValue: { knowledgeSource: { findFirst: async () => null, update: async () => ({}) } } },
                ...[LearnNowCrawlerService, GenericWebCrawlerService, AllplanHelpCrawlerService].map((provide) => ({ provide, useValue: {} })),
            ],
        }).overrideGuard(RbacGuard).useValue(testGuard).overrideGuard(JwtAuthGuard).useValue(testGuard).compile();
        app = module.createNestApplication({ logger: false });
        try {
            await app.listen(testPort, '127.0.0.1');
            const address = app.getHttpServer().address();
            expect(address).toMatchObject({ address: '127.0.0.1', port: expect.any(Number) });
            expect(address.port).toBeGreaterThan(0);
            if (testPort) expect(address.port).toBe(testPort);
            listeningPort = address.port;
        } catch (error) {
            await app.close();
            throw error;
        }
    });
    beforeEach(() => jest.clearAllMocks());
    afterAll(async () => {
        listeningPort = 0;
        if (app) await app.close();
    });

    describe.each(routes)('$path', ({ path, max, fields }) => {
        it('returns 413 for a chunked file above the ceiling without storage writes', async () => {
            const result = await upload(path, max + 1);
            expect(result.status).toBe(413);
            expect(storage.uploadFile).not.toHaveBeenCalled();
            expect(attachments.create).not.toHaveBeenCalled();
            expect(knowledge.createFileSource).not.toHaveBeenCalled();
        });
        it('returns 400 for extra text fields without storage writes', async () => {
            const result = await upload(path, png.length, Array.from({ length: fields + 1 }, (_, i) => `field${i}`));
            expect(result.status).toBe(400);
            expect(storage.uploadFile).not.toHaveBeenCalled();
        });
        it('returns 400 for a second file without storage writes', async () => {
            const result = await upload(path, png.length, [], true, true);
            expect(result.status).toBe(400);
            expect(storage.uploadFile).not.toHaveBeenCalled();
        });
        it('returns 403 when the test guard denies access without storage writes', async () => {
            const result = await upload(path, png.length, [], false);
            expect(result.status).toBe(403);
            expect(storage.uploadFile).not.toHaveBeenCalled();
        });
    });

    it.each(routes)('preserves successful frontend-shaped uploads at $path', async ({ path, fields }) => {
        const result = await upload(path, png.length, fields ? ['name'] : []);
        expect({ status: result.status, body: result.status === 201 ? 'success' : result.body }).toEqual({ status: 201, body: 'success' });
        expect(storage.uploadFile).toHaveBeenCalledTimes(1);
        if (fields) expect(knowledge.createFileSource).toHaveBeenCalledWith('Test document', 'FILE_TXT', expect.objectContaining({ originalname: 'fixture.txt' }));
    });

    it.each(routes)('returns a storage failure without metadata success at $path', async ({ path, fields }) => {
        storage.uploadFile.mockRejectedValueOnce(new ServiceUnavailableException('File storage is temporarily unavailable. Please retry.'));
        const result = await upload(path, png.length, fields ? ['name'] : []);
        expect(result.status).toBe(503);
        expect(JSON.parse(result.body).message).toBe('File storage is temporarily unavailable. Please retry.');
        expect(attachments.create).not.toHaveBeenCalled();
        expect(knowledge.createFileSource).not.toHaveBeenCalled();
    });
});
