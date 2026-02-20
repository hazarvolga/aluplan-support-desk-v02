import {
    Controller,
    Post,
    UseInterceptors,
    UploadedFile,
    Param,
    Body,
    UseGuards,
    Request,
    ParseFilePipe,
    MaxFileSizeValidator,
    FileTypeValidator,
    Get,
    Res,
    NotFoundException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { AttachmentsService } from './attachments.service';
import { RbacGuard } from '../rbac/rbac.guard';
import { RequirePermissions } from '../rbac/decorators/rbac.decorators';
import { Response } from 'express';
import { join } from 'path';
import { existsSync } from 'fs';

@Controller('attachments')
@UseGuards(RbacGuard)
export class AttachmentsController {
    constructor(private readonly attachmentsService: AttachmentsService) { }

    @Post('upload/:messageId')
    @RequirePermissions('ticket:update')
    @UseInterceptors(
        FileInterceptor('file', {
            storage: diskStorage({
                destination: './uploads/attachments',
                filename: (req, file, callback) => {
                    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
                    const ext = extname(file.originalname);
                    callback(null, `${uniqueSuffix}${ext}`);
                },
            }),
        }),
    )
    async uploadFile(
        @Param('messageId') messageId: string,
        @UploadedFile(
            new ParseFilePipe({
                validators: [
                    new MaxFileSizeValidator({ maxSize: 10 * 1024 * 1024 }), // 10MB
                    new FileTypeValidator({ fileType: /(jpg|jpeg|png|pdf|doc|docx|zip)$/ }),
                ],
            }),
        )
        file: Express.Multer.File,
    ) {
        return this.attachmentsService.create({
            messageId,
            fileName: file.originalname,
            fileSize: file.size,
            mimeType: file.mimetype,
            url: file.path, // or filename if we want relative
        });
    }

    @Get(':id/download')
    @RequirePermissions('ticket:read')
    async download(@Param('id') id: string, @Res() res: Response) {
        const attachment = await this.attachmentsService.findOne(id);
        const filePath = join(process.cwd(), attachment.url);

        if (!existsSync(filePath)) {
            throw new NotFoundException('File not found on disk');
        }

        return res.download(filePath, attachment.fileName);
    }
}
