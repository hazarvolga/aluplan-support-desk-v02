import {
    Controller,
    Post,
    UseInterceptors,
    UploadedFile,
    UseGuards,
    ParseFilePipe,
    MaxFileSizeValidator,
    FileTypeValidator,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname, join } from 'path';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RbacGuard } from '../rbac/rbac.guard';
import { Roles } from '../rbac/decorators/rbac.decorators';

@Controller('branding')
@UseGuards(JwtAuthGuard, RbacGuard)
export class BrandingController {
    @Post('upload-logo')
    @Roles('ADMIN', 'SUPERUSER')
    @UseInterceptors(
        FileInterceptor('file', {
            storage: diskStorage({
                destination: (req, file, callback) => {
                    // Save directly to frontend public directory for local dev accessibility
                    const dest = join(process.cwd(), 'apps/frontend/public/logos');
                    callback(null, dest);
                },
                filename: (req, file, callback) => {
                    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
                    const ext = extname(file.originalname);
                    callback(null, `logo-${uniqueSuffix}${ext}`);
                },
            }),
        }),
    )
    async uploadLogo(
        @UploadedFile(
            new ParseFilePipe({
                validators: [
                    new MaxFileSizeValidator({ maxSize: 2 * 1024 * 1024 }), // 2MB
                    new FileTypeValidator({ fileType: /(jpg|jpeg|png|svg)$/ }),
                ],
            }),
        )
        file: Express.Multer.File,
    ) {
        // Return the relative path that the frontend can use
        return {
            url: `/logos/${file.filename}`,
            filename: file.filename,
        };
    }
}
