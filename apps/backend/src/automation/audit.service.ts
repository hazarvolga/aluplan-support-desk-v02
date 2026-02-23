import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AuditService {
    private readonly logger = new Logger(AuditService.name);

    constructor(private readonly prisma: PrismaService) { }

    async log(params: {
        actorId?: string;
        action: string;
        entityType: string;
        entityId: string;
        oldValue?: any;
        newValue?: any;
        ipAddress?: string;
        userAgent?: string;
    }) {
        try {
            await this.prisma.auditLog.create({
                data: {
                    actorId: params.actorId,
                    action: params.action,
                    entityType: params.entityType,
                    entityId: params.entityId,
                    oldValue: params.oldValue || {},
                    newValue: params.newValue || {},
                    ipAddress: params.ipAddress,
                    userAgent: params.userAgent,
                },
            });
        } catch (error) {
            this.logger.error(`Failed to create audit log: ${error.message}`);
        }
    }
}
