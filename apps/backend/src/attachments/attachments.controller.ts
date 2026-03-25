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
import { HotinfoParserService } from '../customers/hotinfo-parser.service';

@Controller('attachments')
@UseGuards(RbacGuard)
export class AttachmentsController {
    constructor(
        private readonly attachmentsService: AttachmentsService,
        private readonly storageService: StorageService,
        private readonly hotinfoParser: HotinfoParserService,
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
                ],
            }),
        )
        file: Express.Multer.File,
    ) {
        let storageKey = '';
        let uploadError = null;

        try {
            storageKey = await this.storageService.uploadFile(file, `tickets/msg_${messageId}`);
        } catch (e: any) {
            uploadError = e;
            // We log but don't THROW yet because we want to try parsing hotinfo metadata 
            // to ensure the technical snapshot reaches the admin even if S3 is down.
            console.error(`[AttachmentsController] S3 Upload Failed: ${e.message}`);
        }

        let parsedHotinfo = null;
        const lowName = file.originalname.toLowerCase();
        // Support both _hotinf_ (standard) and _hotinfo_ (alternative)
        if ((lowName.includes('_hotinf_') || lowName.includes('_hotinfo_')) && lowName.endsWith('.hxl')) {
            try {
                parsedHotinfo = this.hotinfoParser.parseHotinfo(file.buffer.toString('utf-8'));
            } catch (e) {
                console.error(`[AttachmentsController] Hotinfo Parsing Failed: ${e.message}`);
            }
        }

        // If storage failed BUT we have no hotinfo, we MUST throw now
        if (uploadError && !parsedHotinfo) {
            throw uploadError;
        }

        const attachment = await this.attachmentsService.create({
            messageId,
            fileName: file.originalname,
            fileSize: file.size,
            mimeType: file.mimetype,
            url: storageKey || `FAILED_UPLOAD_${Date.now()}`, // Fallback key if storage failed but we want to save metadata
        }, parsedHotinfo);

        // If storage failed but we saved hotinfo, we return a partial success indicator or the attachment
        return attachment;
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
