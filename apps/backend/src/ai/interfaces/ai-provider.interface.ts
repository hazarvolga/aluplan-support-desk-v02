export interface EmbeddingResult {
    embedding: number[];
    model: string;
}

export interface ChatResult {
    response: string;
    model: string;
}

export interface AiProvider {
    embed(text: string): Promise<EmbeddingResult | null>;
    generate(prompt: string, timeout?: number): Promise<string | null>;
    reformat(systemPrompt: string, userQuery: string, kbContent: string): Promise<ChatResult | null>;
    streamReformat?(systemPrompt: string, userQuery: string, kbContent: string): AsyncGenerator<string, void, unknown>;
    suggestCategory(title: string, content: string, categories: string[]): Promise<string | null>;
    summarizeTicket(subject: string, conversation: string): Promise<string | null>;
    isAvailable(): Promise<boolean>;
    getName(): string;
}
