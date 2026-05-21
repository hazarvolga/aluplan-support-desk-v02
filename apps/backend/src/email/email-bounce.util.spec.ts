import { isDeliveryStatusNotification } from './email-bounce.util';

describe('isDeliveryStatusNotification', () => {
    it('detects DMARC aggregate/authentication reports before ticket creation', () => {
        expect(isDeliveryStatusNotification({
            from: 'dmarcreport@microsoft.com',
            subject: '[Preview] Report Domain: allplan.net.tr Submitter: enterprise.protection.outlook.com Report-ID: abc123',
            body: [
                'Feedback-Type: auth-failure',
                'report_id: abc123',
                'policy_published: p=none; adkim=s; aspf=s',
                'record: row source_ip count policy_evaluated',
            ].join('\n'),
            headers: new Map([
                ['content-type', 'multipart/report; report-type=feedback-report'],
                ['auto-submitted', 'auto-generated'],
            ]),
        })).toBe(true);
    });

    it('does not classify normal support questions as automated reports', () => {
        expect(isDeliveryStatusNotification({
            from: 'customer@example.com',
            subject: 'License server client cannot find server automatically',
            body: 'How can I add the license server manually on the client?',
            headers: { 'content-type': 'text/plain' },
        })).toBe(false);
    });
});
