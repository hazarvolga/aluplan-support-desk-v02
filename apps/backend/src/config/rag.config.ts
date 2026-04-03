/**
 * Centralized RAG Configuration
 * ==============================
 * Single source of truth for ALL RAG-related parameters.
 * Do NOT hardcode thresholds/chunk sizes elsewhere — import from here.
 */

export const RAG_CONFIG = {
    /** Similarity thresholds for vector search */
    SIMILARITY: {
        /** Minimum score to include in results (env-overridable) */
        THRESHOLD: parseFloat(process.env.SIMILARITY_THRESHOLD || '0.25'),
        /** Below this score, confidence is LOW (env-overridable) */
        LOW_CONFIDENCE: parseFloat(process.env.LOW_CONFIDENCE_THRESHOLD || '0.30'),
        /** Score >= this → HIGH confidence */
        HIGH: 0.60,
        /** Score >= this → MEDIUM confidence */
        MEDIUM: 0.40,
        /** Absolute floor — never return below this */
        FLOOR: 0.15,
    },

    /** Hierarchical chunking parameters */
    CHUNKING: {
        /** Parent chunk max size (characters) — used for LLM context */
        PARENT_MAX_TOKENS: parseInt(process.env.CHUNK_PARENT_MAX_TOKENS || '800', 10),
        /** Child chunk max size (characters) — used for vector search */
        CHILD_MAX_TOKENS: parseInt(process.env.CHUNK_CHILD_MAX_TOKENS || '450', 10),
        /** Overlap between chunks to prevent information loss */
        OVERLAP_TOKENS: parseInt(process.env.CHUNK_OVERLAP_TOKENS || '100', 10),
    },

    /** Context window budget for prompt construction */
    CONTEXT: {
        /** Maximum characters to send as context to LLM */
        MAX_CONTEXT_CHARS: parseInt(process.env.MAX_CONTEXT_CHARS || '12000', 10),
        /** Characters reserved for LLM response generation */
        RESPONSE_RESERVE_CHARS: 3000,
        /** Priority weights for context sections (higher = more important, kept first) */
        PRIORITIES: {
            APPROVED_KNOWLEDGE_SOURCE: 10,
            USER_QUERY: 9,
            HOTINFO_DATA: 8,
            RECENT_TICKETS: 5,
            USER_PROFILE: 4,
            SYSTEM_RULES: 3,
            MACROS: 1,
        } as Record<string, number>,
    },

    /** Cache configuration */
    CACHE: {
        /** Default TTL for AI query cache in seconds */
        DEFAULT_TTL: parseInt(process.env.AI_CACHE_TTL || '300', 10),
        /** Cache key version — bump to invalidate all caches */
        VERSION: 'v5',
    },

    /** Re-ranking boost factors by source type */
    RERANK: {
        ARTICLE: 1.30,
        DOCUMENT: 1.15,
        URL: 0.60,
        TICKET: 0.50,
    },

    /** Search defaults */
    SEARCH: {
        /** Default number of results to return */
        DEFAULT_LIMIT: 5,
        /** Max results to fetch before re-ranking */
        PRE_RERANK_LIMIT: 15,
    },
} as const;

/** Confidence band based on similarity score */
export function getConfidenceBand(similarity: number): 'HIGH' | 'MEDIUM' | 'LOW' {
    if (similarity >= RAG_CONFIG.SIMILARITY.HIGH) return 'HIGH';
    if (similarity >= RAG_CONFIG.SIMILARITY.MEDIUM) return 'MEDIUM';
    return 'LOW';
}
