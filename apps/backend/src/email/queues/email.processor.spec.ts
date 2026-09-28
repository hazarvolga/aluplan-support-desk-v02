import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { EmailProcessor } from './email.processor';
import { PrismaService } from '../../prisma/prisma.service';
import { SettingsService } from '../../settings/settings.service';
import { ResendProvider } from '../resend.provider';
import { SmtpProvider } from '../smtp.provider';
import { GmailProvider } from '../gmail.provider';
import { TemplateService } from '../email.templates';

function buildPrismaMock() {
    return {
        emailLog: {
            update: jest.fn().mockResolvedValue({}),
            create: jest.fn().mockResolvedValue({}),
        },
    } as any;
}

function buildJob(overrides: { attemptsMade?: number; attempts?: number } = {}) {
    return {
        id: 'job-1',
        data: {
            template: 'ticket-created',
            to: 'user@example.com',
            subject: 'Test Subject',
            data: {},
            logRef: 'log-1',
        },
        // BullMQ semantics: attemptsMade reflects attempts completed BEFORE
        // the one currently running (0 on the very first try). Whether this
        // is the LAST allowed try is `attemptsMade + 1 >= opts.attempts`.
        attemptsMade: overrides.attemptsMade ?? 0,
        opts: { attempts: overrides.attempts ?? 5 },
    } as any;
}

describe('EmailProcessor', () => {
    let prisma: any;
    let processor: EmailProcessor;
    let provider: { send: jest.Mock };

    beforeEach(async () => {
        prisma = buildPrismaMock();
        provider = { send: jest.fn() };

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                EmailProcessor,
                { provide: PrismaService, useValue: prisma },
                { provide: SettingsService, useValue: { getValue: jest.fn().mockResolvedValue('') } },
                { provide: ResendProvider, useValue: provider },
                { provide: SmtpProvider, useValue: provider },
                { provide: GmailProvider, useValue: provider },
                { provide: ConfigService, useValue: { get: jest.fn() } },
            ],
        }).compile();

        processor = module.get<EmailProcessor>(EmailProcessor);
        jest.spyOn(TemplateService, 'compile').mockReturnValue({
            html: '<p>x</p>',
            text: 'x',
            subject: 'Compiled subject',
        });
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    it('marks EmailLog SENT on success', async () => {
        provider.send.mockResolvedValue({ messageId: 'msg-1' });

        await processor.process(buildJob());

        expect(prisma.emailLog.update).toHaveBeenCalledWith(
            expect.objectContaining({
                where: { id: 'log-1' },
                data: expect.objectContaining({ status: 'SENT', messageId: 'msg-1' }),
            }),
        );
    });

    // Codex independent review (2026-08-08): every failed attempt wrote
    // EmailLog=FAILED before re-throwing for BullMQ's own retry, so a
    // transient failure that later succeeded on retry left AnnouncementLog
    // permanently stuck on FAILED (the reconciliation cron only scans
    // QUEUED rows, so once terminalized it's never re-checked).
    describe('retry-aware failure handling (Codex finding, HIGH)', () => {
        it('does not mark EmailLog FAILED on a non-final attempt (more retries remain)', async () => {
            provider.send.mockRejectedValue(new Error('SMTP timeout'));
            // attemptsMade=0 means this is try #1 of 5 -- BullMQ will retry.
            const job = buildJob({ attemptsMade: 0, attempts: 5 });

            await expect(processor.process(job)).rejects.toThrow('SMTP timeout');

            expect(prisma.emailLog.update).not.toHaveBeenCalledWith(
                expect.objectContaining({ data: expect.objectContaining({ status: 'FAILED' }) }),
            );
        });

        it('still throws on a non-final attempt so BullMQ actually retries', async () => {
            provider.send.mockRejectedValue(new Error('SMTP timeout'));
            const job = buildJob({ attemptsMade: 0, attempts: 5 });

            await expect(processor.process(job)).rejects.toThrow('SMTP timeout');
        });

        it('marks EmailLog FAILED once the last allowed attempt fails', async () => {
            provider.send.mockRejectedValue(new Error('SMTP timeout'));
            // attemptsMade=4 + this (5th) try == attempts(5) -> no more retries.
            const job = buildJob({ attemptsMade: 4, attempts: 5 });

            await expect(processor.process(job)).rejects.toThrow('SMTP timeout');

            expect(prisma.emailLog.update).toHaveBeenCalledWith({
                where: { id: 'log-1' },
                data: { status: 'FAILED', error: 'SMTP timeout' },
            });
        });

        it('treats a job with no configured attempts as single-try (final on first failure)', async () => {
            provider.send.mockRejectedValue(new Error('boom'));
            const job = buildJob({ attemptsMade: 0 });
            job.opts = {};

            await expect(processor.process(job)).rejects.toThrow('boom');

            expect(prisma.emailLog.update).toHaveBeenCalledWith({
                where: { id: 'log-1' },
                data: { status: 'FAILED', error: 'boom' },
            });
        });
    });
});
