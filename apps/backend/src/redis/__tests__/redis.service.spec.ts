import { Test, TestingModule } from '@nestjs/testing';
import { RedisService } from '../redis.service';
import { ConfigService } from '@nestjs/config';

const mockRedisClient = {
    get: jest.fn(),
    set: jest.fn(),
    del: jest.fn(),
    scan: jest.fn(),
    publish: jest.fn(),
    info: jest.fn(),
    quit: jest.fn(),
    disconnect: jest.fn(),
    on: jest.fn(),
};

jest.mock('ioredis', () => {
    return jest.fn().mockImplementation(() => mockRedisClient);
});

describe('RedisService', () => {
    let service: RedisService;

    beforeEach(async () => {
        jest.clearAllMocks();
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                RedisService,
                { provide: ConfigService, useValue: { get: () => 'redis://localhost:6379' } },
            ],
        }).compile();

        service = module.get<RedisService>(RedisService);
        service.onModuleInit();
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    describe('get/set/del', () => {
        it('should get a value', async () => {
            mockRedisClient.get.mockResolvedValue('hello');
            const result = await service.get('key1');
            expect(result).toBe('hello');
            expect(mockRedisClient.get).toHaveBeenCalledWith('key1');
        });

        it('should set a value without TTL', async () => {
            await service.set('key1', 'value1');
            expect(mockRedisClient.set).toHaveBeenCalledWith('key1', 'value1');
        });

        it('should set a value with TTL', async () => {
            await service.set('key1', 'value1', 300);
            expect(mockRedisClient.set).toHaveBeenCalledWith('key1', 'value1', 'EX', 300);
        });

        it('should delete a key', async () => {
            await service.del('key1');
            expect(mockRedisClient.del).toHaveBeenCalledWith('key1');
        });
    });

    describe('delPattern (SCAN-based)', () => {
        it('should delete keys matching pattern in batches', async () => {
            mockRedisClient.scan
                .mockResolvedValueOnce(['1', ['a:1', 'a:2']])
                .mockResolvedValueOnce(['0', ['a:3']]);
            mockRedisClient.del
                .mockResolvedValueOnce(2)
                .mockResolvedValueOnce(1);

            const result = await service.delPattern('a:*', 100);

            expect(mockRedisClient.scan).toHaveBeenCalledWith('0', 'MATCH', 'a:*', 'COUNT', 100);
            expect(mockRedisClient.scan).toHaveBeenCalledWith('1', 'MATCH', 'a:*', 'COUNT', 100);
            expect(mockRedisClient.del).toHaveBeenCalledWith('a:1', 'a:2');
            expect(mockRedisClient.del).toHaveBeenCalledWith('a:3');
            expect(result).toBe(3);
        });

        it('should return 0 when no keys match', async () => {
            mockRedisClient.scan.mockResolvedValue(['0', []]);
            const result = await service.delPattern('nomatch:*');
            expect(result).toBe(0);
            expect(mockRedisClient.del).not.toHaveBeenCalled();
        });
    });

    describe('publish', () => {
        it('should publish to a channel', async () => {
            await service.publish('channel1', 'message');
            expect(mockRedisClient.publish).toHaveBeenCalledWith('channel1', 'message');
        });
    });

    describe('getHealthInfo', () => {
        it('should return parsed health metrics', async () => {
            mockRedisClient.info
                .mockResolvedValueOnce('used_memory:1048576\r\n')
                .mockResolvedValueOnce('keyspace_hits:100\r\nkeyspace_misses:50\r\n')
                .mockResolvedValueOnce('connected_clients:10\r\n');

            const result = await service.getHealthInfo();

            expect(result).toEqual({
                memoryUsedMB: 1,
                connectedClients: 10,
                hitRate: expect.closeTo(66.67, 0.01),
            });
        });

        it('should return zeros on error', async () => {
            mockRedisClient.info.mockRejectedValue(new Error('Redis down'));
            const result = await service.getHealthInfo();
            expect(result).toEqual({ memoryUsedMB: 0, connectedClients: 0, hitRate: 0 });
        });
    });
});
