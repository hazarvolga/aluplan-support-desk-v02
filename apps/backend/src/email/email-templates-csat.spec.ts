import { TemplateService } from './email.templates';

describe('CSAT transactional email template', () => {
    it('describes a proposed solution without claiming the request is closed', () => {
        const compiled = TemplateService.compile('ticket-closed', { locale: 'tr', isReviewPending: true, ticketNumber: 'SUP-SYNTHETIC' });
        expect(compiled.html).toContain('Çözüm onayınızı bekliyor');
        expect(compiled.html).toContain('Çözümü onaylayarak talebinizi kapatın');
        expect(compiled.html).not.toContain('başarıyla çözüldü ve kapatıldı');
    });
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
        expect(compiled.html).toContain(locale === 'tr' ? 'Puan vermek isteğe bağlıdır' : 'Rating is optional');
        expect(compiled.html).not.toContain(locale === 'tr' ? 'başarıyla çözüldü ve kapatıldı' : 'successfully resolved and closed');
    });

    it.each([
        ['isReviewPending', 'Çözümü onaylayarak talebinizi kapatın'],
        ['isReviewReminder', 'Beş günlük yanıt süresinin dolmasına bir gün kaldı'],
        ['isAutoClosed', 'Beş gün boyunca yanıt alınamadığı için'],
    ])('explains the %s lifecycle action', (flag, text) => {
        const compiled = TemplateService.compile('ticket-status-changed', {
            locale: 'tr', ticketNumber: 'SUP-SYNTHETIC', [flag]: true,
            ticketUrl: 'https://support.example.test/tr/tickets/synthetic',
        });
        expect(compiled.html).toContain(text);
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
