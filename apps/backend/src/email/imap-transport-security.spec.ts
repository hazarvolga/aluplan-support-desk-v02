import imaps from 'imap-simple';
import { EmailInboundService } from './email-inbound.service';
import { SettingsService } from '../settings/settings.service';

jest.mock('imap-simple', () => ({ __esModule: true, default: { connect: jest.fn() } }));
jest.mock('mailparser', () => ({ simpleParser: jest.fn() }));
jest.mock('@aluplan/database', () => ({ CommunicationChannel: { EMAIL: 'EMAIL' } }), { virtual: true });
jest.mock('../prisma/prisma.service', () => ({ PrismaService: class {} }));
jest.mock('../settings/settings.service', () => ({ SettingsService: class {} }));
jest.mock('../tickets/tickets.service', () => ({ TicketsService: class {} }));
jest.mock('../common/services/storage.service', () => ({ StorageService: class {} }));
jest.mock('../common/services/pii-masking.service', () => ({ PiiMaskingService: class {} }));

describe('IMAP transport security', () => {
    const connect = jest.mocked(imaps.connect);
    let values: Record<string, string>;
    let service: EmailInboundService;
    let end: jest.Mock;
    let getValue: jest.Mock;

    beforeEach(() => {
        jest.resetAllMocks();
        values = {
            'email.imap.host': 'imap.example.invalid',
            'email.imap.port': '993',
            'email.imap.tls': 'true',
            'email.imap.user': 'test-user',
            'email.imap.pass': 'test-password',
        };
        getValue = jest.fn(async (key: string) => values[key]);
        service = new EmailInboundService(
            {} as never,
            { getValue } as unknown as SettingsService,
            {} as never, {} as never, {} as never,
        );
        end = jest.fn();
        connect.mockResolvedValue({ end } as never);
    });

    it('verifies using direct TLS with a validated certificate', async () => {
        await expect(service.verifyImap()).resolves.toEqual({ available: true, message: 'Connection successful' });
        expect(connect).toHaveBeenCalledWith({ imap: expect.objectContaining({
            port: 993, tls: true,
            tlsOptions: expect.objectContaining({ rejectUnauthorized: true, minVersion: 'TLSv1.2' }),
        }) });
        expect(end).toHaveBeenCalledTimes(1);
    });

    it('rejects plaintext configuration before connecting or authenticating', async () => {
        values = { ...values, 'email.imap.port': '143', 'email.imap.tls': 'false' };
        await expect(service.verifyImap()).resolves.toEqual({ available: false, message: expect.stringMatching(/TLS/) });
        expect(connect).not.toHaveBeenCalled();
        expect(getValue).not.toHaveBeenCalledWith('email.imap.user');
        expect(getValue).not.toHaveBeenCalledWith('email.imap.pass');
    });

    it('also rejects plaintext configuration in the scheduled inbound path', async () => {
        values = { ...values, 'email.imap.port': '143', 'email.imap.tls': 'false' };
        await expect(service.handleInboundEmails()).resolves.toBeUndefined();
        expect(connect).not.toHaveBeenCalled();
    });

    it('allows the next scheduled attempt after an invalid TLS configuration is corrected', async () => {
        values = { ...values, 'email.imap.tls': 'false' };
        await service.handleInboundEmails();
        expect(connect).not.toHaveBeenCalled();

        values = { ...values, 'email.imap.tls': 'true' };
        const openBox = jest.fn().mockResolvedValue({});
        const search = jest.fn().mockResolvedValue([]);
        connect.mockResolvedValue({ end, openBox, search } as never);
        await service.handleInboundEmails();
        expect(connect).toHaveBeenCalledTimes(1);
        expect(openBox).toHaveBeenCalledWith('INBOX');
        expect(end).toHaveBeenCalledTimes(1);
    });

    it('defaults missing TLS and port settings to direct TLS on port 993', async () => {
        values = { 'email.imap.host': 'imap.example.invalid' };
        await service.verifyImap();
        expect(connect).toHaveBeenCalledWith({ imap: expect.objectContaining({ port: 993, tls: true }) });
    });

    it('reports certificate failure without falling back to another connection', async () => {
        connect.mockRejectedValue(new Error('certificate rejected'));
        await expect(service.verifyImap()).resolves.toEqual({ available: false, message: 'certificate rejected' });
        expect(connect).toHaveBeenCalledTimes(1);
    });

    it('does not connect when IMAP is unconfigured', async () => {
        values = {};
        await expect(service.verifyImap()).resolves.toEqual({ available: false, message: 'IMAP not configured' });
        expect(connect).not.toHaveBeenCalled();
    });
});
