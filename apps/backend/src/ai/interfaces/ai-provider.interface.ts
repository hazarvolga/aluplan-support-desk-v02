export interface EmbeddingResult {
    embedding: number[];
    model: string;
}

export interface ChatResult {
    response: string;
    model: string;
}

/**
 * Represents one content part in a multimodal AI prompt.
 *
 * Variants (use only one per part; if multiple are set, `inlineData` takes precedence over `fileData`):
 *  - `text`       — plain text content; supported by all providers
 *  - `inlineData` — base64-encoded binary (image) with MIME type; supported by all OpenAI-compatible
 *                   providers. **Preferred** over `fileData` when both are present.
 *  - `fileData`   — remote URL reference with MIME type; natively supported only by Vertex/Gemini.
 *                   Must be converted to `inlineData` before sending to OpenAI-compatible providers.
 *
 * @example Text part
 * { text: 'Describe this image:' }
 *
 * @example Inline image (base64)
 * { inlineData: { mimeType: 'image/png', data: '<base64>' } }
 *
 * @example Remote URL image (Vertex/Gemini only)
 * { fileData: { mimeType: 'image/jpeg', fileUri: 'https://...' } }
 */
export interface AiPart {
    /** Plain text content. */
    text?: string;
    /**
     * Base64-encoded binary payload with MIME type.
     * Supported by all OpenAI-compatible providers.
     * Preferred over `fileData` when both are present.
     */
    inlineData?: {
        mimeType: string;
        data: string; // base64
    };
    /**
     * Remote URL reference with MIME type.
     * Natively supported only by Vertex/Gemini.
     * Must be converted to `inlineData` before sending to OpenAI-compatible providers.
     */
    fileData?: {
        mimeType: string;
        fileUri: string;
    };
    /** @deprecated Use `fileData.fileUri` instead. */
    fileUri?: string;
}

/**
 * Contract for all AI provider implementations.
 *
 * ## AiPart handling contract
 * Implementors MUST:
 *  - Accept `AiPart[]` in `generate()` and `reformat()`
 *  - Handle `text` and `inlineData` variants without throwing
 *  - Map `inlineData` parts to provider-native image blocks (e.g., OpenAI `image_url`)
 *  - Return `null` (not throw) when the provider rejects a vision request (e.g., HTTP 400
 *    due to unsupported content type) — the `AiService` dispatcher handles retries
 *
 * ## Vision degradation
 * If the active model does not support vision, the provider SHOULD log a WARN and still
 * forward the parts. The `AiService` dispatcher will retry with text-only parts if the
 * provider returns `null`.
 */
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
