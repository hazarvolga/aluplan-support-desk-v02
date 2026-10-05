const HOTINFO_STRING_FIELDS = [
    'allplanVersion', 'allplanBuildId', 'allplanHotfix', 'allplanEdition',
    'licenseType', 'licenseMethod', 'osVersion', 'cpu', 'gpu',
    'gpuDriverVersion', 'vram', 'openglVersion', 'ram', 'screenResolution',
    'defaultPrinter', 'diskInfo', 'dotnetVersion', 'errorTrace',
] as const;

const HOTINFO_LIST_FIELDS = [
    'installedModules', 'securityServices', 'printers', 'conflictingProcesses',
] as const;

export const sanitizeHotinfoString = (value: unknown, maxLength = 500): string | undefined => {
    if (typeof value !== 'string' && typeof value !== 'number') return undefined;
    const sanitized = String(value)
        .replace(/[\u0000-\u001f\u007f]+/g, ' ')
        .replace(/\s+/g, ' ')
        .trim()
        .slice(0, maxLength);
    return sanitized || undefined;
};

const sanitizeHotinfoList = (value: unknown): string[] | undefined => {
    if (!Array.isArray(value)) return undefined;
    const entries = value
        .slice(0, 20)
        .map(item => sanitizeHotinfoString(item, 256))
        .filter((item): item is string => Boolean(item));
    return entries.length > 0 ? entries : undefined;
};

const sanitizeHotinfoObjectList = (
    value: unknown,
    allowedFields: readonly string[],
): Array<Record<string, string>> | undefined => {
    if (!Array.isArray(value)) return undefined;
    const entries = value.slice(0, 10).map(item => {
        if (!item || typeof item !== 'object' || Array.isArray(item)) return null;
        const source = item as Record<string, unknown>;
        const sanitized = Object.fromEntries(
            allowedFields
                .map(field => [field, sanitizeHotinfoString(source[field], 256)] as const)
                .filter((entry): entry is readonly [string, string] => Boolean(entry[1])),
        );
        return Object.keys(sanitized).length > 0 ? sanitized : null;
    }).filter((item): item is Record<string, string> => Boolean(item));
    return entries.length > 0 ? entries : undefined;
};

export const sanitizeHotinfoContext = (value: unknown): Record<string, unknown> | undefined => {
    if (!value || typeof value !== 'object' || Array.isArray(value)) return undefined;
    const source = value as Record<string, unknown>;
    const result: Record<string, unknown> = {};

    HOTINFO_STRING_FIELDS.forEach(field => {
        const maxLength = field === 'errorTrace' ? 2000 : 500;
        const sanitized = sanitizeHotinfoString(source[field], maxLength);
        if (sanitized) result[field] = sanitized;
    });
    HOTINFO_LIST_FIELDS.forEach(field => {
        const sanitized = sanitizeHotinfoList(source[field]);
        if (sanitized) result[field] = sanitized;
    });

    const graphicsCards = sanitizeHotinfoObjectList(source.graphicsCards, [
        'name', 'vram', 'ram', 'driverDate', 'driverVersion', 'resolution',
    ]);
    if (graphicsCards) result.graphicsCards = graphicsCards;
    const drives = sanitizeHotinfoObjectList(source.drives, ['root', 'free', 'total']);
    if (drives) result.drives = drives;

    return Object.keys(result).length > 0 ? result : undefined;
};
