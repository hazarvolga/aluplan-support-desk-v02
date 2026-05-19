import {
    Controller,
    Get,
    Post,
    Param,
    Res,
    UseInterceptors,
    UploadedFile,
    UseGuards,
    ParseFilePipe,
    MaxFileSizeValidator,
    FileTypeValidator,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import * as path from 'path';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RbacGuard } from '../rbac/rbac.guard';
import { Roles } from '../rbac/decorators/rbac.decorators';
import { StorageService } from '../common/services/storage.service';
import { Response } from 'express';
import { Public } from '../auth/decorators/public.decorator';
import { ConfigService } from '@nestjs/config';
import { normalizeEmailLogoUrl } from '../common/utils/public-url.util';

@Controller('branding')
export class BrandingController {
    constructor(
        private readonly storageService: StorageService,
        private readonly configService: ConfigService,
    ) { }

    @Public()
    @Get('assets/*path')
    async getAsset(@Param('path') assetPath: string | string[], @Res() res: Response) {
        try {
            const key = Array.isArray(assetPath) ? assetPath.join('/') : assetPath;
            const buffer = await this.storageService.getFile(key);
            if (!buffer) return res.status(404).send('Asset not found');

            // Stream branding assets through our stable public endpoint so email
            // clients do not depend on provider-specific expiring redirects.
            const ext = path.extname(key).toLowerCase();
            const mimeTypes: Record<string, string> = {
                '.png': 'image/png',
                '.jpg': 'image/jpeg',
                '.jpeg': 'image/jpeg',
                '.gif': 'image/gif',
                '.svg': 'image/svg+xml',
                '.webp': 'image/webp'
            };
            res.setHeader('Content-Type', mimeTypes[ext] || 'application/octet-stream');
            res.setHeader('Cache-Control', 'public, max-age=3600');

            return res.send(buffer);
        } catch (_error) {
            return res.status(404).send('Asset not found');
        }
    }

    @Post('upload-logo')
    @UseGuards(JwtAuthGuard, RbacGuard)
    @Roles('ADMIN', 'SUPERUSER')
    @UseInterceptors(FileInterceptor('file')) // Uses MemoryStorage by default
    async uploadLogo(
        @UploadedFile(
            new ParseFilePipe({
                validators: [
                    new MaxFileSizeValidator({ maxSize: 5 * 1024 * 1024 }), // 5MB
                    new FileTypeValidator({ fileType: /image\/(jpeg|png|webp|svg\+xml)/ }),
                ],
            }),
        )
        file: Express.Multer.File,
    ) {
        // Upload to S3/R2 in specific taxonomy folder
        const key = await this.storageService.uploadFile(file, 'brand/logos');

        // Return the dynamic proxy endpoint instead of raw expiring S3 url
        const url = `/api/v1/branding/assets/${key}`;

        return {
            url,
            publicUrl: normalizeEmailLogoUrl(url, {
                apiBaseUrl: this.configService.get<string>('apiUrl') || process.env.API_URL || 'http://localhost:4000/api/v1',
                frontendUrl: process.env.FRONTEND_URL || 'http://localhost:3000',
                nodeEnv: process.env.NODE_ENV,
            }),
            filename: key,
        };
    }
}
