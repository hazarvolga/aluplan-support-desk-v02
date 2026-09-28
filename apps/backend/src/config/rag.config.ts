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
        /** Near duplicate detection */
        EXACT: 0.95,
        /** Score >= this → HIGH confidence */
        HIGH: 0.85,
        /** Score >= this → MEDIUM confidence */
        MEDIUM: 0.70,
        /** Below this score, confidence is LOW (env-overridable) */
        LOW: parseFloat(process.env.LOW_CONFIDENCE_THRESHOLD || '0.62'),
        /** Absolute floor — never return below this */
        FLOOR: 0.45,
    },

    /** Hierarchical chunking parameters */
    CHUNKING: {
        /** Parent chunk max size (characters) — used for LLM context */
        PARENT_MAX_TOKENS: parseInt(process.env.CHUNK_PARENT_MAX_TOKENS || '1000', 10),
        /** Child chunk max size (characters) — used for vector search */
        CHILD_MAX_TOKENS: parseInt(process.env.CHUNK_CHILD_MAX_TOKENS || '500', 10),
        /** Overlap between chunks to prevent information loss */
        OVERLAP_TOKENS: parseInt(process.env.CHUNK_OVERLAP_TOKENS || '200', 10),
        /** Absolute minimum chunk size to prevent fragmentation */
        MIN_CHUNK_SIZE: 100,
    },

    /** Context window budget for prompt construction */
    CONTEXT: {
        /** Maximum characters to send as context to LLM */
        MAX_CONTEXT_CHARS: parseInt(process.env.MAX_CONTEXT_CHARS || '12000', 10),
        /** Approximate token limit (character proxy: 4 chars/token) */
        MAX_CONTEXT_TOKENS: 4096,
        /** Characters reserved for LLM response generation */
        RESPONSE_RESERVE_CHARS: 3000,
        /** Reserved tokens for system prompt */
        SYSTEM_RESERVE_TOKENS: 512,
        /** Reserved tokens for conversation history */
        HISTORY_RESERVE_TOKENS: 1024,
        /** Maximum tokens allowed for document context */
        DOCUMENT_CONTEXT_MAX_TOKENS: 2048,
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
        DEFAULT_TTL: parseInt(process.env.AI_CACHE_TTL || '3600', 10), // Increased to 1 hour
        /** Minimum semantic similarity required to reuse a cached AI response */
        SEMANTIC_THRESHOLD: parseFloat(process.env.AI_SEMANTIC_CACHE_THRESHOLD || '0.95'),
        /** Cache key version — bump to invalidate all caches */
        VERSION: 'v11',
    },

    /** FAQ candidate generation thresholds */
    FAQ: {
        /** Confidence required for automatic publication of FAQ candidates */
        AUTO_PUBLISH_THRESHOLD: parseFloat(process.env.FAQ_AUTO_PUBLISH_THRESHOLD || '0.85'),
    },

    /** Ticket clustering parameters for FAQ candidate discovery */
    CLUSTERING: {
        /** Minimum ticket similarity required to join a cluster */
        SIMILARITY_THRESHOLD: parseFloat(process.env.TICKET_CLUSTERING_SIMILARITY_THRESHOLD || '0.85'),
        /** Minimum number of similar tickets required to generate a candidate */
        MIN_CLUSTER_SIZE: parseInt(process.env.TICKET_CLUSTERING_MIN_CLUSTER_SIZE || '5', 10),
    },

    /** Trust score formula parameters for source ranking */
    TRUST_SCORE: {
        BASE: {
            ARTICLE: parseFloat(process.env.TRUST_SCORE_ARTICLE || '0.95'),
            DOCUMENT: parseFloat(process.env.TRUST_SCORE_DOCUMENT || '0.85'),
            URL_WHITELIST: parseFloat(process.env.TRUST_SCORE_URL_WHITELIST || '0.70'),
            URL_EXTERNAL: parseFloat(process.env.TRUST_SCORE_URL_EXTERNAL || '0.55'),
            FAQ_APPROVED: parseFloat(process.env.TRUST_SCORE_FAQ_APPROVED || '0.75'),
            FAQ_AUTO: parseFloat(process.env.TRUST_SCORE_FAQ_AUTO || '0.50'),
            TICKET: parseFloat(process.env.TRUST_SCORE_TICKET || '0.10'),
        },
        AGE: {
            FRESH_DAYS: parseInt(process.env.TRUST_SCORE_FRESH_DAYS || '30', 10),
            RECENT_DAYS: parseInt(process.env.TRUST_SCORE_RECENT_DAYS || '90', 10),
            STALE_DAYS: parseInt(process.env.TRUST_SCORE_STALE_DAYS || '180', 10),
            FRESH_FACTOR: parseFloat(process.env.TRUST_SCORE_FRESH_FACTOR || '1.00'),
            RECENT_FACTOR: parseFloat(process.env.TRUST_SCORE_RECENT_FACTOR || '0.95'),
            STALE_FACTOR: parseFloat(process.env.TRUST_SCORE_STALE_FACTOR || '0.85'),
            OLD_FACTOR: parseFloat(process.env.TRUST_SCORE_OLD_FACTOR || '0.70'),
        },
        FEEDBACK: {
            MIN_FACTOR: parseFloat(process.env.TRUST_SCORE_FEEDBACK_MIN_FACTOR || '0.8'),
            SPAN: parseFloat(process.env.TRUST_SCORE_FEEDBACK_SPAN || '0.4'),
        },
    },

    /** Re-ranking boost factors and weights */
    RERANK: {
        /** Source type multipliers */
        FACTORS: {
            ARTICLE: 1.30,
            FAQ: 1.35,
            DOCUMENT: 1.15,
            URL: 0.60,
            TICKET: 0.50,
        },
        /** Multi-factor ranking weights */
        WEIGHTS: {
            SEMANTIC: 0.70,
            RECENCY: 0.15,
            RATING: 0.15,
        },
        /** Decay constant for recency boost (days) */
        RECENCY_DECAY_DAYS: 30,
        /** Source applicability multipliers guard old docs from winning modern intents */
        APPLICABILITY: {
            LEGACY_SOFTLOCK_LICENSE: 0.30,
            LEGACY_VERSION_LICENSE: 0.45,
        },
    },

    /** Search defaults */
    SEARCH: {
        /** Default number of results to return */
        DEFAULT_LIMIT: 5,
        /** Max results to fetch before re-ranking */
        PRE_RERANK_LIMIT: 20,
    },

    /** Embedding configuration for abstraction layer */
    EMBEDDING: {
        /** Active embedding version (Settings DB'den override edilebilir) */
        DEFAULT_VERSION: 'v1',
        /** Cleanup için bekleme süresi (ms) — 24 saat */
        CLEANUP_DELAY_MS: 24 * 60 * 60 * 1000,
        /** Migration batch size */
        MIGRATION_BATCH_SIZE: 50,
        /** Gemini embedding model dimensions */
        GEMINI_DIM: 3072,
        /** OpenAI embedding dimensions */
        OPENAI_DIM: 1536,
        /** Ollama default dimensions */
        OLLAMA_DIM: 768,
    },
} as const;

/** Confidence band based on similarity score */
export function getConfidenceBand(similarity: number): 'HIGH' | 'MEDIUM' | 'LOW' {
    if (similarity >= RAG_CONFIG.SIMILARITY.HIGH) return 'HIGH';
    if (similarity >= RAG_CONFIG.SIMILARITY.MEDIUM) return 'MEDIUM';
    return 'LOW';
}
