import {
    Injectable,
    NestInterceptor,
    ExecutionContext,
    CallHandler,
    Logger,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { PrismaService } from '../../prisma/prisma.service';
import { MaintenanceWorkService } from '../services/maintenance-work.service';

@Injectable()
export class AuditLogInterceptor implements NestInterceptor {
    private readonly logger = new Logger(AuditLogInterceptor.name);

    constructor(
        private readonly prisma: PrismaService,
        private readonly work: MaintenanceWorkService,
    ) { }

    intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
        if (context.getType() !== 'http') return next.handle();
        const request = context.switchToHttp().getRequest();
        const { method, url, user, ip, headers } = request;
        const path = url.split('?')[0];
        const userAgent = headers['user-agent'];

        // Only track mutating administrative actions (POST, PATCH, DELETE)
        // and only for authenticated users (admins/agents)
        const isMutating = ['POST', 'PATCH', 'DELETE'].includes(method);
        const isAdminAction = path.includes('/admin') || path.includes('/settings') || path.includes('/users');

        return next.handle().pipe(
            tap((data) => {
                if (isMutating && user && isAdminAction) {
                    try {
                        const action = this.mapUrlToAction(method, path);
                        const entityInfo = this.extractEntityInfo(path, data);

                        // Metadata only: settings payloads can contain arbitrary secrets.
                        const audit = {
                            data: {
                                actorId: user.id,
                                action,
                                entityType: entityInfo.type,
                                entityId: entityInfo.id,
                                ipAddress: ip,
                                userAgent,
                            },
                        };
                        const operation = () => this.prisma.auditLog.create(audit);
                        const parent = this.work.currentLease();
                        const pending = parent
                            ? this.work.runChild(parent, 'http.audit', operation)
                            : this.work.runRoot('http.audit', operation);
                        // Preserve streaming/response timing while tracking actual persistence.
                        void pending.catch(() => this.logger.error('Failed to create audit log'));
                    } catch {
                        this.logger.error('Failed to create audit log');
                    }
                }
            }),
        );
    }

    private mapUrlToAction(method: string, url: string): string {
        const parts = url.split('/').filter(p => p && p !== 'api' && p !== 'v1');
        const entity = parts[0] || 'system';
        const actionMap: Record<string, string> = {
            'POST': 'create',
            'PATCH': 'update',
            'DELETE': 'delete'
        };
        return `${entity}.${actionMap[method] || method.toLowerCase()}`;
    }

    private extractEntityInfo(url: string, response: any): { type: string | null, id: string | null } {
        const parts = url.split('/').filter(p => p && p !== 'api' && p !== 'v1');
        const type = parts[0] || null;

        // Never derive metadata from the request body.
        let id = null;
        if (parts.length > 1 && parts[1].length > 20) { // Likely a UUID
            id = parts[1];
        } else if (response?.id) {
            id = response.id;
        }

        return { type, id };
    }
}
