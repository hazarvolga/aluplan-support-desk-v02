export interface ChunkResult {
    content: string;
    sequence: number;
}

export interface ChunkerOptions {
    maxTokens?: number;
    overlap?: number;
    title?: string;
}

/**
 * Intelligent splitter that respects Markdown boundaries and technical context.
 * Uses a character-to-token proxy (4 chars/token).
 */
function splitConservingMarkdown(text: string, maxTokens: number, overlapTokens: number = 0): string[] {
    const CHARS_PER_TOKEN = 4;
    const maxSize = maxTokens * CHARS_PER_TOKEN;
    const overlapSize = overlapTokens * CHARS_PER_TOKEN;

    if (text.length <= maxSize) return [text];

    const chunks: string[] = [];
    let remaining = text;

    while (remaining.length > 0) {
        if (remaining.length <= maxSize) {
            chunks.push(remaining);
            break;
        }

        let splitIdx = -1;
        const sub = remaining.substring(0, maxSize);

        // 1. Preferred: Split at code block end (Critical for technical docs)
        const codeCloseIdx = sub.lastIndexOf('```');
        if (codeCloseIdx > maxSize * 0.5) splitIdx = codeCloseIdx + 3;

        // 2. High Priority: Split at paragraph (Maintains semantic flow)
        if (splitIdx === -1) {
            const pSplit = sub.lastIndexOf('\n\n');
            if (pSplit > maxSize * 0.3) splitIdx = pSplit;
        }

        // 3. Medium Priority: Split at list item or line break
        if (splitIdx === -1) {
            const nSplit = sub.lastIndexOf('\n');
            if (nSplit > maxSize * 0.5) splitIdx = nSplit;
        }

        // 4. Low Priority: Split at sentence end
        if (splitIdx === -1) {
            // Match sentence end followed by space but preserve the period
            const sSplit = sub.lastIndexOf('. ');
            if (sSplit > maxSize * 0.6) splitIdx = sSplit + 1;
        }

        // Fallback: Force split at max size if no logical boundary found
        if (splitIdx === -1) splitIdx = maxSize;

        const chunk = remaining.substring(0, splitIdx).trim();
        if (chunk) chunks.push(chunk);

        // Advance with overlap logic
        let nextStartIdx = splitIdx;
        if (overlapSize > 0 && splitIdx > overlapSize) {
            nextStartIdx = splitIdx - overlapSize;

            // Refine overlap: skip back to the last space to avoid breaking words twice
            const previousSpace = remaining.lastIndexOf(' ', nextStartIdx);
            if (previousSpace !== -1 && previousSpace > splitIdx - (overlapSize * 1.5)) {
                nextStartIdx = previousSpace;
            }
        }

        remaining = remaining.substring(nextStartIdx).trim();
    }

    return chunks;
}

/**
 * Legacy API support with improved internal logic
 */
export function smartChunk(text: string, options: ChunkerOptions = {}): ChunkResult[] {
    const { maxTokens = 1000, title = 'Bilinmeyen Döküman' } = options;
    if (!text?.trim()) return [];

    const rawChunks = splitConservingMarkdown(text, maxTokens, options.overlap || 0);
    return rawChunks.map((content, i) => ({
        content: `[Kaynak: ${title}]\n\n${content}`,
        sequence: i + 1
    }));
}

/**
 * Hierarchical (Parent-Child) semantic chunking
 */
export function hierarchicalChunk(text: string, options: ChunkerOptions = {}): { parent: string, children: string[] }[] {
    let parentMax = 1200; // Increased for better context per GAP analysis
    let childMax = 256;   // Optimized for precise vector search per GAP analysis
    let overlapAllowed = 100;

    try {
        const ragConfig = require('../../config/rag.config').RAG_CONFIG;
        parentMax = ragConfig.CHUNKING.PARENT_MAX_TOKENS;
        childMax = ragConfig.CHUNKING.CHILD_MAX_TOKENS;
        overlapAllowed = ragConfig.CHUNKING.OVERLAP_TOKENS;
    } catch { /* use defaults */ }

    const { title = 'Bilinmeyen Döküman' } = options;

    // 1. Split by Markdown Headers to keep sections atomic
    const sections = text.split(/(?=^#{1,4}\s)/m);
    const result: { parent: string, children: string[] }[] = [];

    for (const section of sections) {
        if (!section.trim()) continue;

        // Ensure section fits in parent chunks
        const pChunks = splitConservingMarkdown(section, parentMax, overlapAllowed);

        for (const pContent of pChunks) {
            const parent = `[Kaynak: ${title}]\n\n${pContent}`;

            // Create smaller children from this specific parent
            const cChunks = splitConservingMarkdown(pContent, childMax, Math.floor(overlapAllowed / 2));

            result.push({
                parent,
                children: cChunks
            });
        }
    }

    return result;
}
