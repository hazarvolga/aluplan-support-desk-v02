import {
    ExceptionFilter,
    Catch,
    ArgumentsHost,
    HttpException,
    HttpStatus,
    Logger,
} from '@nestjs/common';
import { HttpAdapterHost } from '@nestjs/core';
import { ErrorLoggerService } from '../services/error-logger.service';

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
    private readonly logger = new Logger(GlobalExceptionFilter.name);

    constructor(
        private readonly httpAdapterHost: HttpAdapterHost,
        private readonly errorLogger: ErrorLoggerService,
    ) { }

    async catch(exception: unknown, host: ArgumentsHost): Promise<void> {
        const { httpAdapter } = this.httpAdapterHost;
        const ctx = host.switchToHttp();
        const request = ctx.getRequest();
        const response = ctx.getResponse();

        const httpStatus =
            exception instanceof HttpException
                ? exception.getStatus()
                : HttpStatus.INTERNAL_SERVER_ERROR;

        const message =
            exception instanceof HttpException
                ? exception.getResponse()
                : (exception as Error).message || 'Internal server error';

        const responseBody = {
            statusCode: httpStatus,
            timestamp: new Date().toISOString(),
            path: httpAdapter.getRequestUrl(request),
            message: typeof message === 'object' ? (message as any).message : message,
            error: typeof message === 'object' ? (message as any).error : null,
        };

        // Log the error using the centralized service (persists to AuditLog)
        await this.errorLogger.logError({
            action: 'api_exception',
            message: responseBody.message,
            error: exception,
            actorId: request.user?.id,
            entityType: 'API',
            metadata: {
                path: responseBody.path,
                method: request.method,
                statusCode: httpStatus
            }
        });

        httpAdapter.reply(response, responseBody, httpStatus);
    }
}
