import { Controller, Get, Post, Body, Param, UseGuards, UseInterceptors, UploadedFile, ParseFilePipe, MaxFileSizeValidator, FileTypeValidator } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { KnowledgePoolService } from './knowledge-pool.service';
import { CreateKnowledgeSourceDto } from './dto/create-knowledge-source.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RbacGuard } from '../rbac/rbac.guard';
import { Roles } from '../rbac/decorators/rbac.decorators';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { KnowledgeSourceType } from '@aluplan/database';

@ApiTags('Knowledge Pool')
@Controller('knowledge-pool')
@UseGuards(JwtAuthGuard, RbacGuard)
export class KnowledgePoolController {
    constructor(private readonly knowledgePoolService: KnowledgePoolService) { }

    @Post('sources')
    @Roles('admin', 'super-admin')
    @ApiOperation({ summary: 'Add a new knowledge source (URL)' })
    async addSource(@Body() dto: CreateKnowledgeSourceDto) {
        return this.knowledgePoolService.createSource(dto);
    }

    @Post('sources/upload')
    @Roles('admin', 'super-admin')
    @UseInterceptors(
        FileInterceptor('file', {
            storage: diskStorage({
                destination: './uploads/knowledge-pool',
                filename: (req, file, callback) => {
                    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
                    const ext = extname(file.originalname);
                    callback(null, `${uniqueSuffix}${ext}`);
                },
            }),
        }),
    )
    @ApiOperation({ summary: 'Upload a knowledge file (PDF, TXT, CSV, MD)' })
    async uploadKnowledgeFile(
        @UploadedFile(
            new ParseFilePipe({
                validators: [
                    new MaxFileSizeValidator({ maxSize: 20 * 1024 * 1024 }), // 20MB
                    new FileTypeValidator({ fileType: /(pdf|plain|csv|markdown|octet-stream)$/ }),
                ],
            }),
        )
        file: Express.Multer.File,
        @Body('name') name: string,
    ) {
        const type = this.determineTypeFromExt(extname(file.originalname));
        return this.knowledgePoolService.createFileSource(name, type, file);
    }

    @Get('sources')
    @Roles('admin', 'super-admin', 'agent')
    @ApiOperation({ summary: 'List all knowledge sources' })
    async getSources() {
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

    private determineTypeFromExt(ext: string): KnowledgeSourceType {
        switch (ext.toLowerCase()) {
            case '.pdf': return KnowledgeSourceType.FILE_PDF;
            case '.csv': return KnowledgeSourceType.FILE_CSV;
            case '.txt': return KnowledgeSourceType.FILE_TXT;
            case '.md': return KnowledgeSourceType.FILE_MD;
            default: throw new Error(`Unsupported file extension: ${ext}`);
        }
    }
}
