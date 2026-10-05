import { TemplateService } from './email.templates';

describe('CSAT transactional email template', () => {
    it.each(['tr', 'en'])('renders a labeled working feedback CTA in %s', (locale) => {
        const compiled = TemplateService.compile('csat-survey', {
            locale,
            ticketNumber: 'SUP-SYNTHETIC',
            surveyUrl: 'https://support.example.test/tr/feedback/signed.synthetic.token',
            dynamicSubject: 'Synthetic CSAT',
        });

        expect(compiled.html).toContain('href="https://support.example.test/tr/feedback/signed.synthetic.token"');
        expect(compiled.html).toContain(locale === 'tr' ? 'Değerlendirmenizi gönderin' : 'Submit your feedback');
        expect(compiled.html).toContain(locale === 'tr' ? 'Bağlantı 7 gün boyunca geçerlidir.' : 'This link is valid for 7 days.');
        expect(compiled.html).toContain(locale === 'tr' ? 'Geri bildiriminiz destek hizmetimizi geliştirmemize yardımcı olur.' : 'Your feedback helps us improve our support service.');
        expect(compiled.html).not.toContain('{{t.');
    });

    it('renders the persisted ticket category without a placeholder for an uncaptured type', () => {
        const compiled = TemplateService.compile('ticket-created', {
            locale: 'tr',
            ticketNumber: 'SUP-SYNTHETIC',
            ticketSubject: 'Synthetic licensing question',
            ticketCategory: 'Lisans ve Aktivasyon',
            ticketType: undefined,
            dynamicSubject: 'Synthetic ticket',
        });

        expect(compiled.html).toContain('Lisans ve Aktivasyon');
        expect(compiled.html).not.toContain('Kategori: -');
        expect(compiled.html).not.toContain('Tür: -');
    });

    it('includes the same category in staff alerts and omits an uncaptured type', () => {
        const compiled = TemplateService.compile('staff-alert-new-ticket', {
            locale: 'tr',
            ticketNumber: 'SUP-SYNTHETIC',
            ticketSubject: 'Synthetic licensing question',
            ticketCategory: 'Lisans ve Aktivasyon',
            ticketType: undefined,
            ticketId: 'synthetic-id',
            dynamicSubject: 'Synthetic ticket',
        });

        expect(compiled.html).toContain('Lisans ve Aktivasyon');
        expect(compiled.html).not.toContain('Kategori: -');
        expect(compiled.html).not.toContain('Tür: -');
    });
});
