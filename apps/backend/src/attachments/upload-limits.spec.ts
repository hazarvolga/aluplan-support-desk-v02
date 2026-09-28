import 'reflect-metadata';
import { Readable } from 'node:stream';
import { ExecutionContext, NestInterceptor, Type } from '@nestjs/common';
import { INTERCEPTORS_METADATA } from '@nestjs/common/constants';
import { of } from 'rxjs';

// Do not load database clients, crawlers or storage providers in parser tests.
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
jest.mock('@aluplan/database', () => ({ KnowledgeSourceType: {} }));

import { AttachmentsController } from './attachments.controller';
import { BrandingController } from '../branding/branding.controller';
import { KnowledgePoolController } from '../knowledge-pool/knowledge-pool.controller';

const boundary = 'upload-regression-boundary';
type Part = { name: string; bytes: number; filename?: string; value?: string };
const file = (bytes: number, name = 'file'): Part => ({ name, bytes, filename: 'fixture.txt' });
const field = (name = 'name', value = 'Test document'): Part => ({ name, bytes: Buffer.byteLength(value), value });
const cases = [
    { name: 'attachments', method: AttachmentsController.prototype.uploadFile, max: 25 * 1024 * 1024, fields: 0 },
    { name: 'branding', method: BrandingController.prototype.uploadLogo, max: 5 * 1024 * 1024, fields: 0 },
    { name: 'knowledge', method: KnowledgePoolController.prototype.uploadKnowledgeFile, max: 50 * 1024 * 1024, fields: 1 },
];

// Real Nest interceptor and its resolved Multer parser over multipart streams.
// No socket, application bootstrap, authentication or HTTP routing is simulated.
async function parse(method: Function, parts: Part[], truncated = false) {
    function* chunks() {
        for (const part of parts) {
            const disposition = `Content-Disposition: form-data; name="${part.name}"`;
            yield Buffer.from(`--${boundary}\r\n${disposition}${part.filename ? `; filename="${part.filename}"\r\nContent-Type: text/plain` : ''}\r\n\r\n`);
            if (part.value !== undefined) yield Buffer.from(part.value);
            else for (let remaining = part.bytes; remaining > 0; remaining -= 65536) {
                yield Buffer.alloc(Math.min(remaining, 65536), 97);
            }
            yield Buffer.from('\r\n');
        }
        if (!truncated) yield Buffer.from(`--${boundary}--\r\n`);
    }
    const request = Object.assign(Readable.from(chunks()), {
        headers: { 'content-type': `multipart/form-data; boundary=${boundary}`, 'transfer-encoding': 'chunked' },
        method: 'POST',
    }) as Readable & { file?: Express.Multer.File; body?: Record<string, unknown> };
    const [Interceptor] = Reflect.getMetadata(INTERCEPTORS_METADATA, method) as Type<NestInterceptor>[];
    const next = { handle: jest.fn(() => of('accepted')) };
    const context = { switchToHttp: () => ({ getRequest: () => request, getResponse: () => ({}) }) } as unknown as ExecutionContext;
    try {
        await new Interceptor().intercept(context, next);
        return { request, next, error: undefined };
    } catch (error) {
        return { request, next, error };
    } finally {
        request.destroy();
    }
}

describe.each(cases)('$name early multipart limits', ({ method, max, fields }) => {
    it('preserves the existing frontend file and optional name payload', async () => {
        const result = await parse(method, [file(32), ...(fields ? [field('name', 'Türkçe destek 📎')] : [])]);
        expect(result.error).toBeUndefined();
        expect(result.next.handle).toHaveBeenCalledTimes(1);
        expect(result.request.file?.buffer).toEqual(Buffer.alloc(32, 97));
        if (fields) expect(result.request.body?.name).toBe('Türkçe destek 📎');
    });

    it('accepts a file one byte below the existing ceiling', async () => {
        const result = await parse(method, [file(max - 1)]);
        expect(result.error).toBeUndefined();
        expect(result.request.file?.size).toBe(max - 1);
    });

    it('rejects a streamed file above the ceiling before downstream execution', async () => {
        const result = await parse(method, [file(max + 1)]);
        expect(result.error).toMatchObject({ status: 413 });
        expect(result.next.handle).not.toHaveBeenCalled();
        expect(result.request.file).toBeUndefined();
    });

    it('rejects extra text fields before downstream execution', async () => {
        const result = await parse(method, [...Array.from({ length: fields + 1 }, (_, i) => field(`field${i}`)), file(1)]);
        expect(result.error).toMatchObject({ status: 400 });
        expect(result.next.handle).not.toHaveBeenCalled();
    });

    it('rejects a second file before downstream execution', async () => {
        const result = await parse(method, [file(1), file(1)]);
        expect(result.error).toMatchObject({ status: 400 });
        expect(result.next.handle).not.toHaveBeenCalled();
    });

    it('rejects an unexpected file field', async () => {
        const result = await parse(method, [file(1, 'other')]);
        expect(result.error).toMatchObject({ status: 400 });
        expect(result.next.handle).not.toHaveBeenCalled();
    });

    it('rejects a truncated multipart body without continuing', async () => {
        const result = await parse(method, [file(8)], true);
        expect(result.error).toBeDefined();
        expect(result.next.handle).not.toHaveBeenCalled();
    });
});

describe('knowledge multipart text bounds', () => {
    it('rejects oversized text fields', async () => {
        const result = await parse(KnowledgePoolController.prototype.uploadKnowledgeFile, [field('name', 'x'.repeat(1024 * 1024 + 1))]);
        expect(result.error).toMatchObject({ status: 400 });
        expect(result.next.handle).not.toHaveBeenCalled();
    });

    it('rejects positive numeric array indices not used by the flat frontend payload', async () => {
        const result = await parse(KnowledgePoolController.prototype.uploadKnowledgeFile, [field('name[1]')]);
        expect(result.error).toBeDefined();
        expect(result.next.handle).not.toHaveBeenCalled();
    });
});
