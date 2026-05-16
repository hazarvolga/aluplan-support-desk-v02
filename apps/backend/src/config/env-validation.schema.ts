import { z } from 'zod';

const optionalUrl = z.string().url().optional();

export const envSchema = z.object({
    NODE_ENV: z.enum(['development', 'production', 'test', 'provision']).default('development'),
    PORT: z.coerce.number().default(4000),

    // Database
    DATABASE_URL: z.string().url(),

    // Redis
    REDIS_URL: z.string().optional(),
    REDIS_HOST: z.string().default('localhost'),
    REDIS_PORT: z.coerce.number().default(6379),

    // Auth
    JWT_SECRET: z.string().min(32, "JWT_SECRET should be at least 32 characters"),
    JWT_REFRESH_SECRET: z.string().min(32, "JWT_REFRESH_SECRET should be at least 32 characters"),
    JWT_EXPIRES_IN: z.string().default('24h'),
    JWT_REFRESH_EXPIRES_IN: z.string().default('7d'),

    // Security
    ENCRYPTION_KEY: z.string().min(32).max(64, "ENCRYPTION_KEY must be 64 characters (Hex) or 32 characters (Raw)"),
    COOKIE_DOMAIN: z.string().optional(),

    // Frontend
    FRONTEND_URL: z.string().url().default('http://localhost:3000'),
    API_URL: optionalUrl,
    ALLOWED_ORIGINS: z.string().optional(),

    // Storage
    STORAGE_TYPE: z.enum(['LOCAL', 'S3']).default('LOCAL'),
    STORAGE_ENDPOINT: z.string().optional(),
    STORAGE_PUBLIC_ENDPOINT: z.string().optional(),
    STORAGE_ACCESS_KEY: z.string().optional(),
    STORAGE_SECRET_KEY: z.string().optional(),
    STORAGE_BUCKET: z.string().default('aluplan-storage'),
    STORAGE_REGION: z.string().default('auto'),
    STORAGE_USE_PATH_STYLE: z.coerce.boolean().default(true),
    STORAGE_LOCAL_PATH: z.string().default('./uploads'),

    // AI / RAG
    OPENAI_API_KEY: z.string().optional(),
    GROQ_API_KEY: z.string().optional(),
    ANTHROPIC_API_KEY: z.string().optional(),
    GEMINI_API_KEY: z.string().optional(),
    GEMINI_CHAT_MODEL: z.string().default('gemini-2.5-flash'),
    GEMINI_EMBED_MODEL: z.string().default('gemini-embedding-2'),
    LLMAPI_API_KEY: z.string().optional(),
    LLMAPI_BASE_URL: z.string().url().default('https://generativelanguage.googleapis.com/v1beta/openai'),
    LLMAPI_CHAT_MODEL: z.string().default('gemini-2.5-flash'),
    LLMAPI_EMBED_MODEL: z.string().default('gemini-embedding-2'),
    OLLAMA_BASE_URL: z.string().url().default('http://localhost:11434'),
    OLLAMA_MODEL: z.string().default('llama3.1'),
    OLLAMA_CHAT_MODEL: z.string().optional(),

    // GCP & Vertex AI
    GCP_PROJECT_ID: z.string().optional(),
    GCP_REGION: z.string().default('europe-west4'),
    GOOGLE_APPLICATION_CREDENTIALS: z.string().optional(),

    EMBED_PROVIDER: z.enum(['OPENAI', 'VERTEX', 'LOCAL', 'MOCK']).default('OPENAI'),
    CHAT_PROVIDER: z.enum(['GROQ', 'OPENAI', 'ANTHROPIC', 'GEMINI', 'MOCK']).default('GROQ'),

    // Email
    MAIL_FROM: z.string().email().optional(),
    RESEND_API_KEY: z.string().optional(),

    // CRM
    CRM_SYNC_INTERVAL: z.string().default('0 0 * * *'), // Daily at midnight
    CRM_DELTA_SYNC_INTERVAL: z.string().default('*/5 * * * *'),
    ADMIN_BYPASS_EMAILS: z.string().min(1, "ADMIN_BYPASS_EMAILS is required for security"),

    // Added from GAP-09
    EMBEDDING_PROVIDER: z.enum(['OPENAI', 'VERTEX', 'LOCAL', 'MOCK']).optional(),
    FAQ_SEMANTIC_DEDUP_THRESHOLD: z.coerce.number().optional(),
    AI_GLOBAL_DAILY_CAP: z.coerce.number().optional(),
    SLACK_WEBHOOK_URL: optionalUrl,
    ALERT_WEBHOOK_URL: optionalUrl,
    SENTRY_DSN: optionalUrl,
    OTEL_EXPORTER_OTLP_ENDPOINT: optionalUrl,
    LOKI_HOST: optionalUrl,
    RERANK_URL_HARD_FLOOR: z.coerce.number().min(0).max(1).optional(),
    AI_USER_DAILY_QUOTA: z.coerce.number().int().positive().optional(),
    AI_QUEUE_RATE_MAX: z.coerce.number().int().positive().optional(),
    AI_QUEUE_RATE_DURATION_MS: z.coerce.number().int().positive().optional(),
    AI_PROVIDER_QUOTA_COOLDOWN_MS: z.coerce.number().int().positive().optional(),
    KNOWLEDGE_SYNC_RATE_MAX: z.coerce.number().int().positive().optional(),
    KNOWLEDGE_SYNC_RATE_DURATION_MS: z.coerce.number().int().positive().optional(),
    KNOWLEDGE_SYNC_QUEUE_CONCURRENCY: z.coerce.number().int().positive().optional(),
    KNOWLEDGE_SYNC_BULK_DELAY_MS: z.coerce.number().int().nonnegative().default(15000),
    SIMILARITY_THRESHOLD: z.coerce.number().min(0).max(1).optional(),
    LOW_CONFIDENCE_THRESHOLD: z.coerce.number().min(0).max(1).optional(),
    CHUNK_PARENT_MAX_TOKENS: z.coerce.number().int().positive().optional(),
    CHUNK_CHILD_MAX_TOKENS: z.coerce.number().int().positive().optional(),
    CHUNK_OVERLAP_TOKENS: z.coerce.number().int().nonnegative().optional(),
    MAX_CONTEXT_CHARS: z.coerce.number().int().positive().optional(),
    AI_CACHE_TTL: z.coerce.number().int().positive().optional(),
    EMBEDDING_DIMENSIONS: z.coerce.number().int().positive().default(3072),
    SWAGGER_PASSWORD: z.string().min(8).optional(),
}).superRefine((env, ctx) => {
    if (
        env.SIMILARITY_THRESHOLD !== undefined &&
        env.LOW_CONFIDENCE_THRESHOLD !== undefined &&
        env.LOW_CONFIDENCE_THRESHOLD < env.SIMILARITY_THRESHOLD
    ) {
        ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ['LOW_CONFIDENCE_THRESHOLD'],
            message: 'LOW_CONFIDENCE_THRESHOLD must be greater than or equal to SIMILARITY_THRESHOLD',
        });
    }

    if (env.NODE_ENV !== 'production') {
        return;
    }

    if (!env.ALLOWED_ORIGINS?.trim()) {
        ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ['ALLOWED_ORIGINS'],
            message: 'ALLOWED_ORIGINS is required in production',
        });
    }

    if (!env.API_URL?.trim()) {
        ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ['API_URL'],
            message: 'API_URL is required in production for public email assets',
        });
    }

    if (env.API_URL) {
        try {
            const apiUrl = new URL(env.API_URL);
            if (apiUrl.protocol !== 'https:' || ['localhost', '127.0.0.1', '::1'].includes(apiUrl.hostname)) {
                ctx.addIssue({
                    code: z.ZodIssueCode.custom,
                    path: ['API_URL'],
                    message: 'Production API_URL must be a public HTTPS URL',
                });
            }
        } catch {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                path: ['API_URL'],
                message: 'API_URL must be a valid URL',
            });
        }
    }

    const unsafeOrigins = env.ALLOWED_ORIGINS?.split(',')
        .map(origin => origin.trim())
        .filter(origin => origin === '*' || origin.includes('localhost') || origin.includes('127.0.0.1'));

    if (unsafeOrigins?.length) {
        ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ['ALLOWED_ORIGINS'],
            message: `Production ALLOWED_ORIGINS contains unsafe origin(s): ${unsafeOrigins.join(', ')}`,
        });
    }
});

export type Env = z.infer<typeof envSchema>;
