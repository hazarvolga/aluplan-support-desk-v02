import { Logger } from '@nestjs/common';
import { Env, envSchema } from './env-validation.schema';

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
