export interface EmbeddingResult {
    embedding: number[];
    model: string;
}

export interface ChatResult {
    response: string;
    model: string;
}

export interface AiPart {
    text?: string;
    inlineData?: {
        mimeType: string;
        data: string; // base64
    };
    fileData?: {
        mimeType: string;
        fileUri: string;
    };
    fileUri?: string;
}

export interface AiProvider {
    embed(text: string): Promise<EmbeddingResult | null>;
    generate(prompt: string | AiPart[], timeout?: number): Promise<string | null>;
    streamGenerate?(prompt: string | AiPart[], timeout?: number): AsyncGenerator<string, void, unknown>;
    reformat(systemPrompt: string, userQuery: string, kbContent: string, attachments?: AiPart[]): Promise<ChatResult | null>;
    streamReformat?(systemPrompt: string, userQuery: string, kbContent: string, attachments?: AiPart[]): AsyncGenerator<string, void, unknown>;
    suggestCategory(title: string, content: string, categories: string[]): Promise<string | null>;
    summarizeTicket(subject: string, conversation: string): Promise<string | null>;
    analyzeSentiment(text: string): Promise<'POSITIVE' | 'NEUTRAL' | 'NEGATIVE'>;
    translate(text: string, targetLanguage: string): Promise<string | null>;
    isAvailable(): Promise<boolean>;
    testConnection(): Promise<{ success: boolean; message: string }>;
    getName(): string;
    getActiveModelName(): Promise<string>;
}
