import express, { Request } from 'express';
import request from 'supertest';
import { signedWebhookJsonParser } from './signed-webhook-json-parser';

describe('signedWebhookJsonParser', () => {
    const app = express();
    app.use(signedWebhookJsonParser);
    app.post(/.*/, (req, res) => {
        const rawBody = (req as Request & { rawBody?: Buffer }).rawBody;
        res.json({ parsed: req.body, raw: rawBody?.toString('utf8') ?? null });
    });

    it.each([
        '/api/v1/crm/webhooks/dynamics365',
        '/api/v1/whatsapp/webhook',
        '/api/v1/omni-channel/webhook/email',
        '/api/v1/email/webhook/resend',
    ])('preserves exact bytes for %s', async (path) => {
        const raw = ' { "value" : 1 } ';
        const response = await request(app)
            .post(`${path}?source=test`)
            .set('content-type', 'application/json')
            .send(raw)
            .expect(200);

        expect(response.body).toEqual({ parsed: { value: 1 }, raw });
    });

    it('does not duplicate ordinary request bodies', async () => {
        const response = await request(app)
            .post('/api/v1/tickets')
            .send({ value: 1 })
            .expect(200);

        expect(response.body).toEqual({ parsed: { value: 1 }, raw: null });
    });
});
