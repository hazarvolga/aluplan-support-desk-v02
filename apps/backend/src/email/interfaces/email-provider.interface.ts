export interface SendEmailOptions {
    to: string | string[];
    subject: string;
    html: string;
    text?: string;
    from?: string;
}

export interface EmailProvider {
    send(options: SendEmailOptions): Promise<{ messageId: string }>;
    healthCheck(): Promise<boolean>;
}
