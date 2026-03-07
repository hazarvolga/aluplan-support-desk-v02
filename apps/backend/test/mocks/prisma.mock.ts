// apps/backend/test/mocks/prisma.mock.ts
import { Provider } from '@nestjs/common';
import { PrismaService } from '../../src/prisma/prisma.service';

export const mockPrismaService = {
    department: { findMany: jest.fn(), findUnique: jest.fn() },
    team: { findMany: jest.fn(), create: jest.fn(), findUnique: jest.fn() },
    teamMember: { upsert: jest.fn(), delete: jest.fn() },
    user: { findUnique: jest.fn(), update: jest.fn(), findMany: jest.fn() },
    skill: { findMany: jest.fn() },
    agentSkill: { upsert: jest.fn() },
    knowledgeArticle: { findMany: jest.fn(), update: jest.fn(), findUnique: jest.fn() },
    knowledgeSource: { findMany: jest.fn() },
    ticket: { findMany: jest.fn(), findUnique: jest.fn(), create: jest.fn(), update: jest.fn() },
    aiInteraction: { create: jest.fn(), update: jest.fn() },
    customerProfile: { findUnique: jest.fn() },
    // raw queries
    $queryRaw: jest.fn(),
    $executeRaw: jest.fn(),
    $transaction: jest.fn((callback) => callback(mockPrismaService)),
};

export const PrismaServiceProvider: Provider = {
    provide: PrismaService,
    useValue: mockPrismaService,
};
