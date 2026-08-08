import { Test, TestingModule } from '@nestjs/testing';
import { getQueueToken } from '@nestjs/bullmq';
import { EmailService } from './email.service';
import { SettingsService } from '../settings/settings.service';
import { PrismaService } from '../prisma/prisma.service';
import { ResendProvider } from './resend.provider';
import { SmtpProvider } from './smtp.provider';
import { GmailProvider } from './gmail.provider';
import { ErrorLoggerService } from '../common/services/error-logger.service';

const mockJob = { id: 'job-1', remove: jest.fn().mockResolvedValue(undefined) };

const mockQueue = {
    add: jest.fn().mockResolvedValue(mockJob),
    getJob: jest.fn().mockResolvedValue(null),
};

const mockSettings = {
    getValue: jest.fn().mockResolvedValue('resend'),
};

const mockPrisma = {
    user: { findUnique: jest.fn().mockResolvedValue(null) },
    emailPreference: { findUnique: jest.fn().mockResolvedValue(null) },
    emailLog: { create: jest.fn().mockResolvedValue({ id: 'log-1' }) },
};

const mockResend = { sendEmail: jest.fn().mockResolvedValue({ id: 'msg-1' }) };
const mockSmtp = { sendEmail: jest.fn().mockResolvedValue({ id: 'smtp-1' }) };
const mockGmail = { sendEmail: jest.fn().mockResolvedValue({ id: 'gmail-1' }) };
const mockErrorLogger = { logError: jest.fn().mockResolvedValue(undefined) };

const basePayload = {
    template: 'ticket-created' as const,
    to: 'user@example.com',
    subject: 'Test Subject',
    data: {},
};

describe('EmailService', () => {
    let service: EmailService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                EmailService,
                { provide: getQueueToken('email'), useValue: mockQueue },
                { provide: SettingsService, useValue: mockSettings },
                { provide: PrismaService, useValue: mockPrisma },
                { provide: ResendProvider, useValue: mockResend },
                { provide: SmtpProvider, useValue: mockSmtp },
                { provide: GmailProvider, useValue: mockGmail },
                { provide: ErrorLoggerService, useValue: mockErrorLogger },
            ],
        }).compile();

        service = module.get<EmailService>(EmailService);
        // Trigger onModuleInit to initialise provider
        await service.onModuleInit();
    });

    afterEach(() => jest.clearAllMocks());

    // ─── enqueueEmail ────────────────────────────────────────────────────────
    describe('enqueueEmail', () => {
        it('creates an emailLog entry before enqueuing', async () => {
            await service.enqueueEmail(basePayload);
            expect(mockPrisma.emailLog.create).toHaveBeenCalledWith(
                expect.objectContaining({
                    data: expect.objectContaining({
                        recipientEmail: 'user@example.com',
                        subject: 'Test Subject',
                        status: 'QUEUED',
                    }),
                }),
            );
        });

        it('enqueues a BullMQ job with the template name', async () => {
            await service.enqueueEmail(basePayload);
            expect(mockQueue.add).toHaveBeenCalledWith(
                'ticket-created',
                expect.objectContaining({ to: 'user@example.com', logRef: 'log-1' }),
                expect.any(Object),
            );
        });

        it('skips reserved test recipients in production', async () => {
            const previousNodeEnv = process.env.NODE_ENV;
            process.env.NODE_ENV = 'production';

            try {
                await service.enqueueEmail({
                    ...basePayload,
                    to: 'admin@example.com',
                });

                expect(mockQueue.add).not.toHaveBeenCalled();
                expect(mockPrisma.emailLog.create).toHaveBeenCalledWith(
                    expect.objectContaining({
                        data: expect.objectContaining({
                            recipientEmail: 'admin@example.com',
                            status: 'SKIPPED_INVALID_RECIPIENT',
                        }),
                    }),
                );
            } finally {
                process.env.NODE_ENV = previousNodeEnv;
            }
        });

        it('uses default priority 3 when payload.priority is undefined', async () => {
            await service.enqueueEmail({ ...basePayload, priority: undefined });
            const opts = (mockQueue.add as jest.Mock).mock.calls[0][2];
            expect(opts.priority).toBe(3);
        });

        it('respects explicit priority in the payload', async () => {
            await service.enqueueEmail({ ...basePayload, priority: 1 });
            const opts = (mockQueue.add as jest.Mock).mock.calls[0][2];
            expect(opts.priority).toBe(1);
        });

        it('skips enqueue when user has opted out of the email type', async () => {
            mockPrisma.user.findUnique.mockResolvedValueOnce({ id: 'u-1', email: 'user@example.com' });
            mockPrisma.emailPreference.findUnique
                .mockResolvedValueOnce(null)
                .mockResolvedValueOnce({ enabled: false });

            await service.enqueueEmail(basePayload);

            expect(mockQueue.add).not.toHaveBeenCalled();
            expect(mockPrisma.emailLog.create).not.toHaveBeenCalled();
        });

        it('uses ANNOUNCEMENTS preference and skips a master announcement when opted out', async () => {
            mockPrisma.user.findUnique.mockResolvedValueOnce({ id: 'u-announcement', email: 'user@example.com' });
            mockPrisma.emailPreference.findUnique
                .mockResolvedValueOnce(null)
                .mockResolvedValueOnce({ enabled: false });

            await service.enqueueEmail({
                ...basePayload,
                template: 'master-announcement',
            });

            expect(mockPrisma.emailPreference.findUnique).toHaveBeenCalledWith({
                where: {
                    userId_emailType: {
                        userId: 'u-announcement',
                        emailType: 'ANNOUNCEMENTS',
                    },
                },
            });
            expect(mockQueue.add).not.toHaveBeenCalled();
            expect(mockPrisma.emailLog.create).not.toHaveBeenCalled();
        });

        it('skips enqueue when user has globally unsubscribed', async () => {
            mockPrisma.user.findUnique.mockResolvedValueOnce({ id: 'u-1', email: 'user@example.com' });
            mockPrisma.emailPreference.findUnique
                .mockResolvedValueOnce({ enabled: false })
                .mockResolvedValueOnce(null);

            await service.enqueueEmail(basePayload);

            expect(mockQueue.add).not.toHaveBeenCalled();
            expect(mockPrisma.emailLog.create).not.toHaveBeenCalled();
        });

        it('proceeds normally when user has no preference record', async () => {
            mockPrisma.user.findUnique.mockResolvedValueOnce({ id: 'u-2', email: 'user@example.com' });
            mockPrisma.emailPreference.findUnique
                .mockResolvedValueOnce(null)
                .mockResolvedValueOnce(null);

            await service.enqueueEmail(basePayload);

            expect(mockQueue.add).toHaveBeenCalledTimes(1);
        });

        it('injects registered user id so unsubscribe links are user-specific', async () => {
            mockPrisma.user.findUnique.mockResolvedValueOnce({ id: 'u-3', email: 'user@example.com' });
            mockPrisma.emailPreference.findUnique
                .mockResolvedValueOnce(null)
                .mockResolvedValueOnce(null);

            await service.enqueueEmail(basePayload);

            expect(mockQueue.add).toHaveBeenCalledWith(
                'ticket-created',
                expect.objectContaining({
                    data: expect.objectContaining({ userId: 'u-3' }),
                    logRef: 'log-1',
                }),
                expect.any(Object),
            );
        });

        it('throws and logs when queue.add fails', async () => {
            mockQueue.add.mockRejectedValueOnce(new Error('Queue down'));

            await expect(service.enqueueEmail(basePayload)).rejects.toThrow('Queue down');
            expect(mockErrorLogger.logError).toHaveBeenCalledWith(
                expect.objectContaining({ action: 'email_enqueue_failed' }),
            );
        });
    });

    // ─── cancelEmail ─────────────────────────────────────────────────────────
    describe('cancelEmail', () => {
        it('returns false when job does not exist in queue', async () => {
            mockQueue.getJob.mockResolvedValueOnce(null);
            const result = await service.cancelEmail('non-existent-job');
            expect(result).toBe(false);
        });

        it('removes job and returns true when job exists', async () => {
            mockQueue.getJob.mockResolvedValueOnce(mockJob);
            const result = await service.cancelEmail('job-1');
            expect(result).toBe(true);
            expect(mockJob.remove).toHaveBeenCalled();
        });
    });

    // ─── provider selection (onModuleInit) ──────────────────────────────────
    describe('onModuleInit / provider selection', () => {
        it('falls back to resend when settings throws', async () => {
            mockSettings.getValue.mockRejectedValueOnce(new Error('settings error'));
            await service.onModuleInit(); // should not throw
            expect(mockErrorLogger.logError).toHaveBeenCalledWith(
                expect.objectContaining({ action: 'email_provider_refresh_failed' }),
            );
        });
    });
});
