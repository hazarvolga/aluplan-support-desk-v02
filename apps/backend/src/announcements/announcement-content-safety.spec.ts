import {
    assertAnnouncementContentIsSafeToSend,
    extractHandlebarsVariablePaths,
    findLeftoverBracketPlaceholders,
    findUnknownCustomerVariables,
    renderAnnouncementSubject,
} from './announcement-content-safety';
import { buildAnnouncementEmailContext } from './announcement-email-context';

describe('extractHandlebarsVariablePaths', () => {
    it('extracts a simple mustache variable', () => {
        expect(extractHandlebarsVariablePaths('Merhaba {{customer.firstName}}')).toEqual([
            'customer.firstName',
        ]);
    });

    it('extracts multiple distinct variables without duplicates', () => {
        const paths = extractHandlebarsVariablePaths(
            '{{customer.firstName}} {{customer.lastName}} {{customer.firstName}}',
        );
        expect(paths.sort()).toEqual(['customer.firstName', 'customer.lastName']);
    });

    it('extracts the condition variable from a block helper but not the helper name itself', () => {
        const paths = extractHandlebarsVariablePaths(
            '{{#if customer.companyName}}{{customer.companyName}}{{/if}}',
        );
        expect(paths).toEqual(['customer.companyName']);
    });

    it('ignores plain text with no Handlebars syntax', () => {
        expect(extractHandlebarsVariablePaths('Hello, no variables here.')).toEqual([]);
    });

    it('ignores @index/@key style data variables', () => {
        const paths = extractHandlebarsVariablePaths('{{#each items}}{{@index}}{{/each}}');
        expect(paths).not.toContain('@index');
    });
});

describe('findUnknownCustomerVariables', () => {
    it('returns an empty list when all customer.* paths are known', () => {
        const unknown = findUnknownCustomerVariables([
            'customer.firstName',
            'customer.lastName',
            'customer.fullName',
            'customer.companyName',
            'customer.customerNo',
            'customer.email',
            'customer.userEmail',
        ]);
        expect(unknown).toEqual([]);
    });

    it('flags a typo\'d customer field (the exact GAP-03 failure mode)', () => {
        const unknown = findUnknownCustomerVariables(['customer.fullname']);
        expect(unknown).toEqual(['customer.fullname']);
    });

    it('flags customer.name, first_name style legacy fields', () => {
        const unknown = findUnknownCustomerVariables(['customer.name', 'customer.first_name']);
        expect(unknown.sort()).toEqual(['customer.first_name', 'customer.name']);
    });

    it('does not flag non-customer paths (brand.*, unsubscribe_url)', () => {
        const unknown = findUnknownCustomerVariables(['brand.name', 'unsubscribe_url']);
        expect(unknown).toEqual([]);
    });
});

describe('findLeftoverBracketPlaceholders', () => {
    it('finds a single bracket placeholder', () => {
        expect(findLeftoverBracketPlaceholders('Tahmini Yayın: [Tarih]')).toEqual(['[Tarih]']);
    });

    it('finds multiple distinct placeholders', () => {
        const found = findLeftoverBracketPlaceholders('[Şirket Adı] için [Özellik Adı] yakında.');
        expect(found.sort()).toEqual(['[Özellik Adı]', '[Şirket Adı]'].sort());
    });

    it('returns an empty list for content with no bracket placeholders', () => {
        expect(findLeftoverBracketPlaceholders('Merhaba {{customer.firstName}}, güncelleme var.')).toEqual([]);
    });

    it('does not flag a lone closing or opening bracket', () => {
        expect(findLeftoverBracketPlaceholders('a ] b [ c')).toEqual([]);
    });
});

describe('assertAnnouncementContentIsSafeToSend', () => {
    it('does not throw for clean subject and content', () => {
        expect(() => assertAnnouncementContentIsSafeToSend(
            'Merhaba {{customer.firstName}}!',
            '<mj-text>Sayın {{customer.fullName}}, {{customer.companyName}} için güncelleme.</mj-text>',
        )).not.toThrow();
    });

    it('throws when the subject contains a leftover bracket placeholder', () => {
        expect(() => assertAnnouncementContentIsSafeToSend(
            'Yakında: [Özellik Adı]',
            '<mj-text>Merhaba {{customer.firstName}}</mj-text>',
        )).toThrow();
    });

    it('throws when the content contains a leftover bracket placeholder', () => {
        expect(() => assertAnnouncementContentIsSafeToSend(
            'Merhaba {{customer.firstName}}',
            '<mj-text>Tahmini Yayın: [Tarih]</mj-text>',
        )).toThrow();
    });

    it('throws when the subject references an unknown customer variable', () => {
        expect(() => assertAnnouncementContentIsSafeToSend(
            'Merhaba {{customer.fullname}}',
            '<mj-text>OK</mj-text>',
        )).toThrow();
    });

    it('throws when the content references an unknown customer variable', () => {
        expect(() => assertAnnouncementContentIsSafeToSend(
            'OK',
            '<mj-text>Merhaba {{customer.name}}</mj-text>',
        )).toThrow();
    });
});

describe('renderAnnouncementSubject', () => {
    it('renders known customer variables in the subject', () => {
        const context = buildAnnouncementEmailContext({
            firstName: 'Ada',
            lastName: 'Lovelace',
            companyName: 'Analytical Engines Ltd',
            customerNo: 'CUST-001',
            user: { email: 'ada@example.com' },
        });

        const subject = renderAnnouncementSubject('Merhaba {{customer.firstName}}, ürün güncellemesi', context);
        expect(subject).toBe('Merhaba Ada, ürün güncellemesi');
    });

    it('renders a static subject unchanged when it has no variables', () => {
        const context = buildAnnouncementEmailContext({
            firstName: 'Ada',
            lastName: 'Lovelace',
            companyName: 'Analytical Engines Ltd',
            customerNo: 'CUST-001',
            user: { email: 'ada@example.com' },
        });

        expect(renderAnnouncementSubject('Sistem Bakım Duyurusu', context)).toBe('Sistem Bakım Duyurusu');
    });

    it('does not HTML-escape special characters (subject is plain text, not HTML)', () => {
        const context = buildAnnouncementEmailContext({
            firstName: 'A & B',
            lastName: 'Co',
            companyName: 'A & B Co',
            customerNo: 'CUST-002',
            user: { email: 'ab@example.com' },
        });

        const subject = renderAnnouncementSubject('Merhaba {{customer.firstName}}', context);
        expect(subject).toBe('Merhaba A & B');
    });
});
