type HeaderSource = Map<string, unknown> | Record<string, unknown> | undefined | null;

function getHeader(headers: HeaderSource, name: string): string {
    if (!headers) return '';

    if (headers instanceof Map) {
        const value = headers.get(name.toLowerCase()) ?? headers.get(name);
        return Array.isArray(value) ? value.join(' ') : String(value ?? '');
    }

    const match = Object.entries(headers).find(([key]) => key.toLowerCase() === name.toLowerCase());
    const value = match?.[1];
    return Array.isArray(value) ? value.join(' ') : String(value ?? '');
}

export function isDeliveryStatusNotification(input: {
    from?: string | null;
    subject?: string | null;
    body?: string | null;
    headers?: HeaderSource;
}): boolean {
    const from = (input.from ?? '').toLowerCase();
    const subject = (input.subject ?? '').toLowerCase();
    const body = (input.body ?? '').toLowerCase();
    const contentType = getHeader(input.headers, 'content-type').toLowerCase();
    const autoSubmitted = getHeader(input.headers, 'auto-submitted').toLowerCase();
    const mailer = getHeader(input.headers, 'x-mailer').toLowerCase();
    const combined = `${subject}\n${body}\n${contentType}\n${autoSubmitted}\n${mailer}`;

    if (from.includes('mailer-daemon') || from.includes('postmaster@')) return true;
    if (autoSubmitted.includes('auto-replied') || autoSubmitted.includes('auto-generated')) return true;
    if (contentType.includes('multipart/report') && contentType.includes('delivery-status')) return true;
    if (contentType.includes('multipart/report') && contentType.includes('feedback-report')) return true;
    if (contentType.includes('message/feedback-report')) return true;

    const automatedReportSenders = [
        'dmarc',
        'dmarcreport',
        'postmaster',
        'mailer-daemon',
    ];
    const localPart = from.split('@')[0] ?? '';
    if (automatedReportSenders.some(sender => localPart.includes(sender))) {
        const reportSignals = [
            'report domain:',
            'report-id:',
            'submitter:',
            'dmarc',
            'aggregate report',
            'feedback report',
            'feedback-type:',
            'policy_published',
            'record',
        ];
        if (reportSignals.some(signal => combined.includes(signal))) return true;
    }

    const deliverySignals = [
        'delivery status notification',
        'undelivered mail returned to sender',
        'mail delivery failed',
        'message could not be delivered',
        'reporting-mta:',
        'final-recipient:',
        'diagnostic-code:',
        'action: failed',
        'status: 5.',
        'does not accept mail',
        'nullmx',
        'report domain:',
        'report-id:',
        'feedback-type:',
        'policy_published',
        'dmarc aggregate',
    ];

    return deliverySignals.some(signal => combined.includes(signal));
}
