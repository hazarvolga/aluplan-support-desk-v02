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
 * Intelligent splitter that respects Markdown boundaries
 */
function splitConservingMarkdown(text: string, maxSize: number): string[] {
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

        // 1. Split at code block end
        const codeCloseIdx = sub.lastIndexOf('```');
        if (codeCloseIdx > maxSize * 0.7) splitIdx = codeCloseIdx + 3;

        // 2. Split at paragraph
        if (splitIdx === -1) {
            const pSplit = sub.lastIndexOf('\n\n');
            if (pSplit > maxSize * 0.4) splitIdx = pSplit;
        }

        // 3. Split at list item or line
        if (splitIdx === -1) {
            const nSplit = sub.lastIndexOf('\n');
            if (nSplit > maxSize * 0.6) splitIdx = nSplit;
        }

        // 4. Split at sentence
        if (splitIdx === -1) {
            const sSplit = sub.lastIndexOf('. ');
            if (sSplit > maxSize * 0.6) splitIdx = sSplit + 1;
        }

        if (splitIdx === -1) splitIdx = maxSize;

        const chunk = remaining.substring(0, splitIdx).trim();
        if (chunk) chunks.push(chunk);
        remaining = remaining.substring(splitIdx).trim();
    }

    return chunks;
}

/**
 * Legacy API support with improved internal logic
 */
export function smartChunk(text: string, options: ChunkerOptions = {}): ChunkResult[] {
    const { maxTokens = 1000, title = 'Bilinmeyen Döküman' } = options;
    if (!text?.trim()) return [];

    const rawChunks = splitConservingMarkdown(text, maxTokens);
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

    try {
        const ragConfig = require('../../config/rag.config').RAG_CONFIG;
        parentMax = ragConfig.CHUNKING.PARENT_MAX_TOKENS;
        childMax = ragConfig.CHUNKING.CHILD_MAX_TOKENS;
    } catch { /* use defaults */ }

    const { title = 'Bilinmeyen Döküman' } = options;

    // 1. Split by Markdown Headers to keep sections atomic
    const sections = text.split(/(?=^#{1,4}\s)/m);
    const result: { parent: string, children: string[] }[] = [];

    for (const section of sections) {
        if (!section.trim()) continue;

        // Ensure section fits in parent chunks
        const pChunks = splitConservingMarkdown(section, parentMax);

        for (const pContent of pChunks) {
            const parent = `[Kaynak: ${title}]\n\n${pContent}`;

            // Create smaller children from this specific parent
            const cChunks = splitConservingMarkdown(pContent, childMax);

            result.push({
                parent,
                children: cChunks
            });
        }
    }

    return result;
}
