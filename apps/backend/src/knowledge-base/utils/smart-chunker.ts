export interface ChunkResult {
    content: string;
    sequence: number;
}

export interface ChunkerOptions {
    maxTokens?: number; // rough estimate (characters or tokens depending on logic)
    overlap?: number;
    title?: string; // used for context injection
}

/**
 * A simple smart chunker that attempts to split a Markdown document into meaningful pieces.
 * - It splits by double newlines to keep paragraphs/headers together.
 * - If a chunk exceeds maxTokens, it tries to split further.
 * - Adds an overlap of previous text to maintain context.
 * - Injects the general 'title' at the start of every chunk.
 */
export function smartChunk(text: string, options: ChunkerOptions = {}): ChunkResult[] {
    const { maxTokens = 1000, overlap = 200, title = 'Bilinmeyen Döküman' } = options;

    // Fallback if text is empty
    if (!text || text.trim() === '') {
        return [];
    }

    const sentences = text.split('\n\n'); // simplest semantic split point
    const chunks: ChunkResult[] = [];

    let currentChunk = '';
    let sequence = 1;

    for (const sentence of sentences) {
        if ((currentChunk.length + sentence.length) > maxTokens && currentChunk.length > 0) {
            // Push current chunk
            chunks.push({
                content: `[Kaynak: ${title}]\n\n${currentChunk.trim()}`,
                sequence: sequence++
            });

            // Create overlap: take the last `overlap` characters of the currentChunk
            let overlapText = currentChunk.slice(-overlap);
            // try to make overlap start at a clean word boundary
            const firstSpace = overlapText.indexOf(' ');
            if (firstSpace !== -1 && firstSpace < overlap / 2) {
                overlapText = overlapText.substring(firstSpace).trim();
            }
            // start new chunk with overlap + next sentence
            currentChunk = overlapText + '\n\n' + sentence;
        } else {
            currentChunk += (currentChunk ? '\n\n' : '') + sentence;
        }
    }

    // Push the last remaining chunk
    if (currentChunk.trim().length > 0) {
        chunks.push({
            content: `[Kaynak: ${title}]\n\n${currentChunk.trim()}`,
            sequence: sequence++
        });
    }

    return chunks;
}

/**
 * Hierarchical (Parent-Child) chunking for better RAG quality.
 * - Parent: Large context for LLM (1500-2000 tokens/chars)
 * - Child: Small chunks for vector search (300-500 tokens/chars)
 */
export function hierarchicalChunk(text: string, options: ChunkerOptions = {}): { parent: string, children: string[] }[] {
    const { maxTokens = 2000, title = 'Bilinmeyen Döküman' } = options;
    const CHILD_SIZE = 400;

    // 1. Create large Parent chunks
    const parents = smartChunk(text, { maxTokens, title });

    return parents.map(p => {
        // 2. Further split each parent into smaller Children
        // We use the same smartChunk logic but with smaller size and no title prefix for children
        // to keep them "clean" for embedding vector distance.
        const children = smartChunk(p.content.replace(`[Kaynak: ${title}]\n\n`, ''), {
            maxTokens: CHILD_SIZE,
            overlap: 100,
            title: ''
        });

        return {
            parent: p.content,
            children: children.map(c => c.content)
        };
    });
}
