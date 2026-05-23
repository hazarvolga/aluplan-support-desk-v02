import { Controller, Get, Param, Res, StreamableFile, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Public } from '../../auth/decorators/public.decorator';
import * as fs from 'fs-extra';
import * as path from 'path';
import type { Response } from 'express';
import * as mime from 'mime-types';

@Controller('storage')
export class StorageController {
    private readonly localPath: string;

    constructor(private readonly configService: ConfigService) {
        this.localPath = this.configService.get('storage.localPath') || './uploads';
    }

    @Public()
    @Get('*path')
    async getFile(
        @Param('path') storagePath: string | string[],
        @Res({ passthrough: true }) res: Response,
    ) {
        const fullPath = this.normalizeStoragePath(storagePath);
        const basePath = path.resolve(path.join(process.cwd(), this.localPath));
        const filePath = path.resolve(path.join(process.cwd(), this.localPath, fullPath));

        if (!filePath.startsWith(basePath + path.sep) && filePath !== basePath) {
            throw new NotFoundException('File not found'); // Hide path traversal attempts as 404
        }

        if (!(await fs.pathExists(filePath))) {
            throw new NotFoundException('File not found');
        }

        const stats = await fs.stat(filePath);
        const contentType = mime.lookup(filePath) || 'application/octet-stream';

        res.set({
            'Content-Type': contentType,
            'Content-Length': stats.size,
        });

        const file = fs.createReadStream(filePath);
        return new StreamableFile(file);
    }

    private normalizeStoragePath(storagePath: string | string[] | undefined): string {
        const fullPath = Array.isArray(storagePath) ? storagePath.join('/') : storagePath;

        if (!fullPath || fullPath.includes('\0')) {
            throw new NotFoundException('File not found');
        }

        return fullPath;
    }
}
