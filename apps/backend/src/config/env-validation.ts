import { z } from 'zod';
import { Logger } from '@nestjs/common';

const envSchema = z.object({
    NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
    PORT: z.coerce.number().default(4000),
    DATABASE_URL: z.string().url(),
    REDIS_URL: z.string().url(),
    JWT_SECRET: z.string().min(32),
    JWT_REFRESH_SECRET: z.string().min(32),
    ENCRYPTION_KEY: z.string().min(32),
    FRONTEND_URL: z.string().url(),
    SWAGGER_PASSWORD: z.string().min(8).optional(),
});

export type Env = z.infer<typeof envSchema>;

export function validateEnv() {
    const logger = new Logger('EnvValidation');
    const result = envSchema.safeParse(process.env);

    if (!result.success) {
        logger.error('❌ Invalid environment variables:');
        result.error.issues.forEach((issue) => {
            logger.error(`  - ${issue.path.join('.')}: ${issue.message}`);
        });

        if (process.env.NODE_ENV === 'production') {
            logger.error('💥 Production requires strict environment variables. Exiting...');
            process.exit(1);
        } else {
            logger.warn('⚠️ Environment validation failed but continuing in non-production mode.');
        }
    } else {
        logger.log('✅ Environment variables validated');
    }

    return result.data;
}
