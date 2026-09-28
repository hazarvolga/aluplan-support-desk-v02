/**
 * CRM Webhook — Integration Tests (NestJS + Supertest)
 *
 * Bu testler gerçek NestJS HTTP katmanını test eder:
 * - Guard (HMAC-SHA256 x-signature doğrulama) → Controller → Service akışı
 * - HTTP status kodları (200, 400, 401)
 * - Webhook payload işleme (account + contact)
 * - Güvenlik: eksik/geçersiz imza, değiştirilmiş gövde, desteklenmeyen entity
 */

import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { createHmac } from 'crypto';
import { CrmWebhookController } from '../../src/crm/webhooks/crm-webhook.controller';
import { CrmWebhookGuard } from '../../src/crm/guards/crm-webhook.guard';
import { CrmService } from '../../src/crm/crm.service';
import { PrismaService } from '../../src/prisma/prisma.service';
import { CryptoService } from '../../src/utils/crypto.service';
import { signedWebhookJsonParser } from '../../src/common/http/signed-webhook-json-parser';
import {
    MOCK_WEBHOOK_ACCOUNT_PAYLOAD,
    MOCK_WEBHOOK_CONTACT_PAYLOAD,
    MOCK_WEBHOOK_CONTACT_NO_EMAIL,
} from '../fixtures/dynamics365-responses';

// ─── Mocks ───────────────────────────────────────────────────────────────────

const WEBHOOK_SECRET = 'test-webhook-secret-123';
const ENCRYPTED_SECRET = 'enc:test-webhook-secret-123';
const signatureFor = (payload: unknown) => createHmac('sha256', WEBHOOK_SECRET)
    .update(JSON.stringify(payload))
    .digest('hex');
const signatureForRaw = (payload: string) => createHmac('sha256', WEBHOOK_SECRET)
    .update(payload)
    .digest('hex');

const mockPrisma = {
    crmConnection: {
        findFirst: jest.fn().mockResolvedValue({
            id: 'conn-1',
            webhookSecret: ENCRYPTED_SECRET,
        }),
        upsert: jest.fn(),
    },
    crmAccount: { upsert: jest.fn().mockResolvedValue({ id: 'acc-1' }) },
    $transaction: jest.fn(),
};

const mockCrypto = {
    encrypt: jest.fn((v: string) => `enc:${v}`),
    decrypt: jest.fn((v: string) => v.replace('enc:', '')),
};

const mockCrmService = {
    processDynamics365Webhook: jest.fn(),
};

// ─── Suite ────────────────────────────────────────────────────────────────────

describe('CrmWebhookController — Integration (HTTP)', () => {
    let app: INestApplication;

    beforeAll(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [CrmWebhookController],
            providers: [
                { provide: CrmService, useValue: mockCrmService },
                { provide: PrismaService, useValue: mockPrisma },
                { provide: CryptoService, useValue: mockCrypto },
                CrmWebhookGuard,
            ],
        }).compile();

        app = module.createNestApplication();
        app.use(signedWebhookJsonParser);
        app.useGlobalPipes(new ValidationPipe({ whitelist: true }));
        await app.init();
    });

    afterAll(async () => {
        await app.close();
    });

    beforeEach(() => {
        jest.clearAllMocks();
        // Reset to valid connection by default
        mockPrisma.crmConnection.findFirst.mockResolvedValue({
            id: 'conn-1',
            webhookSecret: ENCRYPTED_SECRET,
        });
        mockCrypto.decrypt.mockImplementation((v: string) => v.replace('enc:', ''));
        mockCrmService.processDynamics365Webhook.mockResolvedValue(undefined);
    });

    // ── Authentication ────────────────────────────────────────────────────────

    describe('Authentication (x-signature)', () => {
        it('should return 401 when x-signature header is missing', async () => {
            await request(app.getHttpServer())
                .post('/crm/webhooks/dynamics365')
                .send(MOCK_WEBHOOK_ACCOUNT_PAYLOAD)
                .expect(401);
        });

        it('should reject the legacy x-api-key header', async () => {
            await request(app.getHttpServer())
                .post('/crm/webhooks/dynamics365')
                .set('x-api-key', WEBHOOK_SECRET)
                .send(MOCK_WEBHOOK_ACCOUNT_PAYLOAD)
                .expect(401);
        });

        it('should return 401 when x-signature is wrong', async () => {
            await request(app.getHttpServer())
                .post('/crm/webhooks/dynamics365')
                .set('x-signature', '0'.repeat(64))
                .send(MOCK_WEBHOOK_ACCOUNT_PAYLOAD)
                .expect(401);
        });

        it('should reject a changed body under a valid signature for the original body', async () => {
            await request(app.getHttpServer())
                .post('/crm/webhooks/dynamics365')
                .set('x-signature', signatureFor(MOCK_WEBHOOK_ACCOUNT_PAYLOAD))
                .send({ ...MOCK_WEBHOOK_ACCOUNT_PAYLOAD, entity: 'contact' })
                .expect(401);
        });

        it('should return 401 when no CRM connection exists in DB', async () => {
            mockPrisma.crmConnection.findFirst.mockResolvedValue(null);

            await request(app.getHttpServer())
                .post('/crm/webhooks/dynamics365')
                .set('x-signature', signatureFor(MOCK_WEBHOOK_ACCOUNT_PAYLOAD))
                .send(MOCK_WEBHOOK_ACCOUNT_PAYLOAD)
                .expect(401);
        });

        it('should return 401 when connection has no webhookSecret', async () => {
            mockPrisma.crmConnection.findFirst.mockResolvedValue({
                id: 'conn-1',
                webhookSecret: null,
            });

            await request(app.getHttpServer())
                .post('/crm/webhooks/dynamics365')
                .set('x-signature', signatureFor(MOCK_WEBHOOK_ACCOUNT_PAYLOAD))
                .send(MOCK_WEBHOOK_ACCOUNT_PAYLOAD)
                .expect(401);
        });

        it('should return 200 with a valid x-signature', async () => {
            await request(app.getHttpServer())
                .post('/crm/webhooks/dynamics365')
                .set('x-signature', signatureFor(MOCK_WEBHOOK_ACCOUNT_PAYLOAD))
                .send(MOCK_WEBHOOK_ACCOUNT_PAYLOAD)
                .expect(200);
        });

        it('authenticates the exact HTTP bytes, including JSON whitespace and key order', async () => {
            const rawPayload = ` {"data":${JSON.stringify(MOCK_WEBHOOK_ACCOUNT_PAYLOAD.data)},"entity":"account"} `;
            await request(app.getHttpServer())
                .post('/crm/webhooks/dynamics365')
                .set('content-type', 'application/json')
                .set('x-signature', signatureForRaw(rawPayload))
                .send(rawPayload)
                .expect(200);

            expect(mockCrmService.processDynamics365Webhook).toHaveBeenCalledWith(
                MOCK_WEBHOOK_ACCOUNT_PAYLOAD,
            );
        });
    });

    // ── Account Webhook ───────────────────────────────────────────────────────

    describe('Account Webhook Processing', () => {
        it('should return { status: "success" } for valid account payload', async () => {
            const response = await request(app.getHttpServer())
                .post('/crm/webhooks/dynamics365')
                .set('x-signature', signatureFor(MOCK_WEBHOOK_ACCOUNT_PAYLOAD))
                .send(MOCK_WEBHOOK_ACCOUNT_PAYLOAD)
                .expect(200);

            expect(response.body).toEqual({
                status: 'success',
                message: 'Webhook processed',
            });
        });

        it('should call processDynamics365Webhook with account payload', async () => {
            await request(app.getHttpServer())
                .post('/crm/webhooks/dynamics365')
                .set('x-signature', signatureFor(MOCK_WEBHOOK_ACCOUNT_PAYLOAD))
                .send(MOCK_WEBHOOK_ACCOUNT_PAYLOAD)
                .expect(200);

            expect(mockCrmService.processDynamics365Webhook).toHaveBeenCalledWith(
                MOCK_WEBHOOK_ACCOUNT_PAYLOAD,
            );
        });

        it('should pass FormattedValue annotations in payload to service', async () => {
            const payloadWithAnnotations = {
                entity: 'account',
                data: {
                    accountid: 'acc-test',
                    name: 'Test Corp',
                    accountnumber: 'C300001',
                    'industrycode@OData.Community.Display.V1.FormattedValue': 'Technology',
                },
            };

            await request(app.getHttpServer())
                .post('/crm/webhooks/dynamics365')
                .set('x-signature', signatureFor(payloadWithAnnotations))
                .send(payloadWithAnnotations)
                .expect(200);

            expect(mockCrmService.processDynamics365Webhook).toHaveBeenCalledWith(
                expect.objectContaining({
                    data: expect.objectContaining({
                        'industrycode@OData.Community.Display.V1.FormattedValue': 'Technology',
                    }),
                }),
            );
        });
    });

    // ── Contact Webhook ───────────────────────────────────────────────────────

    describe('Contact Webhook Processing', () => {
        it('should return { status: "success" } for valid contact payload', async () => {
            const response = await request(app.getHttpServer())
                .post('/crm/webhooks/dynamics365')
                .set('x-signature', signatureFor(MOCK_WEBHOOK_CONTACT_PAYLOAD))
                .send(MOCK_WEBHOOK_CONTACT_PAYLOAD)
                .expect(200);

            expect(response.body.status).toBe('success');
        });

        it('should call processDynamics365Webhook with contact payload', async () => {
            await request(app.getHttpServer())
                .post('/crm/webhooks/dynamics365')
                .set('x-signature', signatureFor(MOCK_WEBHOOK_CONTACT_PAYLOAD))
                .send(MOCK_WEBHOOK_CONTACT_PAYLOAD)
                .expect(200);

            expect(mockCrmService.processDynamics365Webhook).toHaveBeenCalledWith(
                MOCK_WEBHOOK_CONTACT_PAYLOAD,
            );
        });

        it('should return 200 even for contact without email (service handles it)', async () => {
            // Service returns undefined for no-email contacts — controller still returns 200
            mockCrmService.processDynamics365Webhook.mockResolvedValue(undefined);

            await request(app.getHttpServer())
                .post('/crm/webhooks/dynamics365')
                .set('x-signature', signatureFor(MOCK_WEBHOOK_CONTACT_NO_EMAIL))
                .send(MOCK_WEBHOOK_CONTACT_NO_EMAIL)
                .expect(200);
        });
    });

    // ── Unsupported Entity ────────────────────────────────────────────────────

    describe('Unsupported Entity', () => {
        it('should return 400 for unsupported entity type', async () => {
            const { BadRequestException } = await import('@nestjs/common');
            mockCrmService.processDynamics365Webhook.mockRejectedValue(
                new BadRequestException('Unsupported entity type: lead'),
            );

            await request(app.getHttpServer())
                .post('/crm/webhooks/dynamics365')
                .set('x-signature', signatureFor({ entity: 'lead', data: {} }))
                .send({ entity: 'lead', data: {} })
                .expect(400);
        });
    });

    // ── Service Error Propagation ─────────────────────────────────────────────

    describe('Service Error Propagation', () => {
        it('should propagate 500 when service throws unexpected error', async () => {
            mockCrmService.processDynamics365Webhook.mockRejectedValue(
                new Error('Unexpected DB error'),
            );

            await request(app.getHttpServer())
                .post('/crm/webhooks/dynamics365')
                .set('x-signature', signatureFor(MOCK_WEBHOOK_ACCOUNT_PAYLOAD))
                .send(MOCK_WEBHOOK_ACCOUNT_PAYLOAD)
                .expect(500);
        });
    });
});
