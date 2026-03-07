// apps/backend/test/setup.ts
import { jest } from '@jest/globals';

// Mock IORedis
jest.mock('ioredis', () => {
    return jest.fn().mockImplementation(() => {
        return {
            on: jest.fn(),
            get: jest.fn(),
            set: jest.fn(),
            del: jest.fn(),
            quit: jest.fn().mockResolvedValue(true),
            disconnect: jest.fn().mockResolvedValue(true),
            ping: jest.fn().mockResolvedValue('PONG'),
            status: 'ready'
        };
    });
});

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
