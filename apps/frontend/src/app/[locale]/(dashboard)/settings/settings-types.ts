export type Setting = {
    key: string;
    value?: string | null;
};

export type Macro = {
    id: string;
    name: string;
    content: string;
};

export type EmailPreviewResult = {
    success: boolean;
    html?: string;
    subject?: string;
    error?: string;
};

export const getErrorMessage = (error: unknown): string =>
    error instanceof Error ? error.message : 'Unknown error';
