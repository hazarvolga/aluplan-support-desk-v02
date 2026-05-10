import { AiProvider, AiPart, ChatResult, EmbeddingResult } from './ai-provider.interface';

/**
 * Abstracted AI Dispatcher Interface
 * 
 * Reduces AiService god node by providing an interface that
 * other services can depend on. Implementation can be swapped
 * without affecting dependents.
 */
export interface IAiDispatcher {
    generate(prompt: string | AiPart[], options?: AiGenerateOptions): Promise<string | null>;
    streamGenerate(prompt: string | AiPart[], options?: AiGenerateOptions): AsyncGenerator<string, void, unknown>;
    embed(text: string): Promise<EmbeddingResult | null>;
    reformat(systemPrompt: string, userQuery: string, kbContent: string, attachments?: AiPart[]): Promise<ChatResult | null>;
    getActiveProviderName(): Promise<string>;
    testConnection(): Promise<{ success: boolean; message: string }>;
}

export interface AiGenerateOptions {
    task?: string;
    timeout?: number;
    systemPrompt?: string;
}

/**
 * Factory for creating AI dispatcher instances
 */
export interface IAiDispatcherFactory {
    getDispatcher(): IAiDispatcher;
}