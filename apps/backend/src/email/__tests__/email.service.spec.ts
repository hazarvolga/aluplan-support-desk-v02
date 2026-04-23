import { Test, TestingModule } from '@nestjs/testing';
import { EmailService } from '../email.service';
import { PrismaService } from '../../prisma/prisma.service';
import { SettingsService } from '../../settings/settings.service';
import { ResendProvider } from '../resend.provider';
import { SmtpProvider } from '../smtp.provider';
import { GmailProvider } from '../gmail.provider';
import { ErrorLoggerService } from '../../common/services/error-logger.service';
import { getQueueToken } from '@nestjs/bullmq';

describe('EmailService', () => {
    let service: EmailService;
    let prisma: any;
    let settings: any;
    let emailQueue: any;
    let resendProvider: any;
    let smtpProvider: any;
    let gmailProvider: any;
    let errorLogger: any;

    beforeEach(async () => {
        prisma = {
            user: { findUnique: jest.fn() },
            emailPreference: { findUnique: jest.fn() },
            emailLog: { create: jest.fn() },
        };

        settings = {
            getValue: jest.fn(),
            upsert: jest.fn(),
        };

        emailQueue = {
            add: jest.fn(),
            getJob: jest.fn(),
        };

        resendProvider = { healthCheck: jest.fn().mockResolvedValue(true) };
        smtpProvider = { healthCheck: jest.fn().mockResolvedValue(true) };
        gmailProvider = { healthCheck: jest.fn().mockResolvedValue(true) };
        errorLogger = { logError: jest.fn() };

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                EmailService,
                { provide: PrismaService, useValue: prisma },
                { provide: SettingsService, useValue: settings },
                { provide: getQueueToken('email'), useValue: emailQueue },
                { provide: ResendProvider, useValue: resendProvider },
                { provide: SmtpProvider, useValue: smtpProvider },
                { provide: GmailProvider, useValue: gmailProvider },
                { provide: ErrorLoggerService, useValue: errorLogger },
            ],
        }).compile();

        service = module.get<EmailService>(EmailService);
        // Manually set provider since onModuleInit isn't called automatically in unit tests
        (service as any).provider = resendProvider;
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    describe('enqueueEmail', () => {
        it('should enqueue email when user has no preference', async () => {
            prisma.user.findUnique.mockResolvedValue({ id: 'u1', email: 'test@example.com' });
            prisma.emailPreference.findUnique.mockResolvedValue(null);
            prisma.emailLog.create.mockResolvedValue({ id: 'log-1' });
            emailQueue.add.mockResolvedValue({ id: 'job-1' });

            await service.enqueueEmail({
                template: 'ticket-created',
                to: 'test@example.com',
                subject: 'Test',
                data: { ticketNumber: 'SUP-00001' },
            });

            expect(prisma.emailLog.create).toHaveBeenCalled();
            expect(emailQueue.add).toHaveBeenCalledWith(
                'ticket-created',
                expect.objectContaining({ to: 'test@example.com', logRef: 'log-1' }),
                expect.objectContaining({ priority: 3, attempts: 5 }),
            );
        });

        it('should skip email when user opted out', async () => {
            prisma.user.findUnique.mockResolvedValue({ id: 'u1', email: 'test@example.com' });
            prisma.emailPreference.findUnique.mockResolvedValue({ enabled: false });

            await service.enqueueEmail({
                template: 'ticket-created',
                to: 'test@example.com',
                subject: 'Test',
                data: {},
            });

            expect(emailQueue.add).not.toHaveBeenCalled();
            expect(prisma.emailLog.create).not.toHaveBeenCalled();
        });

        it('should skip preference check for non-registered users', async () => {
            prisma.user.findUnique.mockResolvedValue(null);
            prisma.emailLog.create.mockResolvedValue({ id: 'log-1' });
            emailQueue.add.mockResolvedValue({ id: 'job-1' });

            await service.enqueueEmail({
                template: 'welcome-customer',
                to: 'guest@example.com',
                subject: 'Welcome',
                data: {},
            });

            expect(prisma.emailPreference.findUnique).not.toHaveBeenCalled();
            expect(emailQueue.add).toHaveBeenCalled();
        });

        it('should pass priority and delay options', async () => {
            prisma.user.findUnique.mockResolvedValue(null);
            prisma.emailLog.create.mockResolvedValue({ id: 'log-1' });
            emailQueue.add.mockResolvedValue({ id: 'job-1' });

            await service.enqueueEmail({
                template: 'ticket-created',
                to: 'test@example.com',
                subject: 'Test',
                priority: 0,
                delay: 60000,
                jobId: 'custom-job-id',
                data: {},
            });

            expect(emailQueue.add).toHaveBeenCalledWith(
                expect.any(String),
                expect.any(Object),
                expect.objectContaining({ priority: 0, delay: 60000, jobId: 'custom-job-id' }),
            );
        });

        it('should log error and throw on enqueue failure', async () => {
            prisma.user.findUnique.mockResolvedValue(null);
            prisma.emailLog.create.mockRejectedValue(new Error('DB error'));

            await expect(
                service.enqueueEmail({ template: 'ticket-created', to: 'test@example.com', subject: 'Test', data: {} }),
            ).rejects.toThrow('DB error');
            expect(errorLogger.logError).toHaveBeenCalled();
        });
    });

    describe('cancelEmail', () => {
        it('should remove pending job', async () => {
            const mockJob = { remove: jest.fn() };
            emailQueue.getJob.mockResolvedValue(mockJob);

            const result = await service.cancelEmail('job-1');

            expect(result).toBe(true);
            expect(mockJob.remove).toHaveBeenCalled();
        });

        it('should return false if job not found', async () => {
            emailQueue.getJob.mockResolvedValue(null);
            const result = await service.cancelEmail('job-1');
            expect(result).toBe(false);
        });
    });

    describe('healthCheck', () => {
        it('should return provider availability', async () => {
            const result = await service.healthCheck();
            // Mocked providers don't match instanceof, so provider is 'unknown'
            expect(result.available).toBe(true);
            expect(result.provider).toBeDefined();
        });
    });

    describe('switchProvider', () => {
        it('should switch to smtp provider', async () => {
            settings.getValue.mockResolvedValue('smtp');
            const result = await service.switchProvider('smtp');
            expect(settings.upsert).toHaveBeenCalledWith({ key: 'email.active_provider', value: 'smtp' });
            expect(result.provider).toBe('smtp');
        });
    });

    describe('convenience send methods', () => {
        beforeEach(() => {
            prisma.user.findUnique.mockResolvedValue(null);
            prisma.emailLog.create.mockResolvedValue({ id: 'log-1' });
            emailQueue.add.mockResolvedValue({ id: 'job-1' });
        });

        it('sendTicketCreated should enqueue with correct template', async () => {
            await service.sendTicketCreated({ customerEmail: 'c@example.com', ticketNumber: 'SUP-00001' });
            expect(emailQueue.add).toHaveBeenCalledWith(
                'ticket-created',
                expect.any(Object),
                expect.any(Object),
            );
        });

        it('sendPasswordReset should enqueue with correct template', async () => {
            await service.sendPasswordReset({ recipientEmail: 'u@example.com' });
            expect(emailQueue.add).toHaveBeenCalledWith(
                'password-reset',
                expect.any(Object),
                expect.any(Object),
            );
        });

        it('sendSecurityAlert should enqueue with priority 0', async () => {
            await service.sendSecurityAlert({ recipientEmail: 'u@example.com' });
            expect(emailQueue.add).toHaveBeenCalledWith(
                'security-alert',
                expect.any(Object),
                expect.objectContaining({ priority: 0 }),
            );
        });
    });
});
