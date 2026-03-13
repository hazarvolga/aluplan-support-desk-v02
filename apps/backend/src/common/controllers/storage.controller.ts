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
    @Get(':folder/:filename')
    async getFile(
        @Param('folder') folder: string,
        @Param('filename') filename: string,
        @Res({ passthrough: true }) res: Response,
    ) {
        const filePath = path.join(process.cwd(), this.localPath, folder, filename);

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
}
