import 'reflect-metadata';
import { Reflector } from '@nestjs/core';
import { GUARDS_METADATA, HEADERS_METADATA } from '@nestjs/common/constants';
import { ForbiddenException, UnauthorizedException } from '@nestjs/common';
import { EmailController } from './email.controller';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RbacGuard } from '../rbac/rbac.guard';

jest.mock('../prisma/prisma.service', () => ({ PrismaService: class {} }));
jest.mock('./email.service', () => ({ EmailService: class {} }));
jest.mock('./email.templates', () => ({ TemplateService: class {} }));
jest.mock('./gmail.provider', () => ({ GmailProvider: class {} }));
jest.mock('./email-inbound.service', () => ({ EmailInboundService: class {} }));
jest.mock('../redis/redis.service', () => ({ RedisService: class {} }));
jest.mock('@aluplan/database', () => ({ Prisma: {} }));

function fixture(rows: any[] = []) {
    const db = { inboundEmailLog: { findMany: jest.fn().mockResolvedValue(rows) } };
    const controller = new EmailController(db as any, {} as any, {} as any, {} as any, {} as any, {} as any);
    return { db, controller };
}
describe('inbound review read-only contract', () => {
    it('has JWT, explicit permission and no-store metadata', () => {
        const handler = (EmailController.prototype as any).getInboundReview;
        expect(Reflect.getMetadata(GUARDS_METADATA, handler)).toEqual([JwtAuthGuard, RbacGuard]);
        expect(Reflect.getMetadata('permissions', handler)).toEqual(['settings:read']);
        expect(Reflect.getMetadata('isPublic', handler)).not.toBe(true);
        expect(Reflect.getMetadata(HEADERS_METADATA, handler)).toContainEqual({ name: 'Cache-Control', value: 'no-store' });
    });
    it.each([undefined, { role: 'customer', permissions: [] }])('RBAC denies absent user or permission', user => {
        const context: any = {
            getHandler: () => (EmailController.prototype as any).getInboundReview,
            getClass: () => EmailController,
            switchToHttp: () => ({ getRequest: () => ({ user }) }),
        };
        expect(() => new RbacGuard(new Reflector()).canActivate(context)).toThrow(ForbiddenException);
    });
    it('accepts the required read permission and JWT guard rejects unauthenticated requests', () => {
        const context: any = {
            getHandler: () => EmailController.prototype.getInboundReview,
            getClass: () => EmailController,
            switchToHttp: () => ({ getRequest: () => ({ user: { role: 'support', permissions: ['settings:read'] } }) }),
        };
        expect(new RbacGuard(new Reflector()).canActivate(context)).toBe(true);
        expect(() => new JwtAuthGuard(new Reflector()).handleRequest(null, false, null, context)).toThrow(UnauthorizedException);
    });
    it('filters pending, held and partial attachment rows with a bounded projection', async () => {
        const { db, controller } = fixture([{ id: 'row', messageId: 'message', from: 'sender@example.invalid',
            subject: 'Subject', processed: false, ticketId: null, createdAt: new Date(0), processedAt: null,
            error: 'INBOUND_HOLD_V1:{"owner":"SECRET","fingerprint":"HASH","reason":"PROCESSING_FAILED"}' }]);
        const result = await (controller as any).getInboundReview();
        expect(db.inboundEmailLog.findMany).toHaveBeenCalledWith(expect.objectContaining({
            take: 51, where: { OR: [{ processed: false }, { error: { startsWith: 'INBOUND_HOLD_V1:' } },
                { error: { contains: 'INBOUND_ATTACHMENT_FAILURE' } }] },
        }));
        expect(result.items[0]).toMatchObject({ id: 'row', state: 'held', reason: 'PROCESSING_FAILED' });
        expect(JSON.stringify(result)).not.toMatch(/SECRET|HASH|"error"/);
        expect(result.nextCursor).toBeNull();
    });
    it('returns cursor only when another bounded page exists', async () => {
        const { db, controller } = fixture([{ id: 'one', processed: false }, { id: 'two', processed: false }]);
        const cursor = '00000000-0000-4000-8000-000000000001';
        const result = await (controller as any).getInboundReview('1', cursor);
        expect(result.items).toHaveLength(1); expect(result.nextCursor).toBe('one');
        expect(db.inboundEmailLog.findMany).toHaveBeenCalledWith(expect.objectContaining({ take: 2, skip: 1, cursor: { id: cursor } }));
    });
    it.each(['0', '101', '-1', '1.5', '1e2', ' 10', ['10']])('rejects invalid limit %s before DB read', async limit => {
        const { db, controller } = fixture();
        await expect((controller as any).getInboundReview(limit)).rejects.toThrow();
        expect(db.inboundEmailLog.findMany).not.toHaveBeenCalled();
    });
    it('rejects invalid cursor before DB read', async () => {
        const { db, controller } = fixture();
        await expect((controller as any).getInboundReview('50', 'not-uuid')).rejects.toThrow();
        expect(db.inboundEmailLog.findMany).not.toHaveBeenCalled();
    });
});
