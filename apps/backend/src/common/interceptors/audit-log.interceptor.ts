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

@Injectable()
export class AuditLogInterceptor implements NestInterceptor {
    private readonly logger = new Logger(AuditLogInterceptor.name);

    constructor(private readonly prisma: PrismaService) { }

    intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
        const request = context.switchToHttp().getRequest();
        const { method, url, user, ip, headers } = request;
        const userAgent = headers['user-agent'];

        // Only track mutating administrative actions (POST, PATCH, DELETE)
        // and only for authenticated users (admins/agents)
        const isMutating = ['POST', 'PATCH', 'DELETE'].includes(method);
        const isAdminAction = url.includes('/admin') || url.includes('/settings') || url.includes('/users');

        return next.handle().pipe(
            tap(async (data) => {
                if (isMutating && user && isAdminAction) {
                    try {
                        const action = this.mapUrlToAction(method, url);
                        const entityInfo = this.extractEntityInfo(url, request.body, data);

                        await this.prisma.auditLog.create({
                            data: {
                                actorId: user.id,
                                action,
                                entityType: entityInfo.type,
                                entityId: entityInfo.id,
                                newValue: request.body ? JSON.parse(JSON.stringify(request.body)) : null,
                                ipAddress: ip,
                                userAgent,
                            },
                        });
                    } catch (error) {
                        this.logger.error(`Failed to create audit log: ${error.message}`);
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

    private extractEntityInfo(url: string, body: any, response: any): { type: string | null, id: string | null } {
        const parts = url.split('/').filter(p => p && p !== 'api' && p !== 'v1');
        const type = parts[0] || null;

        // Try to find an ID in the URL or body or response
        let id = null;
        if (parts.length > 1 && parts[1].length > 20) { // Likely a UUID
            id = parts[1];
        } else if (response?.id) {
            id = response.id;
        } else if (body?.id) {
            id = body.id;
        }

        return { type, id };
    }
}
