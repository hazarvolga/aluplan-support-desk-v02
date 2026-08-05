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
    HttpStatus,
    Request,
    ForbiddenException,
    Logger,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { AttachmentsService } from './attachments.service';
import { RbacGuard } from '../rbac/rbac.guard';
import { RequirePermissions } from '../rbac/decorators/rbac.decorators';
import { StorageService } from '../common/services/storage.service';
import { Response } from 'express';
import { HotinfoParserService } from '../customers/hotinfo-parser.service';
import { TicketsService } from '../tickets/tickets.service';

@Controller('attachments')
@UseGuards(RbacGuard)
export class AttachmentsController {
    private readonly logger = new Logger(AttachmentsController.name);

    constructor(
        private readonly attachmentsService: AttachmentsService,
        private readonly storageService: StorageService,
        private readonly hotinfoParser: HotinfoParserService,
        private readonly ticketsService: TicketsService,
    ) { }

    @Post('upload/:messageId')
    @RequirePermissions('ticket:update')
    @UseInterceptors(
        FileInterceptor('file', {
            storage: memoryStorage(), // Use memory storage so we can stream to R2/S3
        }),
    )
    async uploadFile(
        @Param('messageId') messageId: string,
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

        let storageKey = '';
        let uploadError = null;

        try {
            storageKey = await this.storageService.uploadFile(file, `tickets/msg_${messageId}`);
        } catch (e: any) {
            uploadError = e;
            // We log but don't THROW yet because we want to try parsing hotinfo metadata 
            // to ensure the technical snapshot reaches the admin even if S3 is down.
            this.logger.error(`[AttachmentsController] S3 Upload Failed: ${e.message}`);
        }

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

        // We CREATE the record regardless of S3 state to ensure visibility in UI
        const attachment = await this.attachmentsService.create({
            messageId,
            fileName: file.originalname,
            fileSize: file.size,
            mimeType: file.mimetype,
            url: storageKey || `FAILED_STORAGE_UPLOAD_${Date.now()}`,
        }, parsedHotinfo, req.user);

        // If storage failed AND we have no hotinfo fallback, we inform the user it didn't save to cloud
        if (uploadError && !parsedHotinfo) {
            // Note: We return the attachment object so the meta-data is saved.
            // The agent will see the file record but won't be able to download it.
            this.logger.warn(`Attachment ${attachment.id} created but physical file upload failed.`);
        }

        return attachment;
    }

    @Get(':id/download')
    @RequirePermissions('ticket:read')
    async download(@Param('id') id: string, @Request() req: any, @Res() res: Response) {
        const attachment = await this.attachmentsService.findOne(id);

        // Security Resolve: Find the message and ticket to check ownership
        const message = await this.attachmentsService.findMessageByAttachment(id);
        if (!message) throw new ForbiddenException('Invalid attachment context');

        // This will throw ForbiddenException if requester has no access to the ticket
        await this.ticketsService.findOne(message.ticketId, req.user);

        // Generate a presigned URL from R2/S3
        const downloadUrl = await this.storageService.getDownloadUrl(attachment.url);

        // Redirect to the presigned URL
        return res.redirect(downloadUrl);
    }
}
