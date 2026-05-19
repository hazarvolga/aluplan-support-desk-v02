const RESERVED_EXACT_DOMAINS = new Set([
    'example.com',
    'example.net',
    'example.org',
    'internal.aluplan',
    'invalid',
    'localhost',
    'test',
]);

const RESERVED_DOMAIN_SUFFIXES = [
    '.example',
    '.invalid',
    '.localhost',
    '.test',
];

const INTERNAL_PLACEHOLDER_EMAIL_REGEX = /^no-email-[^@\s]+@internal\.aluplan$/i;

export function isInternalPlaceholderEmail(email: string | null | undefined): boolean {
    return typeof email === 'string' && INTERNAL_PLACEHOLDER_EMAIL_REGEX.test(email.trim());
}

export function splitEmailRecipients(recipients: string): string[] {
    return recipients
        .split(/[;,]/)
        .map(recipient => recipient.trim())
        .filter(Boolean);
}

export function getReservedEmailRecipient(recipients: string): string | null {
    for (const recipient of splitEmailRecipients(recipients)) {
        if (isInternalPlaceholderEmail(recipient)) return recipient;

        const domain = recipient.split('@')[1]?.toLowerCase();
        if (!domain) return recipient;

        if (RESERVED_EXACT_DOMAINS.has(domain)) return recipient;
        if (RESERVED_DOMAIN_SUFFIXES.some(suffix => domain.endsWith(suffix))) return recipient;
    }

    return null;
}
