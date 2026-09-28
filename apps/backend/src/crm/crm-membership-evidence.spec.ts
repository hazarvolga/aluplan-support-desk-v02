import {
    classifyCrmMembershipEvidence,
    CrmMembershipEvidenceInput,
    CrmMembershipEvidenceReason as Reason,
} from './crm-membership-evidence';

const CONTACT_ID = 'bc079550-661c-48f5-934f-21095f8d6501';
const OTHER_ID = '2185b421-4311-41c9-a0ee-5e62d8ea1bfe';
const EMAIL = 'synthetic.customer@example.com';
const fixture = (overrides: Partial<CrmMembershipEvidenceInput> = {}): CrmMembershipEvidenceInput => ({
    userEmail: EMAIL,
    crmVerified: true,
    externalContactId: CONTACT_ID,
    profileDeletedAt: null,
    rawCrmPayload: { contactid: CONTACT_ID, emailaddress1: EMAIL },
    ...overrides,
});
const unknown = (reason: Reason) => ({ status: 'EVIDENCE_UNKNOWN', reason });
const match = { status: 'ROSTER_EVIDENCE_MATCH', reason: Reason.LOCAL_ROSTER_FIELDS_MATCH };

describe('classifyCrmMembershipEvidence — local evidence only, never admission authority', () => {
    it('matches corroborating local fields without claiming freshness or authenticity', () => {
        expect(classifyCrmMembershipEvidence(fixture())).toEqual(match);
    });

    it('normalizes email and GUID casing without removing plus tags or dots', () => {
        expect(classifyCrmMembershipEvidence(fixture({
            userEmail: ' Synthetic.Customer+tag@Example.com ',
            externalContactId: CONTACT_ID.toUpperCase(),
            rawCrmPayload: { ContactId: CONTACT_ID, EmailAddress1: 'synthetic.customer+tag@example.com' },
        }))).toEqual(match);
        expect(classifyCrmMembershipEvidence(fixture({
            rawCrmPayload: { contactid: CONTACT_ID, emailaddress1: 'syntheticcustomer@example.com' },
        }))).toEqual(unknown(Reason.EMAIL_MISMATCH));
    });

    it.each([null, '', 'not-email', 'user@', 'a b@example.com'])('rejects malformed local email %p', (userEmail) => {
        expect(classifyCrmMembershipEvidence(fixture({ userEmail }))).toEqual(unknown(Reason.USER_EMAIL_INVALID));
    });

    it('does not accept generated CRM placeholder addresses as mailbox evidence', () => {
        expect(classifyCrmMembershipEvidence(fixture({
            userEmail: `no-email-${CONTACT_ID}@internal.aluplan`,
            rawCrmPayload: { contactid: CONTACT_ID, emailaddress1: `no-email-${CONTACT_ID}@internal.aluplan` },
        }))).toEqual(unknown(Reason.PLACEHOLDER_EMAIL));
    });

    it.each([false, null, 'true', 1])('requires an affirmative boolean profile flag, not %p', (crmVerified) => {
        expect(classifyCrmMembershipEvidence(fixture({ crmVerified: crmVerified as boolean })))
            .toEqual(unknown(Reason.PROFILE_NOT_AFFIRMATIVE));
    });

    it.each([undefined, '2026-01-01', new Date('2026-01-01'), ''])('does not infer removal from deletedAt %p', (profileDeletedAt) => {
        expect(classifyCrmMembershipEvidence(fixture({ profileDeletedAt })))
            .toEqual(unknown(Reason.PROFILE_DELETION_STATE_UNCLEAR));
    });

    it.each([null, '', 'customer-123', '00000000-0000-0000-0000-000000000000'])('requires a usable Dynamics ID, not %p', (externalContactId) => {
        expect(classifyCrmMembershipEvidence(fixture({ externalContactId })))
            .toEqual(unknown(Reason.EXTERNAL_CONTACT_ID_INVALID));
    });

    it.each([null, undefined, 'json', 7, [], new Date('2026-01-01')])('does not accept malformed raw payload %p', (rawCrmPayload) => {
        expect(classifyCrmMembershipEvidence(fixture({ rawCrmPayload }))).toEqual(unknown(Reason.PAYLOAD_INVALID));
    });

    it.each([{}, { contactid: '' }, { contactid: 123 }, { contactid: OTHER_ID }])('does not match incomplete or foreign contact evidence %p', (rawCrmPayload) => {
        expect(classifyCrmMembershipEvidence(fixture({ rawCrmPayload }))).toEqual(unknown(Reason.CONTACT_ID_MISSING_OR_MISMATCH));
    });

    it.each([undefined, null, '', 'not-email', ['synthetic.customer@example.com']])('requires a real raw email value %p', (emailaddress1) => {
        expect(classifyCrmMembershipEvidence(fixture({ rawCrmPayload: { contactid: CONTACT_ID, emailaddress1 } })))
            .toEqual(unknown(Reason.PAYLOAD_EMAIL_INVALID));
    });

    it('does not treat a matching customer number as membership', () => {
        expect(classifyCrmMembershipEvidence(fixture({ rawCrmPayload: { new_customerid: 'CUSTOMER-1' } })))
            .toEqual(unknown(Reason.CONTACT_ID_MISSING_OR_MISMATCH));
    });

    it.each([0, 1, 2, null, 'inactive'])('ignores CRM status and contract metadata %p', (state) => {
        const input = fixture();
        expect(classifyCrmMembershipEvidence({
            ...input,
            rawCrmPayload: { ...(input.rawCrmPayload as object), statecode: state, statuscode: state,
                new_musteridurumu: state, contractStatus: state, license: false, updatedAt: '2099-01-01' },
        })).toEqual(match);
    });

    it('supports caller-selected trusted nested mapping paths', () => {
        expect(classifyCrmMembershipEvidence(fixture({
            rawCrmPayload: { source: { id: CONTACT_ID, mailbox: EMAIL } },
            trustedMappingPaths: { externalContactId: 'source.id', email: 'source.mailbox' },
        }))).toEqual(match);
    });

    it('retains the contact writer default fallback for empty mapped values', () => {
        expect(classifyCrmMembershipEvidence(fixture({
            rawCrmPayload: { contactid: CONTACT_ID, emailaddress1: EMAIL, source: { id: '', mailbox: null } },
            trustedMappingPaths: { externalContactId: 'source.id', email: 'source.mailbox' },
        }))).toEqual(match);
    });

    it('respects formatted value priority used by the contact writer', () => {
        expect(classifyCrmMembershipEvidence(fixture({ rawCrmPayload: {
            contactid: CONTACT_ID, emailaddress1: 'other@example.com',
            'emailaddress1@OData.Community.Display.V1.FormattedValue': EMAIL,
        } }))).toEqual(match);
    });

    it('supports explicit formatted mapping with base value fallback', () => {
        expect(classifyCrmMembershipEvidence(fixture({
            rawCrmPayload: { contactid: CONTACT_ID, mailbox: EMAIL },
            trustedMappingPaths: { email: 'mailbox@OData.Community.Display.V1.FormattedValue' },
        }))).toEqual(match);
    });

    it.each([EMAIL, null, ''])('resolves explicit formatted values %p with the writer fallback', (formatted) => {
        expect(classifyCrmMembershipEvidence(fixture({
            rawCrmPayload: { contactid: CONTACT_ID, mailbox: EMAIL,
                'mailbox@OData.Community.Display.V1.FormattedValue': formatted },
            trustedMappingPaths: { email: 'mailbox@OData.Community.Display.V1.FormattedValue' },
        }))).toEqual(match);
    });

    it.each([null, [], 'emailaddress1', 123])('rejects malformed mapping objects %p', (trustedMappingPaths) => {
        expect(classifyCrmMembershipEvidence(fixture({
            trustedMappingPaths: trustedMappingPaths as CrmMembershipEvidenceInput['trustedMappingPaths'],
        }))).toEqual(unknown(Reason.MAPPING_UNSAFE_OR_AMBIGUOUS));
    });

    it.each([123, 'a'.repeat(256)])('rejects invalid mapping path values %p', (email) => {
        expect(classifyCrmMembershipEvidence(fixture({ trustedMappingPaths: { email: email as string } })))
            .toEqual(unknown(Reason.MAPPING_UNSAFE_OR_AMBIGUOUS));
    });

    it('does not accept placeholder raw email when the local mailbox is real', () => {
        expect(classifyCrmMembershipEvidence(fixture({ rawCrmPayload: {
            contactid: CONTACT_ID, emailaddress1: `no-email-${CONTACT_ID}@internal.aluplan`,
        } }))).toEqual(unknown(Reason.PLACEHOLDER_EMAIL));
    });

    it('accepts plain null-prototype JSON-compatible evidence', () => {
        const rawCrmPayload = Object.assign(Object.create(null), { contactid: CONTACT_ID, emailaddress1: EMAIL });
        expect(classifyCrmMembershipEvidence(fixture({ rawCrmPayload }))).toEqual(match);
    });

    it('reports hostile non-JSON object access as unknown without leaking exceptions', () => {
        const rawCrmPayload = new Proxy({}, { getPrototypeOf: () => { throw new Error('private payload'); } });
        expect(classifyCrmMembershipEvidence(fixture({ rawCrmPayload })))
            .toEqual(unknown(Reason.MAPPING_UNSAFE_OR_AMBIGUOUS));
    });

    it.each(['__proto__.email', 'constructor.email', 'source.prototype.email', 'source..email',
        'source[0].email', '', ' source.email', 'a.'.repeat(20) + 'email'])('rejects unsafe or ambiguous mappings %p', (email) => {
        expect(classifyCrmMembershipEvidence(fixture({ trustedMappingPaths: { email } })))
            .toEqual(unknown(Reason.MAPPING_UNSAFE_OR_AMBIGUOUS));
    });

    it('rejects multiple case variants of a relevant field rather than guessing', () => {
        expect(classifyCrmMembershipEvidence(fixture({ rawCrmPayload: {
            contactid: CONTACT_ID, emailaddress1: EMAIL, EmailAddress1: 'other@example.com',
        } }))).toEqual(unknown(Reason.MAPPING_UNSAFE_OR_AMBIGUOUS));
    });

    it('does not traverse inherited properties', () => {
        const nested = Object.create({ mailbox: EMAIL });
        expect(classifyCrmMembershipEvidence(fixture({
            rawCrmPayload: { contactid: CONTACT_ID, source: nested },
            trustedMappingPaths: { email: 'source.mailbox' },
        }))).toEqual(unknown(Reason.PAYLOAD_EMAIL_INVALID));
    });

    it('does not execute raw-payload getters', () => {
        const getter = jest.fn(() => EMAIL);
        const payload = Object.defineProperty({ contactid: CONTACT_ID }, 'emailaddress1', { enumerable: true, get: getter });
        expect(classifyCrmMembershipEvidence(fixture({ rawCrmPayload: payload })))
            .toEqual(unknown(Reason.MAPPING_UNSAFE_OR_AMBIGUOUS));
        expect(getter).not.toHaveBeenCalled();
    });

    it('does not mutate frozen input and does not echo raw data or identities', () => {
        const input = Object.freeze(fixture({ rawCrmPayload: Object.freeze({ contactid: CONTACT_ID, emailaddress1: EMAIL }) }));
        expect(classifyCrmMembershipEvidence(input)).toEqual(match);
        expect(JSON.stringify(classifyCrmMembershipEvidence(input))).not.toContain(EMAIL);
    });
});
