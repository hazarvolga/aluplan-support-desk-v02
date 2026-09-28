import {
    AnnouncementCustomerContextSchema,
    buildAnnouncementEmailContext,
} from './announcement-email-context';

describe('buildAnnouncementEmailContext', () => {
    it('maps CustomerProfile + user fields to the canonical announcement context shape', () => {
        const context = buildAnnouncementEmailContext({
            firstName: 'Ada',
            lastName: 'Lovelace',
            companyName: 'Analytical Engines Ltd',
            customerNo: 'CUST-001',
            user: { email: 'ada@example.com' },
        });

        expect(context).toEqual({
            firstName: 'Ada',
            lastName: 'Lovelace',
            fullName: 'Ada Lovelace',
            companyName: 'Analytical Engines Ltd',
            customerNo: 'CUST-001',
            email: 'ada@example.com',
            userEmail: 'ada@example.com',
        });
    });

    it('joins fullName with a single space and no leading/trailing whitespace', () => {
        const context = buildAnnouncementEmailContext({
            firstName: 'Grace',
            lastName: 'Hopper',
            companyName: 'Navy',
            customerNo: 'CUST-002',
            user: { email: 'grace@example.com' },
        });

        expect(context.fullName).toBe('Grace Hopper');
    });

    it('omits the missing half of fullName instead of leaving stray whitespace', () => {
        const context = buildAnnouncementEmailContext({
            firstName: 'Linus',
            lastName: '',
            companyName: 'Kernel Inc',
            customerNo: 'CUST-003',
            user: { email: 'linus@example.com' },
        });

        expect(context.fullName).toBe('Linus');
    });

    it('does not throw when optional-looking fields are empty strings', () => {
        const context = buildAnnouncementEmailContext({
            firstName: '',
            lastName: '',
            companyName: '',
            customerNo: '',
            user: { email: 'no-name@example.com' },
        });

        expect(context.fullName).toBe('');
        expect(context.companyName).toBe('');
        expect(context.customerNo).toBe('');
    });

    it('sets both email and userEmail to the same value (user.email is the only email source today)', () => {
        const context = buildAnnouncementEmailContext({
            firstName: 'Margaret',
            lastName: 'Hamilton',
            companyName: 'NASA',
            customerNo: 'CUST-004',
            user: { email: 'margaret@example.com' },
        });

        expect(context.email).toBe('margaret@example.com');
        expect(context.userEmail).toBe('margaret@example.com');
    });
});

describe('AnnouncementCustomerContextSchema', () => {
    it('accepts a well-formed announcement customer context', () => {
        const result = AnnouncementCustomerContextSchema.safeParse({
            firstName: 'Ada',
            lastName: 'Lovelace',
            fullName: 'Ada Lovelace',
            companyName: 'Analytical Engines Ltd',
            customerNo: 'CUST-001',
            email: 'ada@example.com',
            userEmail: 'ada@example.com',
        });

        expect(result.success).toBe(true);
    });

    it('rejects a context missing required fields', () => {
        const result = AnnouncementCustomerContextSchema.safeParse({
            firstName: 'Ada',
        });

        expect(result.success).toBe(false);
    });

    it('rejects a malformed email', () => {
        const result = AnnouncementCustomerContextSchema.safeParse({
            firstName: 'Ada',
            lastName: 'Lovelace',
            fullName: 'Ada Lovelace',
            companyName: 'Analytical Engines Ltd',
            customerNo: 'CUST-001',
            email: 'not-an-email',
            userEmail: 'ada@example.com',
        });

        expect(result.success).toBe(false);
    });

    it('rejects legacy snake_case field names (first_name/full_name/name) as a distinct object shape', () => {
        // Regression guard for GAP report BUG-02: preview mocks previously used
        // snake_case / `name` fields that never matched the real broadcast shape.
        const result = AnnouncementCustomerContextSchema.safeParse({
            first_name: 'Ada',
            full_name: 'Ada Lovelace',
            name: 'Ada Lovelace',
            email: 'ada@example.com',
        });

        expect(result.success).toBe(false);
    });
});

describe('buildAnnouncementEmailContext output always satisfies AnnouncementCustomerContextSchema', () => {
    it('round-trips through the schema without validation errors', () => {
        const context = buildAnnouncementEmailContext({
            firstName: 'Katherine',
            lastName: 'Johnson',
            companyName: 'NASA',
            customerNo: 'CUST-005',
            user: { email: 'katherine@example.com' },
        });

        const result = AnnouncementCustomerContextSchema.safeParse(context);
        expect(result.success).toBe(true);
    });
});
