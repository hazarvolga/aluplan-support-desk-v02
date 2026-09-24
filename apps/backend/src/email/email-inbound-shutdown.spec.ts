import { Test } from '@nestjs/testing';
import imaps from 'imap-simple';
import { EmailInboundService } from './email-inbound.service';
import { PrismaService } from '../prisma/prisma.service';
import { SettingsService } from '../settings/settings.service';
import { TicketsService } from '../tickets/tickets.service';
import { StorageService } from '../common/services/storage.service';
import { PiiMaskingService } from '../common/services/pii-masking.service';

jest.mock('imap-simple', () => ({ __esModule: true, default: { connect: jest.fn() } }));
jest.mock('mailparser', () => ({ simpleParser: jest.fn() }));
jest.mock('../prisma/prisma.service', () => ({ PrismaService: class {} }));
jest.mock('../settings/settings.service', () => ({ SettingsService: class {} }));
jest.mock('../tickets/tickets.service', () => ({ TicketsService: class {} }));
jest.mock('../common/services/storage.service', () => ({ StorageService: class {} }));
jest.mock('../common/services/pii-masking.service', () => ({ PiiMaskingService: class {} }));
jest.mock('@aluplan/database', () => ({ CommunicationChannel: { EMAIL: 'EMAIL' } }));

function deferred<T>() {
    let resolve!: (value: T) => void;
    const promise = new Promise<T>((complete) => { resolve = complete; });
    return { promise, resolve };
}

// Passing tests characterize a shutdown defect, NOT safe-drain acceptance.
// Nest lifecycle is real; Prisma's destroy hook and IMAP are synthetic.
// The full application's module ordering and signal handling are not exercised.
describe('inbound shutdown gap characterization', () => {
    afterEach(() => jest.resetAllMocks());

    it.each(['configuration', 'cleanup'] as const)(
        'Nest close completes while inbound %s is pending, and does not fence subsequent polls',
        async (phase) => {
            const entered = deferred<void>();
            const release = deferred<void>();
            const events: string[] = [];
            const connection = {
                openBox: jest.fn().mockResolvedValue({ uidvalidity: 1 }),
                search: jest.fn().mockResolvedValue([]),
                end: jest.fn().mockImplementation(async () => {
                    if (phase === 'cleanup') {
                        entered.resolve(undefined);
                        await release.promise;
                    }
                    events.push('cleanup-complete');
                }),
            };
            const settings = {
                getValue: jest.fn().mockImplementation(async (key: string) => {
                    if (key !== 'email.imap.host') return undefined;
                    if (phase === 'configuration') {
                        entered.resolve(undefined);
                        await release.promise;
                    }
                    return 'imap.example.invalid';
                }),
            };
            const prisma = {
                onModuleDestroy: jest.fn().mockImplementation(async () => {
                    events.push('synthetic-prisma-disconnect');
                }),
            };
            (imaps.connect as jest.Mock).mockResolvedValue(connection);
            const module = await Test.createTestingModule({
                providers: [
                    EmailInboundService,
                    { provide: PrismaService, useValue: prisma },
                    { provide: SettingsService, useValue: settings },
                    { provide: TicketsService, useValue: {} },
                    { provide: StorageService, useValue: {} },
                    { provide: PiiMaskingService, useValue: {} },
                ],
            }).compile();
            await module.init();
            const service = module.get(EmailInboundService);
            let pollFinished = false;
            let closing: Promise<void> | undefined;
            const poll = service.handleInboundEmails().then(() => { pollFinished = true; });
            try {
                await entered.promise;
                closing = module.close();
                const closedBeforeRelease = await Promise.race([
                    closing.then(() => true),
                    new Promise<boolean>((resolve) => setImmediate(() => resolve(false))),
                ]);
                expect(closedBeforeRelease).toBe(true);

                expect(prisma.onModuleDestroy).toHaveBeenCalledTimes(1);
                expect(pollFinished).toBe(false);
                expect(events).toEqual(['synthetic-prisma-disconnect']);

                release.resolve(undefined);
                await poll;
                await closing;
                expect(events).toEqual(['synthetic-prisma-disconnect', 'cleanup-complete']);
                expect(connection.end).toHaveBeenCalledTimes(1);

                // A direct scheduler callback still starts new work after lifecycle close.
                await service.handleInboundEmails();
                expect(imaps.connect).toHaveBeenCalledTimes(2);
                expect(connection.end).toHaveBeenCalledTimes(2);
            } finally {
                release.resolve(undefined);
                await poll;
                await closing;
            }
        },
    );
});
