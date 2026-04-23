/**
 * GAP-08: Centralized Redis TTL Strategy
 * Single source of truth for all cache TTL values across the application.
 */
export const REDIS_TTL = {
    /** Embedding vector search cache — refreshed hourly */
    EMBEDDING_CACHE: 3600,

    /** Active user session metadata — 15 minutes */
    SESSION_CACHE: 900,

    /** AI-generated responses — 30 minutes */
    AI_RESPONSE_CACHE: 1800,

    /** Rate limiter windows — matches throttler config */
    RATE_LIMIT: 60,

    /** Health check status cache — 30 seconds */
    HEALTH_CHECK: 30,

    /** Knowledge Base article cache — 2 hours */
    KB_ARTICLE_CACHE: 7200,

    /** CRM data cache — 10 minutes */
    CRM_DATA_CACHE: 600,

    /** FAQ entries — 1 hour */
    FAQ_CACHE: 3600,

    /** Product catalog — 4 hours */
    PRODUCT_CACHE: 14400,

    /** Notification preferences — 15 minutes */
    NOTIFICATION_PREFS: 900,
} as const;

export type RedisTTLKey = keyof typeof REDIS_TTL;
