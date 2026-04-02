import { envSchema } from './env-validation.schema';

export function validate(config: Record<string, unknown>) {
    const result = envSchema.safeParse(config);

    if (result.success === false) {
        console.error('❌ Invalid environment variables:', result.error.format());
        throw new Error('Invalid environment configuration');
    }

    return result.data;
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
        port: parseInt(process.env.PORT || '4000', 10),
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
            publicEndpoint: process.env.STORAGE_PUBLIC_ENDPOINT || process.env.STORAGE_ENDPOINT || 'http://localhost:9000',
            accessKey: process.env.STORAGE_ACCESS_KEY || '',
            secretKey: process.env.STORAGE_SECRET_KEY || '',
            bucket: process.env.STORAGE_BUCKET || 'aluplan-storage',
            region: process.env.STORAGE_REGION || 'auto', // R2 uses 'auto'
            usePathStyle: process.env.STORAGE_USE_PATH_STYLE ? process.env.STORAGE_USE_PATH_STYLE === 'true' : true,
            localPath: process.env.STORAGE_LOCAL_PATH || './uploads',
        },
        cookieDomain: process.env.COOKIE_DOMAIN,
    };

    if (isProduction) {
        console.log(`[Bootstrap] ⚙️ PRODUCTION CONFIG:
        - PORT: ${config.port}
        - DATABASE_HOST: ${config.database.url?.split('@')[1]?.split(':')[0] || 'MISSING'}
        - REDIS_URL: ${config.redis.url.replace(/\/\/.*@/, '//****:****@')}
        - REDIS_HOST: ${config.redis.host}
        - REDIS_PORT: ${config.redis.port}
        - STORAGE_ENDPOINT: ${config.storage.endpoint}
        - STORAGE_REGION: ${config.storage.region}`);

        if (config.storage.type === 'S3') {
            const host = config.storage.endpoint.split('//')[1]?.split(':')[0];
            if (host && host !== 'localhost' && !host.includes('cloudflarestorage.com')) {
                import('dns').then(dns => {
                    dns.lookup(host, (err) => {
                        if (err) {
                            console.error(`[Bootstrap] ❌ CRITICAL STORAGE DNS FAILURE: Host "${host}" is NOT resolvable from this container! (Error: ${err.code})`);
                            console.error(`[Bootstrap] 👉 TROUBLESHOOT: If using Minio, ensure containers share a network. If using R2, verify your endpoint URL.`);
                        } else {
                            console.log(`[Bootstrap] ✅ Storage Host "${host}" is resolvable.`);
                        }
                    });
                });
            } else if (host?.includes('cloudflarestorage.com')) {
                console.log(`[Bootstrap] ☁️ Cloudflare R2 detected as storage provider.`);
            }
        }

        if (!config.database.url) console.error('[Bootstrap] ❌ CRITICAL: DATABASE_URL is missing!');
        if (!process.env.REDIS_URL && !process.env.REDIS_HOST) {
            console.warn(`[Bootstrap] ⚠️ WARNING: Both REDIS_URL and REDIS_HOST missing. Using fallback URL: ${config.redis.url}`);
        }
    }

    return config;
};
