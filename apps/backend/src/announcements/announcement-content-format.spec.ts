import { detectAnnouncementContentFormat } from './announcement-content-format';

describe('detectAnnouncementContentFormat', () => {
    it('detects a full <mjml> document as MJML', () => {
        expect(detectAnnouncementContentFormat('<mjml><mj-body></mj-body></mjml>')).toBe('MJML');
    });

    it('detects a bare <mj-section> fragment as MJML', () => {
        expect(detectAnnouncementContentFormat('<mj-section><mj-text>Hi</mj-text></mj-section>')).toBe('MJML');
    });

    it('is case-insensitive and tolerant of leading whitespace', () => {
        expect(detectAnnouncementContentFormat('   <MJML><mj-body></mj-body></MJML>')).toBe('MJML');
    });

    it('classifies plain rich-text HTML (the common case from the editor) as RICH_HTML', () => {
        expect(detectAnnouncementContentFormat('<p>Merhaba {{customer.firstName}}!</p>')).toBe('RICH_HTML');
    });

    it('classifies empty content as RICH_HTML (matches the existing default announcement content)', () => {
        expect(detectAnnouncementContentFormat('')).toBe('RICH_HTML');
    });

    it('classifies content that merely mentions "mjml" in text, not as a tag, as RICH_HTML', () => {
        expect(detectAnnouncementContentFormat('<p>We migrated from mjml to a rich editor.</p>')).toBe('RICH_HTML');
    });
});
