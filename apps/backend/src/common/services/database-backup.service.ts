import { Injectable, ServiceUnavailableException } from "@nestjs/common";

export const DATABASE_BACKUP_DISABLED_RESPONSE = Object.freeze({
  statusCode: 503,
  code: "DATABASE_BACKUP_DISABLED",
  message:
    "In-process database backup is disabled; use the approved operator backup workflow.",
});

@Injectable()
export class DatabaseBackupService {
  async runBackup(): Promise<never> {
    throw new ServiceUnavailableException(DATABASE_BACKUP_DISABLED_RESPONSE);
  }
}
