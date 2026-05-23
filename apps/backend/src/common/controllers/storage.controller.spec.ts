import { NotFoundException } from '@nestjs/common';
import * as fs from 'fs-extra';
import { StorageController } from './storage.controller';

jest.mock('fs-extra', () => ({
    pathExists: jest.fn(),
    stat: jest.fn(),
    createReadStream: jest.fn(),
}));

describe('StorageController', () => {
    const configService = {
        get: jest.fn((key: string) => key === 'storage.localPath' ? './uploads' : undefined),
    };

    let controller: StorageController;

    beforeEach(() => {
        jest.clearAllMocks();
        controller = new StorageController(configService as any);
    });

    it('normalizes wildcard path arrays before local file lookup', async () => {
        (fs.pathExists as jest.Mock).mockResolvedValue(false);

        await expect(controller.getFile(['tickets', 'test.png'], {} as any)).rejects.toThrow(NotFoundException);

        expect(fs.pathExists).toHaveBeenCalledWith(expect.stringContaining('tickets/test.png'));
    });

    it('returns 404 instead of crashing when no path segment is provided', async () => {
        await expect(controller.getFile(undefined as any, {} as any)).rejects.toThrow(NotFoundException);
        expect(fs.pathExists).not.toHaveBeenCalled();
    });
});
