import {
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  UseGuards,
} from "@nestjs/common";
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiResponse,
} from "@nestjs/swagger";
import { Public } from "../auth/decorators/public.decorator";
import {
  DATABASE_BACKUP_DISABLED_RESPONSE,
  DatabaseBackupService,
} from "../common/services/database-backup.service";
import { RbacGuard } from "../rbac/rbac.guard";
import { Roles } from "../rbac/decorators/rbac.decorators";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import {
  HealthCheckService,
  HttpHealthIndicator,
  MemoryHealthIndicator,
  DiskHealthIndicator,
} from "@nestjs/terminus";
import { PrismaService } from "../prisma/prisma.service";
import { RedisService } from "../redis/redis.service";
import { InjectQueue } from "@nestjs/bullmq";
import { Queue } from "bullmq";

@ApiTags("Health")
@Controller("health")
export class HealthController {
  constructor(
    private readonly backup: DatabaseBackupService,
    private readonly health: HealthCheckService,
    private readonly http: HttpHealthIndicator,
    private readonly memory: MemoryHealthIndicator,
    private readonly disk: DiskHealthIndicator,
    private readonly prisma: PrismaService,
    private readonly redisService: RedisService,
    @InjectQueue("ai-query-processing") private readonly testQueue: Queue,
  ) {}

  @Public()
  @Get()
  @ApiOperation({ summary: "Health check" })
  check() {
    return this.health.check([
      // GAP-13: Realistic memory thresholds for NestJS + Prisma + RAG pipeline
      () => this.memory.checkHeap("memory_heap", 512 * 1024 * 1024), // 512MB
      () => this.memory.checkRSS("memory_rss", 1024 * 1024 * 1024), // 1GB
      () =>
        this.disk.checkStorage("storage", {
          path: "/",
          thresholdPercent: 0.9,
        }),
      async () => {
        try {
          await this.prisma.$queryRaw`SELECT 1`;
          return { database: { status: "up" } };
        } catch {
          return { database: { status: "down" } };
        }
      },
      async () => {
        try {
          const client = this.redisService.getClient();
          await client.ping();
          return { redis: { status: "up" } };
        } catch {
          return { redis: { status: "down" } };
        }
      },
      async () => {
        // Ensure queue client accepts jobs
        try {
          const client = await this.testQueue.client;
          await client.ping();
          return { bullmq: { status: "up" } };
        } catch {
          return { bullmq: { status: "down" } };
        }
      },
    ]);
  }

  @Post("backup")
  @HttpCode(HttpStatus.SERVICE_UNAVAILABLE)
  @UseGuards(JwtAuthGuard, RbacGuard)
  @Roles("ADMIN")
  @ApiBearerAuth()
  @ApiOperation({
    summary: "In-process backup is disabled; use the operator runbook",
  })
  @ApiResponse({
    status: 503,
    description:
      "Application-managed database backup is disabled. The approved operator workflow is required.",
    content: {
      "application/json": {
        schema: {
          type: "object",
          required: ["statusCode", "code", "message"],
          properties: {
            statusCode: { type: "integer", example: 503 },
            code: { type: "string", example: "DATABASE_BACKUP_DISABLED" },
            message: { type: "string" },
          },
          example: DATABASE_BACKUP_DISABLED_RESPONSE,
        },
      },
    },
  })
  async triggerManualBackup() {
    return this.backup.runBackup();
  }
}
