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
    $transaction: jest.fn((callback: any) => callback(mockPrismaService)),
    $queryRaw: jest.fn(),
    $queryRawUnsafe: jest.fn(),
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
    getClient: jest.fn(() => ({
        get: jest.fn(),
        set: jest.fn(),
        incr: jest.fn(),
        incrby: jest.fn(),
        incrbyfloat: jest.fn(),
        expire: jest.fn(),
        del: jest.fn(),
        eval: jest.fn(),
    })),
};
