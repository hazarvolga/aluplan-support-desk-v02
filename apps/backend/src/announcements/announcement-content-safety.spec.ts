import { BadRequestException } from '@nestjs/common';
import {
    assertAnnouncementContentIsSafeToSend,
    extractHandlebarsVariablePaths,
    findLeftoverBracketPlaceholders,
    findUnknownAnnouncementVariables,
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

    // Codex independent review (2026-08-08): the AST walker only visited
    // MustacheStatement.path/params and BlockStatement.params — SubExpression
    // arguments and Hash pairs were silently skipped, so a variable buried in
    // either form was invisible to the safety check.
    describe('SubExpression and Hash coverage (Codex finding, HIGH)', () => {
        it('extracts a variable used inside a SubExpression block condition', () => {
            const paths = extractHandlebarsVariablePaths(
                "{{#if (lookup customer 'name')}}x{{/if}}",
            );
            // `customer` itself (the lookup target) must be visible — this
            // proves the walker now descends into SubExpression params.
            expect(paths).toContain('customer');
        });

        it('extracts a variable passed as a Hash pair value on a mustache', () => {
            const paths = extractHandlebarsVariablePaths('{{log value=customer.fullname}}');
            expect(paths).toContain('customer.fullname');
        });

        it('extracts a variable passed as a Hash pair value on a block helper', () => {
            const paths = extractHandlebarsVariablePaths(
                '{{#with x=customer.fullname}}y{{/with}}',
            );
            expect(paths).toContain('customer.fullname');
        });

        it('extracts variables nested two SubExpressions deep', () => {
            const paths = extractHandlebarsVariablePaths(
                "{{#if (lookup (lookup customer 'nested') 'name')}}x{{/if}}",
            );
            expect(paths).toContain('customer');
        });
    });
});

describe('findUnknownAnnouncementVariables', () => {
    it('returns an empty list when all customer.* paths are known', () => {
        const unknown = findUnknownAnnouncementVariables([
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
        const unknown = findUnknownAnnouncementVariables(['customer.fullname']);
        expect(unknown).toEqual(['customer.fullname']);
    });

    it('flags customer.name, first_name style legacy fields', () => {
        const unknown = findUnknownAnnouncementVariables(['customer.name', 'customer.first_name']);
        expect(unknown.sort()).toEqual(['customer.first_name', 'customer.name']);
    });

    it('allows every known brand.* field actually present in the render context', () => {
        const unknown = findUnknownAnnouncementVariables([
            'brand.name', 'brand.logo_url', 'brand.api_base_url', 'brand.address',
            'brand.phone', 'brand.email', 'brand.social_linkedin', 'brand.social_twitter',
            'brand.social_facebook', 'brand.social_instagram', 'brand.social_pinterest',
            'brand.help_center_url',
        ]);
        expect(unknown).toEqual([]);
    });

    it('allows the top-level unsubscribe_url', () => {
        expect(findUnknownAnnouncementVariables(['unsubscribe_url'])).toEqual([]);
    });

    // Codex independent review (2026-08-08): the previous implementation only
    // checked the `customer.` prefix textually and let every other root path
    // through unexamined -- {{unknownRoot}} and {{brand.typo}} both passed.
    describe('unknown roots and unknown brand fields (Codex finding, HIGH)', () => {
        it('flags a completely unknown root path', () => {
            expect(findUnknownAnnouncementVariables(['unknownRoot'])).toEqual(['unknownRoot']);
        });

        it('flags a typo\'d brand field', () => {
            expect(findUnknownAnnouncementVariables(['brand.typo'])).toEqual(['brand.typo']);
        });

        it('flags ticket/system context variables that exist in the shared render context but are meaningless for announcements', () => {
            const unknown = findUnknownAnnouncementVariables(['ticketId', 'ticketSubject', 'ticketPriorityLow']);
            expect(unknown.sort()).toEqual(['ticketId', 'ticketPriorityLow', 'ticketSubject']);
        });

        it('flags the bare "customer" and "brand" roots without a sub-field', () => {
            expect(findUnknownAnnouncementVariables(['customer', 'brand'])).toEqual(['customer', 'brand']);
        });
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

    it('does not throw for content using known brand.* fields and unsubscribe_url', () => {
        expect(() => assertAnnouncementContentIsSafeToSend(
            'Merhaba {{customer.firstName}}',
            '<mj-text>{{brand.name}} | <a href="{{unsubscribe_url}}">unsubscribe</a></mj-text>',
        )).not.toThrow();
    });

    // Codex scope note (2026-08-08): renderAnnouncementSubject() only ever
    // receives {customer}, not brand/unsubscribe_url — {{brand.name}} in a
    // subject line silently renders empty even though it's a "known" path
    // for content. The safety check must reject in the subject what the
    // subject renderer can't actually resolve, not just what's known
    // anywhere in the system.
    it('throws when the subject references a brand.* field (subject only supports customer.*)', () => {
        expect(() => assertAnnouncementContentIsSafeToSend(
            '{{brand.name}} güncellemesi',
            '<mj-text>OK</mj-text>',
        )).toThrow();
    });

    it('throws when the subject references unsubscribe_url', () => {
        expect(() => assertAnnouncementContentIsSafeToSend(
            'Bkz {{unsubscribe_url}}',
            '<mj-text>OK</mj-text>',
        )).toThrow();
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

    // The exact reproduction cases from Codex's independent review.
    // Found via a pre-existing property-based test after the Phase 4 fixes:
    // fast-check generated a bare, unterminated `{{` and Handlebars.parse()
    // threw a raw parser exception instead of the clean BadRequestException
    // every other rejection path in this module produces.
    describe('malformed Handlebars syntax (found via property-based fuzzing)', () => {
        it('throws BadRequestException, not a raw Handlebars parse error, for an unterminated {{', () => {
            expect(() => assertAnnouncementContentIsSafeToSend(
                'OK',
                '<mj-text>{{</mj-text>',
            )).toThrow(BadRequestException);
        });

        it('throws BadRequestException for unterminated syntax in the subject', () => {
            expect(() => assertAnnouncementContentIsSafeToSend(
                '{{',
                '<mj-text>OK</mj-text>',
            )).toThrow(BadRequestException);
        });

        it('throws BadRequestException for an unclosed block helper', () => {
            expect(() => assertAnnouncementContentIsSafeToSend(
                'OK',
                '<mj-text>{{#if customer.firstName}}no closing tag</mj-text>',
            )).toThrow(BadRequestException);
        });
    });

    describe('Codex-reported bypass reproductions (2026-08-08)', () => {
        it('throws for {{unknownRoot}}', () => {
            expect(() => assertAnnouncementContentIsSafeToSend(
                'OK',
                '<mj-text>{{unknownRoot}}</mj-text>',
            )).toThrow();
        });

        it('throws for {{brand.typo}}', () => {
            expect(() => assertAnnouncementContentIsSafeToSend(
                'OK',
                '<mj-text>{{brand.typo}}</mj-text>',
            )).toThrow();
        });

        it("throws for {{#if (lookup customer 'name')}}...{{/if}} (unknown bare customer root via SubExpression)", () => {
            expect(() => assertAnnouncementContentIsSafeToSend(
                'OK',
                "<mj-text>{{#if (lookup customer 'name')}}hi{{/if}}</mj-text>",
            )).toThrow();
        });

        it('throws for {{log value=customer.fullname}} (unknown variable via Hash argument)', () => {
            expect(() => assertAnnouncementContentIsSafeToSend(
                'OK',
                '<mj-text>{{log value=customer.fullname}}</mj-text>',
            )).toThrow();
        });
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
