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
    Request,
    Logger,
    ParseUUIDPipe,
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
    private readonly logger = new Logger(AttachmentsController.name);

    constructor(
        private readonly attachmentsService: AttachmentsService,
        private readonly storageService: StorageService,
        private readonly hotinfoParser: HotinfoParserService,
    ) { }

    @Post('upload/:messageId')
    @RequirePermissions('ticket:update')
    @UseInterceptors(
        FileInterceptor('file', {
            storage: memoryStorage(), // Use memory storage so we can stream to R2/S3
            // Busboy emits partsLimit at the ceiling; allow one terminating boundary.
            limits: { fileSize: 25 * 1024 * 1024, files: 1, fields: 0, parts: 2 },
        }),
    )
    async uploadFile(
        @Param('messageId', new ParseUUIDPipe()) messageId: string,
        @Request() req: any,
        @UploadedFile(
            new ParseFilePipe({
                validators: [
                    new MaxFileSizeValidator({ maxSize: 25 * 1024 * 1024 }), // 25MB
                    new FileTypeValidator({
                        // Allowed MIME types — security-reviewed list for a software support desk
                        // text/* is intentionally NOT used (too broad — allows text/javascript, text/html etc.)
                        // Blocked: exe, dll, bat, sh, js, py, apk, iso, dmg and all other executables
                        fileType: /^(image\/(png|jpeg|jpg|gif|webp|bmp|svg\+xml|tiff)|application\/pdf|text\/(plain|csv|markdown|x-log)|application\/(zip|x-zip-compressed|x-7z-compressed|x-rar-compressed)|application\/vnd\.rar|application\/octet-stream|application\/msword|application\/vnd\.openxmlformats-officedocument\.(wordprocessingml\.document|spreadsheetml\.sheet|presentationml\.presentation)|application\/vnd\.ms-(excel|powerpoint)|video\/(mp4|quicktime|x-msvideo|webm|x-ms-wmv))/,
                    }),
                ],
            }),
        )
        file: Express.Multer.File,
    ) {
        await this.attachmentsService.assertCanCreateForMessage(messageId, req.user);

        const storageKey = await this.storageService.uploadFile(file, `tickets/msg_${messageId}`);

        let parsedHotinfo = null;
        const lowName = file.originalname.toLowerCase();
        // Support both _hotinf_ (standard) and _hotinfo_ (alternative)
        if ((lowName.includes('_hotinf_') || lowName.includes('_hotinfo_')) && lowName.endsWith('.hxl')) {
            try {
                parsedHotinfo = this.hotinfoParser.parseHotinfo(file.buffer.toString('utf-8'));
            } catch (e) {
                this.logger.error(`[AttachmentsController] Hotinfo Parsing Failed: ${e.message}`);
            }
        }

        // Publish attachment metadata only after the configured storage accepted the bytes.
        const attachment = await this.attachmentsService.create({
            messageId,
            fileName: file.originalname,
            fileSize: file.size,
            mimeType: file.mimetype,
            url: storageKey,
        }, parsedHotinfo, req.user);

        return attachment;
    }

    @Get(':id/download')
    @RequirePermissions('ticket:read')
    async download(@Param('id', new ParseUUIDPipe()) id: string, @Request() req: any, @Res() res: Response) {
        const attachment = await this.attachmentsService.findAuthorizedForDownload(id, req.user);

        // Generate a presigned URL from R2/S3
        const downloadUrl = await this.storageService.getDownloadUrl(attachment.url);

        // Redirect to the presigned URL
        return res.redirect(downloadUrl);
    }
}
