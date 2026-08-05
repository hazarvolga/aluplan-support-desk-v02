import { UnauthorizedException } from '@nestjs/common';
import { InboundEmailWebhookSignatureGuard } from './inbound-email-webhook-signature.guard';
import * as crypto from 'crypto';

function buildContext(headers: Record<string, string>, body: any) {
    return {
        switchToHttp: () => ({
            getRequest: () => ({ headers, body }),
        }),
    } as any;
}

describe('InboundEmailWebhookSignatureGuard', () => {
    const settings = { getValue: jest.fn() };
    const config = { get: jest.fn() };
    let guard: InboundEmailWebhookSignatureGuard;

    beforeEach(() => {
        jest.clearAllMocks();
        settings.getValue.mockResolvedValue('inbound-secret');
        config.get.mockReturnValue(undefined);
        guard = new InboundEmailWebhookSignatureGuard(config as any, settings as any);
    });

    it('allows an inbound email webhook request with a valid HMAC signature', async () => {
        const body = { from: 'customer@example.com', subject: 'SUP-1', text: 'Reply' };
        const signature = crypto
            .createHmac('sha256', 'inbound-secret')
            .update(JSON.stringify(body))
            .digest('hex');

        await expect(
            guard.canActivate(buildContext({ 'x-webhook-signature': signature }, body)),
        ).resolves.toBe(true);
    });

    it('accepts sha256-prefixed signatures', async () => {
        const body = { from: 'customer@example.com', subject: 'SUP-1', text: 'Reply' };
        const signature = crypto
            .createHmac('sha256', 'inbound-secret')
            .update(JSON.stringify(body))
            .digest('hex');

        await expect(
            guard.canActivate(buildContext({ 'x-webhook-signature': `sha256=${signature}` }, body)),
        ).resolves.toBe(true);
    });

    it('rejects missing signatures', async () => {
        await expect(
            guard.canActivate(buildContext({}, { from: 'customer@example.com' })),
        ).rejects.toThrow(UnauthorizedException);
    });

    it('rejects invalid signatures', async () => {
        await expect(
            guard.canActivate(buildContext({ 'x-webhook-signature': 'bad' }, { from: 'customer@example.com' })),
        ).rejects.toThrow(UnauthorizedException);
    });
});
