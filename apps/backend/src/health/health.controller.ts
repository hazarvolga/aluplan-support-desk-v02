import { Controller, Get, Post, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { Public } from '../auth/decorators/public.decorator';
import { DatabaseBackupService } from '../common/services/database-backup.service';
import { RbacGuard } from '../rbac/rbac.guard';
import { Roles } from '../rbac/decorators/rbac.decorators';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { HealthCheckService, HttpHealthIndicator, MemoryHealthIndicator, DiskHealthIndicator } from '@nestjs/terminus';
import { PrismaService } from '../prisma/prisma.service';
import { RedisService } from '../redis/redis.service';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';

@ApiTags('Health')
@Controller('health')
export class HealthController {
    constructor(
        private readonly backup: DatabaseBackupService,
        private readonly health: HealthCheckService,
        private readonly http: HttpHealthIndicator,
        private readonly memory: MemoryHealthIndicator,
        private readonly disk: DiskHealthIndicator,
        private readonly prisma: PrismaService,
        private readonly redisService: RedisService,
        @InjectQueue('ai-query-processing') private readonly testQueue: Queue,
    ) { }

    @Public()
    @Get()
    @ApiOperation({ summary: 'Health check' })
    check() {
        return this.health.check([
            () => this.memory.checkHeap('memory_heap', 150 * 1024 * 1024),
            () => this.memory.checkRSS('memory_rss', 150 * 1024 * 1024),
            () => this.disk.checkStorage('storage', { path: '/', thresholdPercent: 0.9 }),
            async () => {
                try {
                    await this.prisma.$queryRaw`SELECT 1`;
                    return { database: { status: 'up' } };
                } catch (e: any) {
                    return { database: { status: 'down', message: e.message } };
                }
            },
            async () => {
                try {
                    const client = this.redisService.getClient();
                    await client.ping();
                    return { redis: { status: 'up' } };
                } catch (e: any) {
                    return { redis: { status: 'down', message: e.message } };
                }
            },
            async () => {
                // Ensure queue client accepts jobs
                try {
                    const client = await this.testQueue.client;
                    await client.ping();
                    return { bullmq: { status: 'up' } };
                } catch (e: any) {
                    return { bullmq: { status: 'down', message: e.message } };
                }
            }
        ]);
    }

    @Post('backup')
    @UseGuards(JwtAuthGuard, RbacGuard)
    @Roles('ADMIN')
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Trigger manual database backup (Admin only)' })
    async triggerManualBackup() {
        return this.backup.runBackup();
    }
}
