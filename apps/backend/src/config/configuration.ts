import { plainToInstance } from 'class-transformer';
import { IsEnum, IsNumber, IsOptional, IsString, validateSync } from 'class-validator';

enum Environment {
    Development = 'development',
    Production = 'production',
    Test = 'test',
    Provision = 'provision',
}

class EnvironmentVariables {
    @IsEnum(Environment)
    NODE_ENV: Environment;

    @IsNumber()
    PORT: number;

    @IsString()
    DATABASE_URL: string;

    @IsString()
    @IsOptional()
    REDIS_HOST: string = 'localhost';

    @IsNumber()
    @IsOptional()
    REDIS_PORT: number = 6379;
}

export function validate(config: Record<string, unknown>) {
    const validatedConfig = plainToInstance(
        EnvironmentVariables,
        config,
        { enableImplicitConversion: true },
    );
    const errors = validateSync(validatedConfig, { skipMissingProperties: false });

    if (errors.length > 0) {
        throw new Error(errors.toString());
    }
    return validatedConfig;
}

export default () => {
    const isProduction = process.env.NODE_ENV === 'production';

    // In production, we MUST have these variables. 
    // Fallbacks to localhost cause ECONNREFUSED inside Docker networks.
    const defaultRedisHost = isProduction ? 'redis-cache' : 'localhost';
    const defaultRedisPort = process.env.REDIS_PORT || '6379';
    const defaultRedisUrl = `redis://${defaultRedisHost}:${defaultRedisPort}/0`;

    const config = {
        nodeEnv: process.env.NODE_ENV || 'development',
        port: parseInt(process.env.PORT || '3001', 10),
        database: {
            url: process.env.DATABASE_URL,
        },
        redis: {
            url: (process.env.REDIS_URL || defaultRedisUrl).replace('redis://default:', 'redis://:'),
            // Keep host/port for backward compatibility if needed, but url is preferred
            host: process.env.REDIS_HOST || defaultRedisHost,
            port: parseInt(defaultRedisPort, 10),
        },
        storage: {
            type: process.env.STORAGE_TYPE || (process.env.STORAGE_ACCESS_KEY ? 'S3' : 'LOCAL'),
            endpoint: process.env.STORAGE_ENDPOINT || 'http://localhost:9000',
            accessKey: process.env.STORAGE_ACCESS_KEY || '',
            secretKey: process.env.STORAGE_SECRET_KEY || '',
            bucket: process.env.STORAGE_BUCKET || 'aluplan-storage',
            region: process.env.STORAGE_REGION || 'us-east-1',
            usePathStyle: process.env.STORAGE_USE_PATH_STYLE === 'true' || true,
            localPath: process.env.STORAGE_LOCAL_PATH || './uploads',
        },
    };

    if (isProduction) {
        console.log(`[Bootstrap] ⚙️ PRODUCTION CONFIG:
        - PORT: ${config.port}
        - DATABASE_HOST: ${config.database.url?.split('@')[1]?.split(':')[0] || 'MISSING'}
        - REDIS_URL: ${config.redis.url.replace(/\/\/.*@/, '//****:****@')}
        - REDIS_HOST: ${config.redis.host}
        - REDIS_PORT: ${config.redis.port}`);

        if (!config.database.url) console.error('[Bootstrap] ❌ CRITICAL: DATABASE_URL is missing!');
        if (!process.env.REDIS_URL && !process.env.REDIS_HOST) {
            console.warn(`[Bootstrap] ⚠️ WARNING: Both REDIS_URL and REDIS_HOST missing. Using fallback URL: ${config.redis.url}`);
        }
    }

    return config;
};
