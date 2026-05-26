import { Controller, Get, Post, Body, Param, Query, UseGuards, UseInterceptors, UploadedFile, ParseFilePipe, MaxFileSizeValidator, Logger, Delete } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { extname } from 'path';
import * as crypto from 'crypto';
import { KnowledgePoolService } from './knowledge-pool.service';
import { CreateKnowledgeSourceDto } from './dto/create-knowledge-source.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RbacGuard } from '../rbac/rbac.guard';
import { Roles } from '../rbac/decorators/rbac.decorators';
import { Public } from '../auth/decorators/public.decorator';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { KnowledgeSourceType } from '@aluplan/database';
import { StorageService } from '../common/services/storage.service';
import { PrismaService } from '../prisma/prisma.service';
import { LearnNowCrawlerService } from './learnnow-crawler.service';
import { DiscoverLearnNowDto } from './dto/learnnow-crawl.dto';
import { GenericWebCrawlerService } from './generic-web-crawler.service';
import { DiscoverGenericWebDto } from './dto/generic-crawl.dto';
import { AllplanHelpCrawlerService } from './allplan-help-crawler.service';
import { DiscoverAllplanHelpDto } from './dto/allplan-help-crawl.dto';

// Production Knowledge Base Stabilization Sync v1.0.3 - Final RAG Fixes (Multi-chunk + High-precision 1536 aligned)
@ApiTags('Knowledge Pool')
@Controller('knowledge-pool')
@UseGuards(JwtAuthGuard, RbacGuard)
export class KnowledgePoolController {
    private readonly logger = new Logger(KnowledgePoolController.name);

    constructor(
        private readonly knowledgePoolService: KnowledgePoolService,
        private readonly storageService: StorageService,
        private readonly prisma: PrismaService,
        private readonly learnNowCrawlerService: LearnNowCrawlerService,
        private readonly genericWebCrawlerService: GenericWebCrawlerService,
        private readonly allplanHelpCrawlerService: AllplanHelpCrawlerService,
    ) { }

    @Post('sources')
    @Roles('admin', 'super-admin', 'manager', 'support-manager')
    @ApiOperation({ summary: 'Add a new knowledge source (URL)' })
    async addSource(@Body() dto: CreateKnowledgeSourceDto): Promise<any> {
        return this.knowledgePoolService.createSource(dto);
    }

    @Post('sources/upload')
    @Roles('admin', 'super-admin', 'manager', 'support-manager')
    @UseInterceptors(
        FileInterceptor('file', {
            storage: memoryStorage(), // Use memory storage so we can stream to R2/S3
        }),
    )
    @ApiOperation({ summary: 'Upload a knowledge file (PDF, TXT, CSV, MD, DOCX)' })
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
            'application/msword',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            'application/x-pdf' // Added variant
        ];

        const isMimeValid = validMimes.some(mime => file.mimetype.toLowerCase().includes(mime.toLowerCase()));
        const ext = extname(file.originalname).toLowerCase();
        const validExts = ['.pdf', '.txt', '.csv', '.md', '.msg', '.doc', '.docx'];
        const isExtValid = validExts.includes(ext);

        if (!isMimeValid && !isExtValid) {
            logger.error(`Validation Failed: mimetype=${file.mimetype}, ext=${ext}`);
            throw new Error(`VALIDATION_FAILED: ${file.mimetype.toUpperCase()} (${ext.toUpperCase()}) is not supported.`);
        }

        const type = this.determineTypeFromExt(ext);

        // Fast pre-check: block re-uploads of the same filename before wasting storage bandwidth.
        // Covers both old records (broken hash) and new records (correct hash).
        // Users who want to replace a file should delete the existing one first.
        const existingByName = await this.prisma.knowledgeSource.findFirst({
            where: { fileName: file.originalname }
        });
        if (existingByName) {
            logger.warn(`Duplicate detected by filename: ${file.originalname} → already stored as "${existingByName.name}"`);
            return {
                skipped: true,
                reason: 'DUPLICATE_FILE',
                duplicateOf: existingByName.id,
                message: `"${existingByName.name}" adıyla aynı dosya zaten Knowledge Pool'da mevcut.`,
            };
        }

        // Upload to R2/S3 and get storage key
        const storageKey = await this.storageService.uploadFile(file, 'knowledge-pool');
        file = { ...file, path: storageKey } as Express.Multer.File;

        // Compute hash from the stored file — multer v2 with memoryStorage populates file.buffer
        // asynchronously, so by the time the async upload resolves the stored bytes are reliable.
        const storedBuffer = await this.storageService.getFile(storageKey);
        const hash = (storedBuffer && storedBuffer.length > 0)
            ? crypto.createHash('sha256').update(storedBuffer).digest('hex')
            : null;

        // Content-hash duplicate check (catches same file uploaded under a different name)
        if (hash) {
            const existingByHash = await this.prisma.knowledgeSource.findFirst({
                where: { lastHash: hash }
            });
            if (existingByHash) {
                // Clean up the orphaned storage object we just wrote
                await this.storageService.deleteFile(storageKey).catch(() => { /* best-effort */ });
                logger.warn(`Duplicate by content-hash: ${file.originalname} matches existing "${existingByHash.name}"`);
                return {
                    skipped: true,
                    reason: 'DUPLICATE_FILE',
                    duplicateOf: existingByHash.id,
                    message: `"${existingByHash.name}" adıyla aynı içerik zaten Knowledge Pool'da mevcut.`,
                };
            }
        }

        const source = await this.knowledgePoolService.createFileSource(name, type, file);

        // Persist the hash so future uploads can be checked against it
        if (hash) {
            await this.prisma.knowledgeSource.update({
                where: { id: source.id },
                data: { lastHash: hash }
            });
        }

        return source;
    }

    @Get('sources')
    @Roles('admin', 'super-admin', 'agent')
    @ApiOperation({ summary: 'List all knowledge sources' })
    async getSources(): Promise<any> {
        return this.knowledgePoolService.getAllSources();
    }

    @Post('crawl/learnnow/discover')
    @Roles('admin', 'super-admin', 'manager', 'support-manager')
    @ApiOperation({ summary: 'Discover public Allplan Learn Now crawler candidates' })
    async discoverLearnNow(@Body() dto: DiscoverLearnNowDto): Promise<any> {
        return this.learnNowCrawlerService.discover(dto);
    }

    @Post('crawl/discover')
    @Roles('admin', 'super-admin', 'manager', 'support-manager')
    @ApiOperation({ summary: 'Discover public same-domain web crawler candidates from a start URL' })
    async discoverGenericWeb(@Body() dto: DiscoverGenericWebDto): Promise<any> {
        return this.genericWebCrawlerService.discover(dto);
    }

    @Post('crawl/allplan-help/discover')
    @Roles('admin', 'super-admin', 'manager', 'support-manager')
    @ApiOperation({ summary: 'Discover public Allplan Help documentation candidates from toc.json' })
    async discoverAllplanHelp(@Body() dto: DiscoverAllplanHelpDto): Promise<any> {
        return this.allplanHelpCrawlerService.discover(dto);
    }

    @Get('crawl/candidates')
    @Roles('admin', 'super-admin', 'manager', 'support-manager')
    @ApiOperation({ summary: 'List crawler candidates awaiting review/import' })
    async listCrawlerCandidates(@Query('status') status?: any, @Query('source') source?: string): Promise<any> {
        return this.learnNowCrawlerService.listCandidates(status, source && source !== 'all' ? source : undefined);
    }

    @Post('crawl/candidates/:id/import')
    @Roles('admin', 'super-admin', 'manager', 'support-manager')
    @ApiOperation({ summary: 'Import an approved crawler candidate into the Knowledge Pool queue' })
    async importCrawlerCandidate(@Param('id') id: string): Promise<any> {
        return this.learnNowCrawlerService.importCandidate(id);
    }

    @Post('crawl/candidates/bulk-delete')
    @Roles('admin', 'super-admin', 'manager', 'support-manager')
    @ApiOperation({ summary: 'Delete multiple crawler candidates from the review queue' })
    async bulkDeleteCrawlerCandidates(@Body() body: { ids: string[] }) {
        return this.learnNowCrawlerService.bulkDeleteCandidates(body.ids);
    }

    @Delete('crawl/candidates/:id')
    @Roles('admin', 'super-admin', 'manager', 'support-manager')
    @ApiOperation({ summary: 'Delete a crawler candidate from the review queue' })
    async deleteCrawlerCandidate(@Param('id') id: string) {
        return this.learnNowCrawlerService.deleteCandidate(id);
    }

    @Post('sources/bulk-delete')
    @Roles('admin', 'super-admin', 'manager', 'support-manager')
    @ApiOperation({ summary: 'Delete multiple knowledge sources' })
    async bulkDeleteSources(@Body() body: { ids: string[] }) {
        return this.knowledgePoolService.bulkDeleteSources(body.ids);
    }

    @Delete('sources/:id')
    @Roles('admin', 'super-admin', 'manager', 'support-manager')
    @ApiOperation({ summary: 'Delete a knowledge source completely' })
    async deleteSource(@Param('id') id: string) {
        return this.knowledgePoolService.deleteSource(id);
    }

    @Post('sources/:id/sync')
    @Roles('admin', 'super-admin', 'manager', 'support-manager')
    @ApiOperation({ summary: 'Manually trigger a sync for a source' })
    async triggerSync(@Param('id') id: string) {
        this.logger.debug(`Received sync request for source ${id}`);
        await this.knowledgePoolService.triggerSync(id);
        return { success: true };
    }

    @Get('sources/:id/logs')
    @Roles('admin', 'super-admin', 'manager', 'support-manager', 'agent')
    @ApiOperation({ summary: 'Get sync history for a source' })
    async getLogs(@Param('id') id: string) {
        return this.knowledgePoolService.getSyncLogs(id);
    }

    @Post('sync-dataset')
    @Roles('admin', 'super-admin', 'manager', 'support-manager')
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
            case '.doc':
            case '.docx': return KnowledgeSourceType.FILE_DOCX;
            default: throw new Error(`Unsupported file extension: ${ext}`);
        }
    }
}
