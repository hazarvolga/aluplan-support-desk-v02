import { IS_PUBLIC_KEY } from '../auth/decorators/public.decorator';
import { WhatsAppWebhookSignatureGuard } from './guards/whatsapp-webhook-signature.guard';
import { WhatsAppController } from './whatsapp.controller';

describe('WhatsAppController webhook metadata', () => {
    it('keeps webhook verification public', () => {
        expect(
            Reflect.getMetadata(IS_PUBLIC_KEY, WhatsAppController.prototype.verifyWebhook),
        ).toBe(true);
    });

    it('keeps incoming message webhook public while retaining signature guard', () => {
        const publicMetadata = Reflect.getMetadata(
            IS_PUBLIC_KEY,
            WhatsAppController.prototype.handleWebhook,
        );
        const guards = Reflect.getMetadata(
            '__guards__',
            WhatsAppController.prototype.handleWebhook,
        );

        expect(publicMetadata).toBe(true);
        expect(guards).toContain(WhatsAppWebhookSignatureGuard);
    });
});
