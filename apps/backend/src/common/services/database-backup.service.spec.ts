import { ServiceUnavailableException } from "@nestjs/common";
import { readFile } from "node:fs/promises";

import {
  DATABASE_BACKUP_DISABLED_RESPONSE,
  DatabaseBackupService,
} from "./database-backup.service";

describe("DatabaseBackupService", () => {
  it("quarantines the legacy in-process backup path", async () => {
    const service = new DatabaseBackupService();

    await expect(service.runBackup()).rejects.toMatchObject({
      status: 503,
      response: DATABASE_BACKUP_DISABLED_RESPONSE,
    });
    await expect(service.runBackup()).rejects.toBeInstanceOf(
      ServiceUnavailableException,
    );
    expect(Reflect.get(service, "handleCron")).toBeUndefined();
  });

  it("does not retain shell, cron, database URL, or storage fallback code", async () => {
    const source = await readFile(
      __filename.replace(/\.spec\.ts$/, ".ts"),
      "utf8",
    );

    expect(source).not.toMatch(
      /@Cron|child_process|execAsync|DATABASE_URL|pg_dump|fs-extra/,
    );
    expect(source).not.toMatch(/StorageService|uploadFile|\.sql/);
    expect(source).toMatch(/ServiceUnavailableException/);
    expect(source).toMatch(/DATABASE_BACKUP_DISABLED/);
  });
});
