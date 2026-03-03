import { Injectable, Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';

@Injectable()
export class RedisService implements OnModuleInit, OnModuleDestroy {
    private readonly logger = new Logger(RedisService.name);
    private client: Redis;

    constructor(private readonly config: ConfigService) { }

    onModuleInit() {
        const url = this.config.get<string>('redis.url') as string;

        this.client = new Redis(url, {
            retryStrategy: (times) => Math.min(times * 50, 2000),
        });

        this.client.on('connect', () => this.logger.log('✅ Redis connected'));
        this.client.on('error', (err) => this.logger.error('❌ Redis error', err.stack));
    }

    onModuleDestroy() {
        this.client.disconnect();
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

    async del(key: string): Promise<void> {
        await this.client.del(key);
    }

    getClient(): Redis {
        return this.client;
    }
}
