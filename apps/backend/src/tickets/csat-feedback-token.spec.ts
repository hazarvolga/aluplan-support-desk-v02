import { generateCsatFeedbackToken, verifyCsatFeedbackToken } from './csat-feedback-token';

describe('CSAT feedback link tokens', () => {
    it('round-trips a ticket-scoped token before its expiry', () => {
        const ticketId = 'bfaa5692-5b7d-40fb-94fd-b6ac12abaaff';
        const secret = 'synthetic-purpose-specific-secret';
        const expiresAt = 1_800_000_000;

        const token = generateCsatFeedbackToken(ticketId, expiresAt, secret);

        expect(verifyCsatFeedbackToken(token, secret, expiresAt - 1)).toBe(ticketId);
    });

    it('rejects a token whose ticket scope or signature was altered', () => {
        const ticketId = 'bfaa5692-5b7d-40fb-94fd-b6ac12abaaff';
        const otherTicketId = '9d5e9ea2-a43b-4bd1-9950-4396bc4c168a';
        const secret = 'synthetic-purpose-specific-secret';
        const token = generateCsatFeedbackToken(ticketId, 1_800_000_000, secret);

        expect(verifyCsatFeedbackToken(token.replace(ticketId, otherTicketId), secret, 1_700_000_000)).toBeNull();
        expect(verifyCsatFeedbackToken(token, 'different-purpose-specific-secret', 1_700_000_000)).toBeNull();
    });
});
