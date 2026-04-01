import { z } from 'zod';

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
    JWT_SECRET: z.string().min(32, "JWT_SECRET must be at least 32 characters"),
    JWT_REFRESH_SECRET: z.string().min(32, "JWT_REFRESH_SECRET must be at least 32 characters"),
    JWT_EXPIRES_IN: z.string().default('24h'),
    JWT_REFRESH_EXPIRES_IN: z.string().default('7d'),

    // Security
    ENCRYPTION_KEY: z.string().length(32, "ENCRYPTION_KEY must be exactly 32 characters (AES-256)"),

    // Frontend
    FRONTEND_URL: z.string().url().default('http://localhost:3000'),
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

    EMBED_PROVIDER: z.enum(['OPENAI', 'LOCAL', 'MOCK']).default('OPENAI'),
    CHAT_PROVIDER: z.enum(['GROQ', 'OPENAI', 'ANTHROPIC', 'GEMINI', 'MOCK']).default('GROQ'),

    // Email
    MAIL_FROM: z.string().email().optional(),
    RESEND_API_KEY: z.string().optional(),

    // CRM
    CRM_SYNC_INTERVAL: z.string().default('0 0 * * *'), // Daily at midnight
});

export type Env = z.infer<typeof envSchema>;
