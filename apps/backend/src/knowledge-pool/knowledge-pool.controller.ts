import { Controller, Get, Post, Body, Param, UseGuards, UseInterceptors, UploadedFile, ParseFilePipe, MaxFileSizeValidator, Logger } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { extname } from 'path';
import { KnowledgePoolService } from './knowledge-pool.service';
import { CreateKnowledgeSourceDto } from './dto/create-knowledge-source.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RbacGuard } from '../rbac/rbac.guard';
import { Roles } from '../rbac/decorators/rbac.decorators';
import { Public } from '../auth/decorators/public.decorator';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { KnowledgeSourceType } from '@aluplan/database';
import { StorageService } from '../common/services/storage.service';

// Production Knowledge Base Stabilization Sync v1.0.3 - Final RAG Fixes (Multi-chunk + High-precision 1536 aligned)
@ApiTags('Knowledge Pool')
@Controller('knowledge-pool')
@UseGuards(JwtAuthGuard, RbacGuard)
export class KnowledgePoolController {
    constructor(
        private readonly knowledgePoolService: KnowledgePoolService,
        private readonly storageService: StorageService,
    ) { }

    @Post('sources')
    @Roles('admin', 'super-admin')
    @ApiOperation({ summary: 'Add a new knowledge source (URL)' })
    async addSource(@Body() dto: CreateKnowledgeSourceDto): Promise<any> {
        return this.knowledgePoolService.createSource(dto);
    }

    @Post('sources/upload')
    @Roles('admin', 'super-admin')
    @UseInterceptors(
        FileInterceptor('file', {
            storage: memoryStorage(), // Use memory storage so we can stream to R2/S3
        }),
    )
    @ApiOperation({ summary: 'Upload a knowledge file (PDF, TXT, CSV, MD)' })
    async uploadKnowledgeFile(
        @UploadedFile(
            new ParseFilePipe({
                validators: [
                    new MaxFileSizeValidator({ maxSize: 50 * 1024 * 1024 }), // 50MB
                ],
            }),
        )
        file: Express.Multer.File,
        @Body('name') name: string,
    ): Promise<any> {
        const logger = new Logger('KnowledgePoolController');
        logger.debug(`File Upload Request: name=${name}, originalname=${file.originalname}, mimetype=${file.mimetype}`);

        const validMimes = [
            'application/pdf',
            'text/plain',
            'text/csv',
            'text/markdown',
            'application/octet-stream',
            'application/x-pdf' // Added variant
        ];

        const isMimeValid = validMimes.some(mime => file.mimetype.toLowerCase().includes(mime.toLowerCase()));
        const ext = extname(file.originalname).toLowerCase();
        const validExts = ['.pdf', '.txt', '.csv', '.md', '.msg'];
        const isExtValid = validExts.includes(ext);

        if (!isMimeValid && !isExtValid) {
            logger.error(`Validation Failed: mimetype=${file.mimetype}, ext=${ext}`);
            throw new Error(`VALIDATION_FAILED: ${file.mimetype.toUpperCase()} (${ext.toUpperCase()}) is not supported.`);
        }

        const type = this.determineTypeFromExt(ext);

        // Upload to R2/S3 and get storage key
        const storageKey = await this.storageService.uploadFile(file, 'knowledge-pool');
        file = { ...file, path: storageKey } as Express.Multer.File;

        return this.knowledgePoolService.createFileSource(name, type, file);
    }

    @Get('sources')
    @Roles('admin', 'super-admin', 'agent')
    @ApiOperation({ summary: 'List all knowledge sources' })
    async getSources(): Promise<any> {
        return this.knowledgePoolService.getAllSources();
    }

    @Post('sources/:id/sync')
    @Roles('admin', 'super-admin')
    @ApiOperation({ summary: 'Manually trigger a sync for a source' })
    async triggerSync(@Param('id') id: string) {
        await this.knowledgePoolService.triggerSync(id);
        return { success: true };
    }

    @Get('sources/:id/logs')
    @Roles('admin', 'super-admin')
    @ApiOperation({ summary: 'Get sync history for a source' })
    async getLogs(@Param('id') id: string) {
        return this.knowledgePoolService.getSyncLogs(id);
    }

    @Post('sync-dataset')
    @Roles('admin', 'super-admin')
    @ApiOperation({ summary: 'Manually trigger a sync of the local /dataset folder' })
    async triggerDatasetSync() {
        return this.knowledgePoolService.syncLocalDataset();
    }

    @Post('sync-external')
    @Roles('admin', 'super-admin')
    @ApiOperation({ summary: 'Sync documents from an external source (e.g. NotebookLM MCP script)' })
    async syncExternal(@Body('docs') docs: { title: string; content: string; originalId: string; url?: string }[]) {
        if (!docs || !Array.isArray(docs)) {
            throw new Error('docs payload must be an array');
        }
        return this.knowledgePoolService.syncExternalDocs(docs);
    }

    private determineTypeFromExt(ext: string): KnowledgeSourceType {
        switch (ext.toLowerCase()) {
            case '.pdf': return KnowledgeSourceType.FILE_PDF;
            case '.csv': return KnowledgeSourceType.FILE_CSV;
            case '.txt': return KnowledgeSourceType.FILE_TXT;
            case '.md': return KnowledgeSourceType.FILE_MD;
            case '.msg': return KnowledgeSourceType.FILE_MSG;
            default: throw new Error(`Unsupported file extension: ${ext}`);
        }
    }
}

