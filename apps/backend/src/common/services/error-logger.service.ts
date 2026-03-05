import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class ErrorLoggerService {
    private readonly logger = new Logger(ErrorLoggerService.name);

    constructor(private prisma: PrismaService) { }

    async logError(params: {
        action: string;
        message: string;
        error?: any;
        actorId?: string;
        entityType?: string;
        entityId?: string;
        metadata?: any;
    }) {
        const { action, message, error, actorId, entityType, entityId, metadata } = params;

        // 1. Log to console for real-time visibility
        this.logger.error(`${action}: ${message}`, error?.stack);

        try {
            // 2. Persist to AuditLog table
            await this.prisma.auditLog.create({
                data: {
                    action: `error.${action}`,
                    actorId: actorId || null,
                    entityType: entityType || 'SYSTEM',
                    entityId: entityId || null,
                    newValue: {
                        message,
                        error: error?.message || String(error),
                        stack: error?.stack,
                        ...metadata
                    },
                    // IP and UA are optional in AuditLog, leaving null here as these are typically background errors
                }
            });
        } catch (saveError) {
            // If DB logging fails, we only have console
            this.logger.error('Failed to persist error log to database', saveError.stack);
        }
    }
}
