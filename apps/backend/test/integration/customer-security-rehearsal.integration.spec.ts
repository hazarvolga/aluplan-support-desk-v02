/**
 * A dedicated local PostgreSQL container on 127.0.0.1:55434 is REQUIRED.
 * Execute ONLY through the approved sandbox launcher after its bootstrap checks.
 * The proposed shared-cluster target on port 55433 failed
 * isolation checks because PUBLIC could read pg_stat_statements across databases.
 * Bootstrap stopped before database creation; its new role was disabled (NOLOGIN).
 * Port 55433, the preview, and all shared-cluster connections remain forbidden.
 * The fixed guards below allow only the dedicated 55434 target.
 */
import { randomBytes, randomUUID } from 'crypto';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { Reflector } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { EventEmitter2 } from '@nestjs/event-emitter';
import * as bcrypt from 'bcryptjs';
import cookieParser from 'cookie-parser';
import request from 'supertest';
import { isEmail } from 'class-validator';
import { AuthController } from '../../src/auth/auth.controller';
import { AuthService } from '../../src/auth/auth.service';
import { JwtStrategy } from '../../src/auth/strategies/jwt.strategy';
import { JwtRefreshStrategy } from '../../src/auth/strategies/jwt-refresh.strategy';
import { JwtAuthGuard } from '../../src/auth/guards/jwt-auth.guard';
import { RbacGuard } from '../../src/rbac/rbac.guard';
import { PrismaService } from '../../src/prisma/prisma.service';
import { MetricsService } from '../../src/metrics/metrics.service';
import { RedisService } from '../../src/redis/redis.service';
import { EmailService } from '../../src/email/email.service';
import { SettingsService } from '../../src/settings/settings.service';
import { CrmEmailValidatorService } from '../../src/crm/crm-email-validator.service';
import { TicketsController } from '../../src/tickets/tickets.controller';
import { TicketsService } from '../../src/tickets/tickets.service';
import { SlaService } from '../../src/tickets/sla.service';
import { TicketAccessService } from '../../src/common/services/ticket-access.service';
import { MaintenanceWorkService } from '../../src/common/services/maintenance-work.service';
import { PiiMaskingService } from '../../src/common/services/pii-masking.service';
import { StorageService } from '../../src/common/services/storage.service';
import { AiQueryService } from '../../src/ai/ai-query.service';
import { NotificationsGateway } from '../../src/notifications/notifications.gateway';
import { AttachmentsController } from '../../src/attachments/attachments.controller';
import { AttachmentsService } from '../../src/attachments/attachments.service';
import { HotinfoParserService } from '../../src/customers/hotinfo-parser.service';

const TARGET_DATABASE = 'aluplan_security_rehearsal_20260908';
const TARGET_USER = 'aluplan_rehearsal_20260908';
const TARGET_MARKER = 'aluplan-security-rehearsal-20260908';
const TARGET_OPTIONS = '-c statement_timeout=15000 -c lock_timeout=3000';
const CUSTOMER_GRANTS = ['ticket:create', 'ticket:read', 'ticket:update', 'kb:read'];
const API = '/api/v1';

function guardedDatabaseUrl(): string {
    const raw = process.env.SECURITY_REHEARSAL_DATABASE_URL;
    if (!raw || process.env.NODE_ENV === 'production') {
        throw new Error('Explicit local rehearsal configuration is required');
    }
    let parsed: URL;
    try { parsed = new URL(raw); } catch { throw new Error('Invalid rehearsal database configuration'); }
    const queryEntries = [...parsed.searchParams.entries()];
    const hasExactOptions = queryEntries.length === 1
        && queryEntries[0][0] === 'options' && queryEntries[0][1] === TARGET_OPTIONS;
    if (!['postgresql:', 'postgres:'].includes(parsed.protocol)
        || parsed.hostname !== '127.0.0.1' || parsed.port !== '55434'
        || parsed.pathname !== `/${TARGET_DATABASE}`
        || decodeURIComponent(parsed.username) !== TARGET_USER
        || !parsed.password || !hasExactOptions || parsed.hash) {
        throw new Error('Refusing a database outside the explicit disposable rehearsal target');
    }
    return raw;
}

/**
 * Real HTTP controllers + bcrypt/JWT/Prisma/RBAC/ownership; synthetic data only.
 * All outbound boundaries are fakes. No AppModule, cron, queue, .env, or preview runtime.
 * CRM membership on existing-account login is NOT asserted: that lifecycle remains separate.
 * Fixtures remain in the disposable database for inspection; this suite never deletes data.
 */
describe('Disposable PostgreSQL customer security rehearsal', () => {
    let app: INestApplication | undefined;
    let prisma: PrismaService;
    let previousDatabaseUrl: string | undefined;
    let databaseEnvironmentChanged = false;
    const runId = randomUUID();
    const password = `Rehearsal-${randomBytes(24).toString('hex')}`;
    const configValues: Record<string, unknown> = {
        NODE_ENV: 'test',
        JWT_SECRET: randomBytes(48).toString('hex'),
        JWT_REFRESH_SECRET: randomBytes(48).toString('hex'),
        AUTH_ACTION_JWT_SECRET: randomBytes(48).toString('hex'),
        JWT_EXPIRES_IN: '1h', JWT_REFRESH_EXPIRES_IN: '1d',
        FRONTEND_URL: 'http://127.0.0.1:3999',
    };
    const redisValues = new Map<string, string>();
    const email = {
        sendPasswordReset: jest.fn().mockResolvedValue(undefined),
        sendEmailVerification: jest.fn().mockResolvedValue(undefined),
    };
    const crm = { validateEmailInCrm: jest.fn().mockResolvedValue({ isValid: false, errorCode: 'NOT_FOUND' }) };
    const events = { emit: jest.fn() };
    const ai = { smartTagTicket: jest.fn().mockResolvedValue({ tags: [] }) };
    const storage = {
        uploadFile: jest.fn().mockImplementation(async () => `synthetic-rehearsal/${randomUUID()}`),
        getDownloadUrl: jest.fn().mockResolvedValue('https://download.invalid/synthetic-rehearsal'),
    };
    const gateway = {
        emitTicketCreated: jest.fn(), emitNewMessage: jest.fn(), emitTicketUpdated: jest.fn(),
        emitBulkUpdate: jest.fn(), emitTicketEscalated: jest.fn(),
    };
    let customerRoleId: string;
    let customerA: { id: string; email: string };
    let customerB: { id: string; email: string };
    let customerCookieA: string;
    let customerCookieB: string;
    let staffCookie: string;
    let ticketA: { id: string; ticketNumber: string };
    let ticketB: { id: string; ticketNumber: string };

    async function fixtureRole(name: string, grants: string[]): Promise<string> {
        const role = await prisma.role.upsert({ where: { name }, create: { name }, update: {} });
        for (const name of grants) {
            const permission = await prisma.permission.upsert({
                where: { name }, create: { name, group: 'rehearsal' }, update: {},
            });
            await prisma.rolePermission.upsert({
                where: { roleId_permissionId: { roleId: role.id, permissionId: permission.id } },
                create: { roleId: role.id, permissionId: permission.id }, update: {},
            });
        }
        const stored = await prisma.role.findUniqueOrThrow({
            where: { id: role.id }, include: { permissions: { include: { permission: true } } },
        });
        expect(stored.permissions.map(row => row.permission.name).sort()).toEqual([...grants].sort());
        return role.id;
    }

    async function fixtureUser(tag: string, roleId: string) {
        const address = `rehearsal-${randomUUID()}@example.invalid`;
        expect(address.split('@')[0].length).toBeLessThanOrEqual(64);
        expect(isEmail(address)).toBe(true);
        return prisma.user.create({ data: {
            email: address,
            fullName: `Synthetic ${tag}`, passwordHash: await bcrypt.hash(password, 10),
            status: 'ACTIVE', roleId,
        } });
    }

    async function login(user: { email: string }): Promise<string> {
        const response = await request(app!.getHttpServer()).post(`${API}/auth/login`)
            .send({ email: user.email, password });
        // Assert only status metadata on failure; never print auth cookies, tokens, or request credentials.
        expect({ status: response.status, error: response.body.error }).toEqual({ status: 200, error: undefined });
        expect(Object.prototype.hasOwnProperty.call(response.body ?? {}, 'access_token')).toBe(false);
        expect(Object.prototype.hasOwnProperty.call(response.body ?? {}, 'refresh_token')).toBe(false);
        const cookies = response.headers['set-cookie'] as unknown as string[];
        expect(Array.isArray(cookies) && cookies.every(cookie => typeof cookie === 'string')).toBe(true);
        const access = cookies.find(cookie => cookie.startsWith('alu_at='));
        expect(typeof access === 'string' && access.includes('HttpOnly')).toBe(true);
        return access!.split(';')[0];
    }

    beforeAll(async () => {
        const databaseUrl = guardedDatabaseUrl();
        previousDatabaseUrl = process.env.DATABASE_URL;
        process.env.DATABASE_URL = databaseUrl;
        databaseEnvironmentChanged = true;
        const module = await Test.createTestingModule({
            controllers: [AuthController, TicketsController, AttachmentsController],
            providers: [PrismaService, AuthService, TicketsService, AttachmentsService,
                MaintenanceWorkService,
                TicketAccessService, PiiMaskingService, JwtStrategy, JwtRefreshStrategy, RbacGuard,
                { provide: JwtService, useValue: new JwtService() },
                { provide: MetricsService, useValue: { setDbPoolConnections: jest.fn() } },
                { provide: ConfigService, useValue: { get: (key: string, fallback?: unknown) => configValues[key] ?? fallback } },
                { provide: EmailService, useValue: email },
                { provide: SettingsService, useValue: { getValue: jest.fn().mockResolvedValue(undefined) } },
                { provide: RedisService, useValue: {
                    get: jest.fn(async (key: string) => redisValues.get(key) ?? null),
                    set: jest.fn(async (key: string, value: string) => { redisValues.set(key, value); }),
                } },
                { provide: CrmEmailValidatorService, useValue: crm },
                { provide: SlaService, useValue: { calculateDeadlines: jest.fn(async () => ({
                    slaResponseDue: new Date(Date.now() + 3600000),
                    slaResolveDue: new Date(Date.now() + 86400000),
                })) } },
                { provide: EventEmitter2, useValue: events },
                { provide: AiQueryService, useValue: ai },
                { provide: NotificationsGateway, useValue: gateway },
                { provide: StorageService, useValue: storage },
                { provide: HotinfoParserService, useValue: { parseHotinfo: jest.fn() } },
            ],
        }).compile();
        app = module.createNestApplication();
        app.useLogger(false);
        app.use(cookieParser());
        app.setGlobalPrefix('api/v1');
        app.useGlobalPipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true }));
        app.useGlobalGuards(new JwtAuthGuard(module.get(Reflector)));
        await app.listen(3999, '127.0.0.1');
        prisma = module.get(PrismaService);
        const identity = await prisma.$queryRaw<Array<{ database: string; user: string }>>`
            SELECT current_database() AS database, current_user AS user`;
        expect(identity).toEqual([{ database: TARGET_DATABASE, user: TARGET_USER }]);
        const marker = await prisma.$queryRaw<Array<{ label: string }>>`
            SELECT label FROM rehearsal_control.marker WHERE label = ${TARGET_MARKER}`;
        expect(marker).toEqual([{ label: TARGET_MARKER }]);

        // These are the first writes; connection identity and explicit marker are already verified.
        customerRoleId = await fixtureRole('CUSTOMER', CUSTOMER_GRANTS);
        // Keep the production SUPPORT_AGENT grants intact; this synthetic
        // role normalizes to the same staff authority without inheriting them.
        const staffRoleId = await fixtureRole('support-agent', ['ticket:read', 'ticket:update']);
        customerA = await fixtureUser('customer-a', customerRoleId);
        customerB = await fixtureUser('customer-b', customerRoleId);
        const staff = await fixtureUser('staff', staffRoleId);
        customerCookieA = await login(customerA);
        customerCookieB = await login(customerB);
        staffCookie = await login(staff);
        ticketA = (await request(app.getHttpServer()).post(`${API}/tickets`)
            .set('Cookie', customerCookieA).send({ subject: `Synthetic ticket A ${runId}` }).expect(201)).body;
        ticketB = (await request(app.getHttpServer()).post(`${API}/tickets`)
            .set('Cookie', customerCookieB).send({ subject: `Synthetic ticket B ${runId}` }).expect(201)).body;
    });

    afterAll(async () => {
        try {
            await app?.close();
        } finally {
            if (databaseEnvironmentChanged) {
                if (previousDatabaseUrl === undefined) delete process.env.DATABASE_URL;
                else process.env.DATABASE_URL = previousDatabaseUrl;
            }
        }
    });

    it('persists customer-owned tickets without AI and allows own detail/list reads', async () => {
        expect(await prisma.ticket.findUnique({ where: { id: ticketA.id } })).toMatchObject({ userId: customerA.id });
        const detail = await request(app!.getHttpServer()).get(`${API}/tickets/${ticketA.id}`)
            .set('Cookie', customerCookieA).expect(200);
        expect(detail.body.id).toBe(ticketA.id);
        const list = await request(app!.getHttpServer()).get(`${API}/tickets?userId=${customerB.id}`)
            .set('Cookie', customerCookieA).expect(200);
        expect(list.body.data.map((ticket: { id: string }) => ticket.id)).toContain(ticketA.id);
        expect(list.body.data.map((ticket: { id: string }) => ticket.id)).not.toContain(ticketB.id);
        expect(ai.smartTagTicket).not.toHaveBeenCalled();
    });

    it('rejects unsigned requests and cross-customer detail, number lookup, and replies', async () => {
        await request(app!.getHttpServer()).get(`${API}/tickets/${ticketA.id}`).expect(401);
        const before = await prisma.ticketMessage.count({ where: { ticketId: ticketA.id } });
        await request(app!.getHttpServer()).get(`${API}/tickets/${ticketA.id}`).set('Cookie', customerCookieB).expect(403);
        await request(app!.getHttpServer()).get(`${API}/tickets/by-number/${ticketA.ticketNumber}`)
            .set('Cookie', customerCookieB).expect(403);
        await request(app!.getHttpServer()).post(`${API}/tickets/${ticketA.id}/messages`)
            .set('Cookie', customerCookieB).send({ message: 'Cross-customer denied' }).expect(403);
        expect(await prisma.ticketMessage.count({ where: { ticketId: ticketA.id } })).toBe(before);
    });

    it('allows public customer replies and staff notes but never exposes internal notes to the customer', async () => {
        const reply = await request(app!.getHttpServer()).post(`${API}/tickets/${ticketA.id}/messages`)
            .set('Cookie', customerCookieA).send({ message: 'Synthetic customer reply' }).expect(201);
        const note = await request(app!.getHttpServer()).post(`${API}/tickets/${ticketA.id}/messages`)
            .set('Cookie', staffCookie).send({ message: 'Synthetic private staff note', isInternal: true }).expect(201);
        const detail = await request(app!.getHttpServer()).get(`${API}/tickets/${ticketA.id}`)
            .set('Cookie', customerCookieA).expect(200);
        expect(detail.body.messages.map((message: { id: string }) => message.id)).toContain(reply.body.id);
        expect(detail.body.messages.map((message: { id: string }) => message.id)).not.toContain(note.body.id);
        expect(await prisma.ticketMessage.findUnique({ where: { id: note.body.id } })).toMatchObject({ isInternal: true });
    });

    it('rejects customer-created internal notes without persisting or emitting a message', async () => {
        const before = await prisma.ticketMessage.count({ where: { ticketId: ticketA.id } });
        const emitted = gateway.emitNewMessage.mock.calls.length;
        await request(app!.getHttpServer()).post(`${API}/tickets/${ticketA.id}/messages`)
            .set('Cookie', customerCookieA).send({ message: 'Customer cannot create staff notes', isInternal: true }).expect(403);
        expect(await prisma.ticketMessage.count({ where: { ticketId: ticketA.id } })).toBe(before);
        expect(gateway.emitNewMessage).toHaveBeenCalledTimes(emitted);
    });

    it('binds attachment upload/download to owned public messages and denies other customers before storage access', async () => {
        const reply = await request(app!.getHttpServer()).post(`${API}/tickets/${ticketA.id}/messages`)
            .set('Cookie', customerCookieA).send({ message: 'Attachment fixture message' }).expect(201);
        const file = Buffer.from('%PDF-1.4\n% synthetic harmless test fixture\n%%EOF\n');
        const uploaded = await request(app!.getHttpServer()).post(`${API}/attachments/upload/${reply.body.id}`)
            .set('Cookie', customerCookieA).attach('file', file, { filename: 'synthetic.pdf', contentType: 'application/pdf' }).expect(201);
        const beforeUploads = storage.uploadFile.mock.calls.length;
        await request(app!.getHttpServer()).post(`${API}/attachments/upload/${reply.body.id}`)
            .set('Cookie', customerCookieB).attach('file', file, { filename: 'synthetic.pdf', contentType: 'application/pdf' }).expect(403);
        expect(storage.uploadFile).toHaveBeenCalledTimes(beforeUploads);
        await request(app!.getHttpServer()).get(`${API}/attachments/${uploaded.body.id}/download`)
            .set('Cookie', customerCookieA).expect(302).expect('Location', 'https://download.invalid/synthetic-rehearsal');
        const beforeDownloads = storage.getDownloadUrl.mock.calls.length;
        await request(app!.getHttpServer()).get(`${API}/attachments/${uploaded.body.id}/download`)
            .set('Cookie', customerCookieB).expect(403);
        expect(storage.getDownloadUrl).toHaveBeenCalledTimes(beforeDownloads);
    });

    it('blocks customer access to attachments on internal notes even on their own ticket', async () => {
        const note = await request(app!.getHttpServer()).post(`${API}/tickets/${ticketA.id}/messages`)
            .set('Cookie', staffCookie).send({ message: 'Private attachment note', isInternal: true }).expect(201);
        const attachment = await prisma.attachment.create({ data: {
            messageId: note.body.id, fileName: 'private.pdf', fileSize: 12,
            mimeType: 'application/pdf', url: 'synthetic-rehearsal/private.pdf',
        } });
        const beforeDownloads = storage.getDownloadUrl.mock.calls.length;
        await request(app!.getHttpServer()).get(`${API}/attachments/${attachment.id}/download`)
            .set('Cookie', customerCookieA).expect(403);
        expect(storage.getDownloadUrl).toHaveBeenCalledTimes(beforeDownloads);
        const beforeUploads = storage.uploadFile.mock.calls.length;
        await request(app!.getHttpServer()).post(`${API}/attachments/upload/${note.body.id}`)
            .set('Cookie', customerCookieA)
            .attach('file', Buffer.from('%PDF-1.4\n%%EOF\n'), { filename: 'synthetic.pdf', contentType: 'application/pdf' })
            .expect(403);
        expect(storage.uploadFile).toHaveBeenCalledTimes(beforeUploads);
    });

    it('uses current persisted grants rather than permissions embedded in an existing cookie', async () => {
        const user = await fixtureUser('revoked-grants', customerRoleId);
        const cookie = await login(user);
        const emptyRoleId = await fixtureRole('customer', []);
        await prisma.user.update({ where: { id: user.id }, data: { roleId: emptyRoleId } });
        const before = await prisma.ticket.count({ where: { userId: user.id } });
        await request(app!.getHttpServer()).post(`${API}/tickets`).set('Cookie', cookie)
            .send({ subject: 'Denied without current grant' }).expect(403);
        expect(await prisma.ticket.count({ where: { userId: user.id } })).toBe(before);
    });

    it('rejects already issued cookies after suspension or durable session-version invalidation', async () => {
        for (const mutation of [{ status: 'SUSPENDED' as const }, { sessionVersion: { increment: 1 } }]) {
            const user = await fixtureUser('invalid-session', customerRoleId);
            const cookie = await login(user);
            await prisma.user.update({ where: { id: user.id }, data: mutation });
            await request(app!.getHttpServer()).get(`${API}/tickets`).set('Cookie', cookie).expect(401);
        }
        expect(email.sendPasswordReset).not.toHaveBeenCalled();
        expect(email.sendEmailVerification).not.toHaveBeenCalled();
        expect(crm.validateEmailInCrm).not.toHaveBeenCalled();
    });
});
