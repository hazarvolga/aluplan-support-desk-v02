import { NotFoundException } from '@nestjs/common';
import { StorageController } from './storage.controller';

describe('StorageController', () => {
    const configService = {
        get: jest.fn((key: string) => key === 'storage.localPath' ? './uploads' : undefined),
    };

    let controller: StorageController;
    const prisma = { attachment: { findMany: jest.fn().mockResolvedValue([]) } };

    beforeEach(() => {
        jest.clearAllMocks();
        controller = new StorageController(configService as any, prisma as any, {} as any);
    });

    it('normalizes wildcard path arrays before local file lookup', async () => {
        await expect(controller.getFile(['tickets', 'test.png'], {} as any, { user: { id: 'user' } })).rejects.toThrow(NotFoundException);
        expect(prisma.attachment.findMany).toHaveBeenCalledWith(expect.objectContaining({ where: { url: 'tickets/test.png' } }));
    });

    it('returns 404 instead of crashing when no path segment is provided', async () => {
        await expect(controller.getFile(undefined as any, {} as any, {})).rejects.toThrow(NotFoundException);
        expect(prisma.attachment.findMany).not.toHaveBeenCalled();
    });
});
