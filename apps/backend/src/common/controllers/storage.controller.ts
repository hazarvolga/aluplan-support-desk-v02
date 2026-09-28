import { Controller, Get, Param, Res, Req, StreamableFile, NotFoundException, ForbiddenException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Public } from '../../auth/decorators/public.decorator';
import type { Response } from 'express';
import * as mime from 'mime-types';
import { PrismaService } from '../../prisma/prisma.service';
import { TicketAccessService } from '../services/ticket-access.service';
import { normalizeStorageKey, openLocalStorageFile, publicLogoKey } from '../utils/storage-path.util';

type StorageRequester = { user?: { id?: string; sub?: string; role?: string | { name?: string | null } | null } };

@Controller('storage')
export class StorageController {
    private readonly localPath: string;

    constructor(
        private readonly configService: ConfigService,
        private readonly prisma: PrismaService,
        private readonly ticketAccess: TicketAccessService,
    ) {
        this.localPath = this.configService.get('storage.localPath') || './uploads';
    }

    @Public()
    @Get('brand/logos/:fileName')
    async getLogo(@Param('fileName') fileName: string, @Res({ passthrough: true }) res: Response) {
        return this.streamFile(publicLogoKey(`brand/logos/${fileName}`), res, false);
    }

    @Get('*path')
    async getFile(
        @Param('path') storagePath: string | string[],
        @Res({ passthrough: true }) res: Response,
        @Req() req: StorageRequester,
    ) {
        const key = normalizeStorageKey(storagePath);
        if (!key.startsWith('tickets/')) throw new NotFoundException('File not found');
        if (!(req?.user?.id ?? req?.user?.sub)) throw new ForbiddenException('Access denied');
        const attachments = await this.prisma.attachment.findMany({
            where: { url: key },
            select: { message: { select: { ticketId: true, isInternal: true } } },
        });
        if (!attachments.length) throw new NotFoundException('File not found');
        const rawRole = typeof req.user.role === 'string' ? req.user.role : req.user.role?.name;
        const role = rawRole?.trim().toUpperCase().replace(/-/g, '_');
        for (const { message } of attachments) {
            if (!message || !await this.ticketAccess.canAccessTicket(req.user, message.ticketId)
                || (message.isInternal && (role === 'CUSTOMER' || role === 'VIEWER'))) {
                throw new ForbiddenException('Access denied');
            }
        }
        return this.streamFile(key, res, true);
    }

    private async streamFile(key: string, res: Response, privateFile: boolean) {
        const { file, stats } = await openLocalStorageFile(this.localPath, key);
        res.set({
            'Content-Type': mime.lookup(key) || 'application/octet-stream',
            'Content-Length': stats.size,
            'X-Content-Type-Options': 'nosniff',
            'Content-Security-Policy': "default-src 'none'; sandbox",
            'Cache-Control': privateFile ? 'private, no-store' : 'public, max-age=3600',
            ...(privateFile ? { 'Content-Disposition': 'attachment' } : {}),
        });
        return new StreamableFile(file.createReadStream());
    }
}
