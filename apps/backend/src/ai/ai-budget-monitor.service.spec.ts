import { Test, TestingModule } from '@nestjs/testing';
import { AiBudgetMonitor } from './ai-budget-monitor.service';
import { SettingsService } from '../settings/settings.service';
import { RedisService } from '../redis/redis.service';
import { AiProviderRouter } from './ai-provider-router.service';
import { ConfigService } from '@nestjs/config';

const makeRedisClient = () => ({
    incrbyfloat: jest.fn().mockResolvedValue(1.0),
    incr: jest.fn().mockResolvedValue(1),
    incrby: jest.fn().mockResolvedValue(1),
    expire: jest.fn().mockResolvedValue(1),
    del: jest.fn().mockResolvedValue(1),
});

const mockRedis = {
    get: jest.fn().mockResolvedValue('0'),
    set: jest.fn().mockResolvedValue(undefined),
    getClient: jest.fn(),
};

const mockSettings = {
    getValue: jest.fn().mockResolvedValue(null),
    setValue: jest.fn().mockResolvedValue(undefined),
};

const mockRouter = {
    getTenantConfig: jest.fn().mockResolvedValue({
        budget: { dailyCap: 10.0, warningThreshold: 0.8 },
    }),
};

const mockConfig = {
    get: jest.fn((key: string, def: string) => {
        if (key === 'AI_GLOBAL_DAILY_CAP') return '50.0';
        if (key === 'SLACK_WEBHOOK_URL') return undefined;
        return def;
    }),
};

describe('AiBudgetMonitor', () => {
    let service: AiBudgetMonitor;
    let redisClient: ReturnType<typeof makeRedisClient>;

    beforeEach(async () => {
        redisClient = makeRedisClient();
        mockRedis.getClient.mockReturnValue(redisClient);

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                AiBudgetMonitor,
                { provide: SettingsService, useValue: mockSettings },
                { provide: RedisService, useValue: mockRedis },
                { provide: AiProviderRouter, useValue: mockRouter },
                { provide: ConfigService, useValue: mockConfig },
            ],
        }).compile();

        service = module.get<AiBudgetMonitor>(AiBudgetMonitor);
    });

    afterEach(() => jest.clearAllMocks());

    // ─── estimateCost ────────────────────────────────────────────────────────
    describe('estimateCost', () => {
        it('returns correct cost for openai:gpt-4o-mini', () => {
            // 1000 input tokens @ $0.15/M + 500 output @ $0.60/M
            const cost = service.estimateCost('openai', 'gpt-4o-mini', 1_000, 500);
            expect(cost).toBeCloseTo((1000 * 0.15 + 500 * 0.60) / 1_000_000, 10);
        });

        it('returns correct cost for openai:gpt-4o', () => {
            const cost = service.estimateCost('openai', 'gpt-4o', 2_000, 1_000);
            expect(cost).toBeCloseTo((2000 * 2.50 + 1000 * 10.00) / 1_000_000, 10);
        });

        it('returns 0 for ollama (free local inference)', () => {
            expect(service.estimateCost('ollama', 'llama3', 10_000, 5_000)).toBe(0);
        });

        it('returns 0 for groq:llama-3.1-8b-instant with 0 tokens', () => {
            expect(service.estimateCost('groq', 'llama-3.1-8b-instant', 0, 0)).toBe(0);
        });

        it('returns 0 and logs warning for unknown provider:model', () => {
            const cost = service.estimateCost('unknown-provider', 'unknown-model', 500, 500);
            expect(cost).toBe(0);
        });

        it('is case-insensitive for provider and model', () => {
            const lower = service.estimateCost('openai', 'gpt-4o-mini', 1_000, 0);
            const upper = service.estimateCost('OpenAI', 'GPT-4O-MINI', 1_000, 0);
            expect(lower).toBeCloseTo(upper, 10);
        });
    });

    // ─── recordUsage ────────────────────────────────────────────────────────
    describe('recordUsage', () => {
        it('increments global and tenant cost keys in Redis', async () => {
            await service.recordUsage('tenant-1', 0.005, 1000, 300);

            expect(redisClient.incrbyfloat).toHaveBeenCalledTimes(2);
            const calls = (redisClient.incrbyfloat as jest.Mock).mock.calls;
            expect(calls[0][0]).toMatch(/ai:budget:global:cost:/);
            expect(calls[1][0]).toMatch(/ai:budget:tenant-1:cost:/);
            expect(calls[0][1]).toBe(0.005);
        });

        it('increments token counter key in Redis', async () => {
            await service.recordUsage('tenant-2', 0.001, 800, 200);

            expect(redisClient.incrby).toHaveBeenCalledWith(
                expect.stringMatching(/ai:budget:tenant-2:tokens:/),
                1000, // 800 + 200
            );
        });

        it('sets 24h TTL on all keys', async () => {
            await service.recordUsage('tenant-3', 0.0, 100, 100);
            // 3 keys: global cost, tenant cost, tenant tokens — each gets expire
            expect(redisClient.expire).toHaveBeenCalledTimes(3);
            const expireCalls = (redisClient.expire as jest.Mock).mock.calls;
            expireCalls.forEach((c) => expect(c[1]).toBe(86400));
        });
    });

    // ─── isBudgetExceeded ────────────────────────────────────────────────────
    describe('isBudgetExceeded', () => {
        it('returns exceeded=false when spend is below cap', async () => {
            mockRedis.get.mockResolvedValue('5.0'); // well below 50 global + 10 tenant
            const result = await service.isBudgetExceeded('tenant-1');
            expect(result.exceeded).toBe(false);
        });

        it('returns exceeded=true when global cost >= globalCap', async () => {
            mockRedis.get.mockResolvedValue('50.0'); // equals the 50.0 cap
            const result = await service.isBudgetExceeded('tenant-1');
            expect(result.exceeded).toBe(true);
            expect(result.reason).toMatch(/Global budget exceeded/);
        });

        it('returns exceeded=true when tenant cost >= tenantCap', async () => {
            // First call (global) returns low value, second (tenant) returns at cap
            mockRedis.get
                .mockResolvedValueOnce('1.0')  // global — below cap
                .mockResolvedValueOnce('10.0'); // tenant — at 10.0 cap
            const result = await service.isBudgetExceeded('tenant-1');
            expect(result.exceeded).toBe(true);
            expect(result.reason).toMatch(/Tenant budget exceeded/);
        });
    });

    // ─── globalCap initialisation ────────────────────────────────────────────
    describe('constructor', () => {
        it('reads globalCap from ConfigService', () => {
            // globalCap should be 50.0 as configured in mockConfig
            // Verify via getBudgetStatus (it exposes cap)
            mockRedis.get.mockResolvedValue('0');
            return service.getBudgetStatus('any').then((status) => {
                expect(status.global.cap).toBe(50.0);
            });
        });
    });
});
