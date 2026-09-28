import { UnauthorizedException } from '@nestjs/common';
import { WhatsAppWebhookSignatureGuard } from './whatsapp-webhook-signature.guard';
import * as crypto from 'crypto';

function buildContext(headers: Record<string, string>, body: any) {
    return {
        switchToHttp: () => ({
            getRequest: () => ({ headers, body }),
        }),
    } as any;
}

describe('WhatsAppWebhookSignatureGuard', () => {
    const settings = { getValue: jest.fn() };
    const config = { get: jest.fn() };
    let guard: WhatsAppWebhookSignatureGuard;

    beforeEach(() => {
        jest.clearAllMocks();
        settings.getValue.mockResolvedValue('whatsapp-secret');
        config.get.mockReturnValue(undefined);
        guard = new WhatsAppWebhookSignatureGuard(config as any, settings as any);
    });

    it('allows a Meta webhook request with a valid X-Hub-Signature-256 header', async () => {
        const body = { entry: [{ changes: [{ value: { messages: [{ from: '905551234567' }] } }] }] };
        const signature = crypto
            .createHmac('sha256', 'whatsapp-secret')
            .update(JSON.stringify(body))
            .digest('hex');

        await expect(
            guard.canActivate(buildContext({ 'x-hub-signature-256': `sha256=${signature}` }, body)),
        ).resolves.toBe(true);
    });

    it('rejects missing signatures', async () => {
        await expect(
            guard.canActivate(buildContext({}, { entry: [] })),
        ).rejects.toThrow(UnauthorizedException);
    });

    it('rejects invalid signatures', async () => {
        await expect(
            guard.canActivate(buildContext({ 'x-hub-signature-256': 'sha256=bad' }, { entry: [] })),
        ).rejects.toThrow(UnauthorizedException);
    });
});
