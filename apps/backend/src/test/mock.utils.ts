export const mockPrismaService: any = {
    user: {
        findUnique: jest.fn(),
        findFirst: jest.fn(),
        findMany: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
        updateMany: jest.fn(),
        delete: jest.fn(),
    },
    tenant: {
        findUnique: jest.fn(),
        findFirst: jest.fn(),
        findMany: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
    },
    ticket: {
        findUnique: jest.fn(),
        findFirst: jest.fn(),
        findMany: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
        count: jest.fn(),
    },
    ticketMessage: {
        findMany: jest.fn(),
        create: jest.fn(),
    },
    team: {
        findUnique: jest.fn(),
        findFirst: jest.fn(),
        findMany: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
    },
    teamMember: {
        findUnique: jest.fn(),
        findFirst: jest.fn(),
        findMany: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
    },
    department: {
        findUnique: jest.fn(),
        findFirst: jest.fn(),
        findMany: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
    },
    product: {
        findUnique: jest.fn(),
        findFirst: jest.fn(),
        findMany: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
    },
    crmConnection: {
        findUnique: jest.fn(),
        findFirst: jest.fn(),
        findMany: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
        upsert: jest.fn(),
        delete: jest.fn(),
    },
    customerProfile: {
        findUnique: jest.fn(),
        findFirst: jest.fn(),
        findMany: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
        upsert: jest.fn(),
        delete: jest.fn(),
    },
    crmAccount: {
        findUnique: jest.fn(),
        findFirst: jest.fn(),
        findMany: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
        upsert: jest.fn(),
        delete: jest.fn(),
    },
    faqEntry: {
        findUnique: jest.fn(),
        findFirst: jest.fn(),
        findMany: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
    },
    interaction: {
        findUnique: jest.fn(),
        findFirst: jest.fn(),
        findMany: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
    },
    aiInteraction: {
        findUnique: jest.fn(),
        findFirst: jest.fn(),
        findMany: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
        count: jest.fn(),
        groupBy: jest.fn(),
        aggregate: jest.fn(),
        delete: jest.fn(),
    },
    $transaction: jest.fn((callback: any) => callback(mockPrismaService)),
    $queryRaw: jest.fn(),
    $queryRawUnsafe: jest.fn(),
    $executeRaw: jest.fn(),
    $executeRawUnsafe: jest.fn(),
};

export const mockConfigService = {
    get: jest.fn((key: string) => {
        switch (key) {
            case 'JWT_SECRET':
                return 'test-secret';
            case 'JWT_EXPIRES_IN':
                return '1h';
            case 'JWT_REFRESH_SECRET':
                return 'test-refresh-secret';
            case 'JWT_REFRESH_EXPIRES_IN':
                return '7d';
            default:
                return 'test-value';
        }
    }),
};

export const mockQueue = {
    add: jest.fn(),
};

export const mockAiService = {
    detectLanguage: jest.fn(),
    categorizeTicket: jest.fn(),
    summarizeTicket: jest.fn(),
    generateReplyDraft: jest.fn(),
};

export const mockS3Service = {
    uploadFile: jest.fn(),
    getFileUrl: jest.fn(),
};

export const mockRedisService = {
    get: jest.fn(),
    set: jest.fn(),
    del: jest.fn(),
    delPattern: jest.fn().mockResolvedValue(0),
    getHealthInfo: jest.fn().mockResolvedValue({}),
    getClient: jest.fn(() => ({
        get: jest.fn().mockResolvedValue(null),
        set: jest.fn().mockResolvedValue('OK'),
        incr: jest.fn().mockResolvedValue(1),
        incrby: jest.fn().mockResolvedValue(1),
        incrbyfloat: jest.fn().mockResolvedValue(1.0),
        expire: jest.fn().mockResolvedValue(1),
        del: jest.fn().mockResolvedValue(1),
        eval: jest.fn().mockResolvedValue(0),
        scan: jest.fn().mockResolvedValue(['0', []]),
        publish: jest.fn().mockResolvedValue(1),
    })),
};

export const mockEventEmitter = {
    emit: jest.fn().mockReturnValue(true),
    on: jest.fn(),
};

export const mockJwtService = {
    sign: jest.fn().mockReturnValue('mock-jwt-token'),
    verify: jest.fn().mockReturnValue({ sub: 'user-id', role: 'ADMIN' }),
};

export const mockMailService = {
    send: jest.fn().mockResolvedValue(true),
};

export const mockStorageService = {
    upload: jest.fn().mockResolvedValue('https://example.com/file.pdf'),
    getUrl: jest.fn().mockReturnValue('https://example.com/file.pdf'),
};
