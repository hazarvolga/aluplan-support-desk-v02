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
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RbacGuard } from '../rbac/rbac.guard';
import { Roles } from '../rbac/decorators/rbac.decorators';
import { StorageService } from '../common/services/storage.service';
import { Response } from 'express';
import { Public } from '../auth/decorators/public.decorator';

@Controller('branding')
export class BrandingController {
    constructor(private readonly storageService: StorageService) { }

    @Public()
    @Get('assets/*')
    async getAsset(@Param('0') key: string, @Res() res: Response) {
        // Creates a fresh presigned URL valid for 1 hour and redirects the user securely
        try {
            const url = await this.storageService.getDownloadUrl(key);
            return res.redirect(url);
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
        // Upload to S3/MinIO in specific taxonomy folder
        const key = await this.storageService.uploadFile(file, 'brand/logos');

        // Return the dynamic proxy endpoint instead of raw expiring S3 url
        return {
            url: `/api/v1/branding/assets/${key}`,
            filename: key,
        };
    }
}
