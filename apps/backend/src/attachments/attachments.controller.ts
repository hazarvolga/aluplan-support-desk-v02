import {
    Controller,
    Post,
    UseInterceptors,
    UploadedFile,
    Param,
    UseGuards,
    Get,
    Res,
    ParseFilePipe,
    MaxFileSizeValidator,
    FileTypeValidator,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { AttachmentsService } from './attachments.service';
import { RbacGuard } from '../rbac/rbac.guard';
import { RequirePermissions } from '../rbac/decorators/rbac.decorators';
import { StorageService } from '../common/services/storage.service';
import { Response } from 'express';

@Controller('attachments')
@UseGuards(RbacGuard)
export class AttachmentsController {
    constructor(
        private readonly attachmentsService: AttachmentsService,
        private readonly storageService: StorageService,
    ) { }

    @Post('upload/:messageId')
    @RequirePermissions('ticket:update')
    @UseInterceptors(
        FileInterceptor('file', {
            storage: memoryStorage(), // Use memory storage so we can stream to MinIO
        }),
    )
    async uploadFile(
        @Param('messageId') messageId: string,
        @UploadedFile(
            new ParseFilePipe({
                validators: [
                    new MaxFileSizeValidator({ maxSize: 10 * 1024 * 1024 }), // 10MB
                    // Standard types allowed: Images, PDFs/Docs/Zips, and Text/CSV
                    new FileTypeValidator({ fileType: 'image/.*|application/.*|text/.*' }),
                ],
            }),
        )
        file: Express.Multer.File,
    ) {
        // Enforce classification: tickets/msg_{id}
        const storageKey = await this.storageService.uploadFile(file, `tickets/msg_${messageId}`);

        return this.attachmentsService.create({
            messageId,
            fileName: file.originalname,
            fileSize: file.size,
            mimeType: file.mimetype,
            url: storageKey, // Store the object key, not a local path
        });
    }

    @Get(':id/download')
    @RequirePermissions('ticket:read')
    async download(@Param('id') id: string, @Res() res: Response) {
        const attachment = await this.attachmentsService.findOne(id);

        // Generate a presigned URL from MinIO/S3
        const downloadUrl = await this.storageService.getDownloadUrl(attachment.url);

        // Redirect to the presigned URL
        return res.redirect(downloadUrl);
    }
}
