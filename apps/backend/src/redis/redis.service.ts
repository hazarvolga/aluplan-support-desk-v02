import { Injectable, Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';
import { REDIS_TTL, RedisTTLKey } from '../config/redis.config';

@Injectable()
export class RedisService implements OnModuleInit, OnModuleDestroy {
    private readonly logger = new Logger(RedisService.name);
    private client: Redis;

    constructor(private readonly config: ConfigService) { }

    onModuleInit() {
        const url = this.config.get<string>('redis.url') as string;

        // GAP-07: Enhanced connection with pooling-ready options
        this.client = new Redis(url, {
            retryStrategy: (times) => Math.min(times * 100, 5000),
            maxRetriesPerRequest: 3,
            connectTimeout: 10000,
            enableReadyCheck: true,
            lazyConnect: false,
        });

        this.client.on('connect', () => this.logger.log('✅ Redis connected'));
        this.client.on('ready', () => this.logger.log('✅ Redis ready'));
        this.client.on('error', (err) => this.logger.error('❌ Redis error', err.stack));
        this.client.on('reconnecting', (ms: number) => this.logger.warn(`🔄 Redis reconnecting in ${ms}ms`));
    }

    onModuleDestroy() {
        this.client.quit().catch(() => this.client.disconnect());
    }

    async get(key: string): Promise<string | null> {
        return this.client.get(key);
    }

    async set(key: string, value: string, ttlSeconds?: number): Promise<void> {
        if (ttlSeconds) {
            await this.client.set(key, value, 'EX', ttlSeconds);
        } else {
            await this.client.set(key, value);
        }
    }

    /** Set with centralized TTL from redis.config.ts */
    async setWithTTL(key: string, value: string, ttlKey: RedisTTLKey): Promise<void> {
        await this.client.set(key, value, 'EX', REDIS_TTL[ttlKey]);
    }

    async del(key: string): Promise<void> {
        await this.client.del(key);
    }

    /**
     * Pattern-based cache invalidation using SCAN (non-blocking).
     * Iterates Redis keyspace in batches to avoid blocking the server.
     */
    async delPattern(pattern: string, batchSize = 100): Promise<number> {
        let cursor = '0';
        let totalDeleted = 0;

        do {
            const result = await this.client.scan(cursor, 'MATCH', pattern, 'COUNT', batchSize);
            cursor = result[0];
            const keys = result[1];

            if (keys.length > 0) {
                const deleted = await this.client.del(...keys);
                totalDeleted += deleted;
            }
        } while (cursor !== '0');

        return totalDeleted;
    }

    /** Pub/Sub publish helper */
    async publish(channel: string, message: string): Promise<void> {
        await this.client.publish(channel, message);
    }

    /** Health introspection — memory usage and connection info */
    async getHealthInfo(): Promise<{ memoryUsedMB: number; connectedClients: number; hitRate: number }> {
        try {
            const info = await this.client.info('memory');
            const statsInfo = await this.client.info('stats');
            const clientsInfo = await this.client.info('clients');

            const memMatch = info.match(/used_memory:(\d+)/);
            const hitsMatch = statsInfo.match(/keyspace_hits:(\d+)/);
            const missesMatch = statsInfo.match(/keyspace_misses:(\d+)/);
            const clientsMatch = clientsInfo.match(/connected_clients:(\d+)/);

            const hits = parseInt(hitsMatch?.[1] || '0', 10);
            const misses = parseInt(missesMatch?.[1] || '0', 10);
            const hitRate = hits + misses > 0 ? (hits / (hits + misses)) * 100 : 0;

            return {
                memoryUsedMB: parseInt(memMatch?.[1] || '0', 10) / (1024 * 1024),
                connectedClients: parseInt(clientsMatch?.[1] || '0', 10),
                hitRate: Math.round(hitRate * 100) / 100,
            };
        } catch {
            return { memoryUsedMB: 0, connectedClients: 0, hitRate: 0 };
        }
    }

    getClient(): Redis {
        return this.client;
    }
}

