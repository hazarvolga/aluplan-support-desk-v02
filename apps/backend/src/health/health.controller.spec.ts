import { Test, TestingModule } from "@nestjs/testing";
import { HealthController } from "./health.controller";
import {
  HealthCheckService,
  HttpHealthIndicator,
  MemoryHealthIndicator,
  DiskHealthIndicator,
} from "@nestjs/terminus";
import { PrismaService } from "../prisma/prisma.service";
import { RedisService } from "../redis/redis.service";
import { DatabaseBackupService } from "../common/services/database-backup.service";
import { getQueueToken } from "@nestjs/bullmq";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";
import { readFile } from "node:fs/promises";
import path from "node:path";

describe("HealthController", () => {
  let controller: HealthController;
  let prismaService: { $queryRaw: jest.Mock };
  let redisService: { getClient: jest.Mock };
  let queue: { client: any };
  let healthCheck: { check: jest.Mock };
  let backupService: { runBackup: jest.Mock };
  let module: TestingModule;

  beforeEach(async () => {
    prismaService = {
      $queryRaw: jest.fn().mockResolvedValue([{ "?column?": 1 }]),
    };
    const redisClient = { ping: jest.fn().mockResolvedValue("PONG") };
    redisService = { getClient: jest.fn().mockReturnValue(redisClient) };
    const queueClient = { ping: jest.fn().mockResolvedValue("PONG") };
    queue = { client: Promise.resolve(queueClient) };
    backupService = {
      runBackup: jest.fn().mockResolvedValue({ ok: true }),
    };

    // The HealthCheckService normally runs each indicator. We capture the
    // indicators array and assert on their behaviour individually.
    healthCheck = {
      check: jest.fn(async (indicators: any[]) => {
        const results = await Promise.all(indicators.map((i: any) => i()));
        return { status: "ok", info: Object.assign({}, ...results) };
      }),
    };

    module = await Test.createTestingModule({
      controllers: [HealthController],
      providers: [
        { provide: HealthCheckService, useValue: healthCheck },
        { provide: HttpHealthIndicator, useValue: {} },
        {
          provide: MemoryHealthIndicator,
          useValue: {
            checkHeap: jest.fn().mockResolvedValue({
              memory_heap: { status: "up" },
            }),
            checkRSS: jest.fn().mockResolvedValue({
              memory_rss: { status: "up" },
            }),
          },
        },
        {
          provide: DiskHealthIndicator,
          useValue: {
            checkStorage: jest
              .fn()
              .mockResolvedValue({ storage: { status: "up" } }),
          },
        },
        { provide: PrismaService, useValue: prismaService },
        { provide: RedisService, useValue: redisService },
        { provide: DatabaseBackupService, useValue: backupService },
        {
          provide: getQueueToken("ai-query-processing"),
          useValue: queue,
        },
      ],
    }).compile();

    controller = module.get<HealthController>(HealthController);
  });

  it("returns ok when all indicators are up", async () => {
    const result = await controller.check();
    expect(result.status).toBe("ok");
    expect(result.info).toMatchObject({
      memory_heap: { status: "up" },
      database: { status: "up" },
      redis: { status: "up" },
      bullmq: { status: "up" },
    });
  });

  it("reports database as down without exposing the driver error", async () => {
    prismaService.$queryRaw.mockRejectedValueOnce(
      new Error("connection refused"),
    );
    const result = await controller.check();
    expect(result.info.database).toEqual({ status: "down" });
  });

  it("reports redis as down without exposing the driver error", async () => {
    redisService.getClient.mockReturnValueOnce({
      ping: jest.fn().mockRejectedValue(new Error("redis timeout")),
    });
    const result = await controller.check();
    expect(result.info.redis).toEqual({ status: "down" });
  });

  it("reports bullmq as down without exposing the driver error", async () => {
    queue.client = Promise.resolve({
      ping: jest.fn().mockRejectedValue(new Error("queue offline")),
    });
    const result = await controller.check();
    expect(result.info.bullmq).toEqual({ status: "down" });
  });

  it("propagates the operator-only backup quarantine response", async () => {
    const quarantine = new Error("backup disabled");
    backupService.runBackup.mockRejectedValueOnce(quarantine);

    await expect(controller.triggerManualBackup()).rejects.toBe(quarantine);
  });

  it("publishes the disabled backup endpoint as a 503 OpenAPI contract", async () => {
    const openapi = JSON.parse(
      await readFile(path.resolve(process.cwd(), "openapi.json"), "utf8"),
    );
    const operation = openapi.paths["/api/v1/health/backup"].post;
    const app = module.createNestApplication();
    app.setGlobalPrefix("api/v1");
    const runtimeDocument = SwaggerModule.createDocument(
      app,
      new DocumentBuilder().addBearerAuth().build(),
    );
    const runtimeOperation =
      runtimeDocument.paths["/api/v1/health/backup"]?.post;

    expect(operation.summary).toBe(
      "In-process backup is disabled; use the operator runbook",
    );
    expect(operation.responses["503"]).toMatchObject({
      description:
        "Application-managed database backup is disabled. The approved operator workflow is required.",
      content: {
        "application/json": {
          schema: {
            example: {
              statusCode: 503,
              code: "DATABASE_BACKUP_DISABLED",
            },
          },
        },
      },
    });
    expect(operation.responses["201"]).toBeUndefined();
    expect(operation.responses["503"]).toEqual(
      runtimeOperation?.responses["503"],
    );
    await app.close();
  });
});
