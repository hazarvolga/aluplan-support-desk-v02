import nodemailer from 'nodemailer';
import { SettingsService } from '../settings/settings.service';
import { SmtpProvider } from './smtp.provider';

jest.mock('nodemailer', () => ({ __esModule: true, default: { createTransport: jest.fn() } }));
jest.mock('../settings/settings.service', () => ({ SettingsService: class {} }));

describe('SMTP transport security', () => {
    const createTransport = jest.mocked(nodemailer.createTransport);
    let values: Record<string, string>;
    let provider: SmtpProvider;
    let sendMail: jest.Mock;
    let verify: jest.Mock;

    beforeEach(() => {
        jest.resetAllMocks();
        values = {
            'email.smtp.host': 'smtp.example.invalid',
            'email.smtp.port': '587',
            'email.smtp.secure': 'false',
            'email.smtp.user': 'test-user',
            'email.smtp.pass': 'test-password',
        };
        provider = new SmtpProvider({ getValue: jest.fn(async (key: string) => values[key]) } as unknown as SettingsService);
        sendMail = jest.fn().mockResolvedValue({ messageId: 'test-message' });
        verify = jest.fn().mockResolvedValue(true);
        createTransport.mockReturnValue({ sendMail, verify } as unknown as nodemailer.Transporter);
    });

    it.each(['send', 'healthCheck'] as const)('%s requires STARTTLS and validates the certificate on port 587', async (operation) => {
        if (operation === 'send') {
            await expect(provider.send({ to: 'recipient@example.invalid', subject: 'Test', html: '<p>Test</p>', text: 'Test' })).resolves.toEqual({ messageId: 'test-message' });
        } else {
            await expect(provider.healthCheck()).resolves.toBe(true);
        }
        expect(createTransport).toHaveBeenCalledWith(expect.objectContaining({
            port: 587, secure: false, requireTLS: true,
            tls: expect.objectContaining({ rejectUnauthorized: true, minVersion: 'TLSv1.2' }),
        }));
    });

    it('retains implicit TLS on port 465 with certificate validation', async () => {
        values = { ...values, 'email.smtp.port': '465', 'email.smtp.secure': 'true' };
        await provider.healthCheck();
        expect(createTransport).toHaveBeenCalledWith(expect.objectContaining({
            port: 465, secure: true,
            tls: expect.objectContaining({ rejectUnauthorized: true, minVersion: 'TLSv1.2' }),
        }));
    });

    it('does not retry a failed send with weaker transport options', async () => {
        sendMail.mockRejectedValue(new Error('certificate rejected'));
        await expect(provider.send({ to: 'recipient@example.invalid', subject: 'Test', html: '<p>Test</p>', text: 'Test' })).rejects.toThrow('certificate rejected');
        expect(createTransport).toHaveBeenCalledTimes(1);
        expect(sendMail).toHaveBeenCalledTimes(1);
    });

    it('surfaces health check TLS failures without reporting success', async () => {
        verify.mockRejectedValue(new Error('STARTTLS unavailable'));
        await expect(provider.healthCheck()).rejects.toThrow('STARTTLS unavailable');
        expect(createTransport).toHaveBeenCalledTimes(1);
    });

    it('does not create a transport when SMTP is unconfigured', async () => {
        values = {};
        await expect(provider.healthCheck()).resolves.toBe(false);
        await expect(provider.send({ to: 'recipient@example.invalid', subject: 'Test', html: '<p>Test</p>', text: 'Test' })).rejects.toThrow('SMTP not configured');
        expect(createTransport).not.toHaveBeenCalled();
    });
});
