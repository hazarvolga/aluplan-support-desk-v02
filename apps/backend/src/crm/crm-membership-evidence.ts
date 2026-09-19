import { isEmail } from 'class-validator';
import { normalizeEmailAddress } from '../common/utils/email-normalization.util';

export enum CrmMembershipEvidenceReason {
    LOCAL_ROSTER_FIELDS_MATCH = 'LOCAL_ROSTER_FIELDS_MATCH',
    USER_EMAIL_INVALID = 'USER_EMAIL_INVALID',
    PLACEHOLDER_EMAIL = 'PLACEHOLDER_EMAIL',
    PROFILE_NOT_AFFIRMATIVE = 'PROFILE_NOT_AFFIRMATIVE',
    PROFILE_DELETION_STATE_UNCLEAR = 'PROFILE_DELETION_STATE_UNCLEAR',
    EXTERNAL_CONTACT_ID_INVALID = 'EXTERNAL_CONTACT_ID_INVALID',
    PAYLOAD_INVALID = 'PAYLOAD_INVALID',
    CONTACT_ID_MISSING_OR_MISMATCH = 'CONTACT_ID_MISSING_OR_MISMATCH',
    PAYLOAD_EMAIL_INVALID = 'PAYLOAD_EMAIL_INVALID',
    EMAIL_MISMATCH = 'EMAIL_MISMATCH',
    MAPPING_UNSAFE_OR_AMBIGUOUS = 'MAPPING_UNSAFE_OR_AMBIGUOUS',
}

export interface CrmMembershipEvidenceInput {
    readonly userEmail: string | null;
    readonly crmVerified: boolean | null;
    readonly externalContactId: string | null;
    readonly rawCrmPayload: unknown;
    readonly profileDeletedAt: Date | string | null | undefined;
    /** Already-resolved paths from a known connection; do not infer a connection from payload fields. */
    readonly trustedMappingPaths?: Readonly<{ externalContactId?: string; email?: string }>;
}

export type CrmMembershipEvidenceResult =
    | { readonly status: 'ROSTER_EVIDENCE_MATCH'; readonly reason: CrmMembershipEvidenceReason.LOCAL_ROSTER_FIELDS_MATCH }
    | { readonly status: 'EVIDENCE_UNKNOWN'; readonly reason: Exclude<CrmMembershipEvidenceReason, CrmMembershipEvidenceReason.LOCAL_ROSTER_FIELDS_MATCH> };

const FORMATTED_SUFFIX = '@odata.community.display.v1.formattedvalue';
const UNSAFE_TOKENS = new Set(['__proto__', 'prototype', 'constructor']);
const GUID_PATTERN = /^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/i;
const unknownEvidence = (reason: Exclude<CrmMembershipEvidenceReason, CrmMembershipEvidenceReason.LOCAL_ROSTER_FIELDS_MATCH>): CrmMembershipEvidenceResult =>
    ({ status: 'EVIDENCE_UNKNOWN', reason });

function isRecord(value: unknown): value is Record<string, unknown> {
    return typeof value === 'object' && value !== null && !Array.isArray(value) &&
        (Object.getPrototypeOf(value) === Object.prototype || Object.getPrototypeOf(value) === null);
}

function ownValue(record: unknown, key: string, caseInsensitive = false): unknown {
    if (!isRecord(record)) return undefined;
    const keys = caseInsensitive ? Object.keys(record).filter((candidate) => candidate.toLowerCase() === key) : [key];
    if (keys.length > 1) throw new Error('Ambiguous evidence field');
    const descriptor = Object.getOwnPropertyDescriptor(record, keys[0] ?? key);
    if (descriptor && !('value' in descriptor)) throw new Error('Accessor evidence is not JSON');
    return descriptor?.value;
}

function mappingPath(mappings: CrmMembershipEvidenceInput['trustedMappingPaths'], field: 'externalContactId' | 'email', fallback: string): string {
    if (mappings === undefined) return fallback;
    if (!isRecord(mappings)) throw new Error('Invalid mapping');
    const value = ownValue(mappings, field);
    if (value === undefined) return fallback;
    if (typeof value !== 'string' || value.length > 255) throw new Error('Invalid mapping path');
    const path = value.toLowerCase();
    const base = path.replace(/@odata\.community\.display\.v1\.formattedvalue$/, '');
    const parts = base.split('.');
    if (!/^[a-z_][a-z0-9_]*(\.[a-z_][a-z0-9_]*)*$/.test(base) || parts.length > 16 ||
        parts.some((part) => UNSAFE_TOKENS.has(part))) throw new Error('Unsafe mapping path');
    return path;
}

/** Mirrors contact-sync formatted priority, lowercase nested traversal and empty-value fallback. */
function resolvePayloadField(payload: Record<string, unknown>, path: string): unknown {
    if (path.includes('@odata')) {
        const formatted = ownValue(payload, path, true);
        return formatted !== undefined && formatted !== null && formatted !== ''
            ? formatted : ownValue(payload, path.split('@')[0], true);
    }
    const formatted = ownValue(payload, `${path}${FORMATTED_SUFFIX}`, true);
    if (formatted !== undefined && formatted !== null && formatted !== '') return formatted;
    if (path.includes('.')) return path.split('.').reduce<unknown>((value, part) => ownValue(value, part), payload);
    return ownValue(payload, path, true);
}

function normalizedEmail(value: unknown): string | undefined {
    if (typeof value !== 'string') return undefined;
    const email = normalizeEmailAddress(value);
    return isEmail(email) ? email : undefined;
}

function normalizedContactId(value: unknown): string | undefined {
    if (typeof value !== 'string' || !GUID_PATTERN.test(value) || value === '00000000-0000-0000-0000-000000000000') return undefined;
    return value.toLowerCase();
}

/**
 * Read-only corroboration of a LOCAL snapshot, not an authentication/authorization decision.
 * Matching fields prove neither CRM authenticity nor freshness. Unknown does not mean removed,
 * ineligible, or malicious. CRM activity, contracts, licenses and local updatedAt are not evidence.
 * Do not wire this classifier into access enforcement without a separate lifecycle design.
 */
export function classifyCrmMembershipEvidence(input: CrmMembershipEvidenceInput): CrmMembershipEvidenceResult {
    const reason = CrmMembershipEvidenceReason;
    const email = normalizedEmail(input.userEmail);
    if (!email) return unknownEvidence(reason.USER_EMAIL_INVALID);
    if (email.endsWith('@internal.aluplan')) return unknownEvidence(reason.PLACEHOLDER_EMAIL);
    if (input.crmVerified !== true) return unknownEvidence(reason.PROFILE_NOT_AFFIRMATIVE);
    if (input.profileDeletedAt !== null) return unknownEvidence(reason.PROFILE_DELETION_STATE_UNCLEAR);
    const externalId = normalizedContactId(input.externalContactId);
    if (!externalId) return unknownEvidence(reason.EXTERNAL_CONTACT_ID_INVALID);

    try {
        const payload = input.rawCrmPayload;
        if (!isRecord(payload)) return unknownEvidence(reason.PAYLOAD_INVALID);
        const idPath = mappingPath(input.trustedMappingPaths, 'externalContactId', 'contactid');
        const emailPath = mappingPath(input.trustedMappingPaths, 'email', 'emailaddress1');
        const payloadId = resolvePayloadField(payload, idPath) || ownValue(payload, 'contactid');
        if (normalizedContactId(payloadId) !== externalId) return unknownEvidence(reason.CONTACT_ID_MISSING_OR_MISMATCH);
        const payloadEmail = normalizedEmail(resolvePayloadField(payload, emailPath) || ownValue(payload, 'emailaddress1'));
        if (!payloadEmail) return unknownEvidence(reason.PAYLOAD_EMAIL_INVALID);
        if (payloadEmail.endsWith('@internal.aluplan')) return unknownEvidence(reason.PLACEHOLDER_EMAIL);
        if (payloadEmail !== email) return unknownEvidence(reason.EMAIL_MISMATCH);
        return { status: 'ROSTER_EVIDENCE_MATCH', reason: reason.LOCAL_ROSTER_FIELDS_MATCH };
    } catch {
        // Unknown/malformed local evidence is reported explicitly without exposing raw data.
        return unknownEvidence(reason.MAPPING_UNSAFE_OR_AMBIGUOUS);
    }
}
