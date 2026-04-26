// apps/backend/test/setup.ts

// Mock Langfuse (prevents ERR_VM_DYNAMIC_IMPORT_CALLBACK_MISSING_FLAG)
jest.mock('langfuse', () => ({
    Langfuse: jest.fn().mockImplementation(() => ({
        trace: jest.fn().mockReturnValue({
            span: jest.fn().mockReturnValue({
                end: jest.fn(),
                generation: jest.fn().mockReturnValue({ end: jest.fn() }),
            }),
            end: jest.fn(),
        }),
        generation: jest.fn().mockReturnValue({ end: jest.fn() }),
        flush: jest.fn().mockResolvedValue(undefined),
        shutdown: jest.fn().mockResolvedValue(undefined),
    })),
}));

jest.mock('langfuse-core', () => ({
    LangfuseCore: jest.fn(),
    LangfuseMedia: jest.fn(),
}));

// Mock IORedis — must expose `default` and `Cluster` so `instanceof` checks
// in third-party libraries (e.g. @nest-lab/throttler-storage-redis) don't crash
// with "Right-hand side of 'instanceof' is not an object".
// The fake client is permissive: any unknown method returns a resolved
// "no-op" value so libraries calling Lua scripts via `call`/`eval` keep working.
jest.mock('ioredis', () => {
    const fakeClient = (): any => {
        // Default permissive return shape: enough fields for `[totalHits, ttl, isBlocked, timeToBlockExpire]`
        const noop = jest.fn().mockResolvedValue([0, 60_000, 0, 0]);
        const handler: ProxyHandler<any> = {
            get(target, prop) {
                if (prop in target) return (target as any)[prop];
                if (prop === 'status') return 'ready';
                if (prop === 'then' || prop === 'catch') return undefined;
                return noop;
            },
        };
        return new Proxy({
            on: jest.fn(),
            once: jest.fn(),
            off: jest.fn(),
            removeListener: jest.fn(),
            disconnect: jest.fn().mockResolvedValue(true),
            quit: jest.fn().mockResolvedValue(true),
            defineCommand: jest.fn(),
            duplicate: jest.fn(function () { return fakeClient(); }),
        }, handler);
    };

    const RedisMock = jest.fn().mockImplementation(fakeClient);
    const ClusterMock = jest.fn().mockImplementation(fakeClient);

    return {
        __esModule: true,
        default: RedisMock,
        Redis: RedisMock,
        Cluster: ClusterMock,
    };
});

// Mock @bull-board/api — its BullMQAdapter does an `instanceof Queue` check
// against the real BullMQ class, which fails for our mocked queues.
jest.mock('@bull-board/api/bullMQAdapter', () => ({
    BullMQAdapter: jest.fn().mockImplementation(() => ({})),
}));
jest.mock('@bull-board/api', () => ({
    createBullBoard: jest.fn().mockReturnValue({ addQueue: jest.fn() }),
}));
jest.mock('@bull-board/express', () => ({
    ExpressAdapter: jest.fn().mockImplementation(() => ({
        setBasePath: jest.fn(),
        getRouter: jest.fn().mockReturnValue((_req: any, _res: any, next: any) => next()),
    })),
}));

// Mock BullMQ
jest.mock('bullmq', () => {
    return {
        Queue: jest.fn().mockImplementation(() => ({
            add: jest.fn().mockResolvedValue({ id: '1' }),
            close: jest.fn().mockResolvedValue(undefined),
        })),
        Worker: jest.fn().mockImplementation(() => ({
            on: jest.fn(),
            close: jest.fn().mockResolvedValue(undefined),
        })),
        QueueEvents: jest.fn().mockImplementation(() => ({
            on: jest.fn(),
            close: jest.fn().mockResolvedValue(undefined),
        }))
    };
});

// Global console mock to prevent test clutter (optional)
// console.log = jest.fn();
// console.error = jest.fn();
