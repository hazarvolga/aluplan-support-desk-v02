import { json, Request } from 'express';

const SIGNED_WEBHOOK_PATHS = new Set([
    '/crm/webhooks/dynamics365',
    '/whatsapp/webhook',
    '/omni-channel/webhook/email',
    '/email/webhook/resend',
]);

export const signedWebhookJsonParser = json({
    limit: '10mb',
    verify: (req, _res, body) => {
        const request = req as Request & { rawBody?: Buffer };
        const path = request.originalUrl.split('?')[0].replace(/\/$/, '').replace(/^\/api\/v1(?=\/)/, '');
        if (SIGNED_WEBHOOK_PATHS.has(path)) {
            request.rawBody = Buffer.from(body);
        }
    },
});
