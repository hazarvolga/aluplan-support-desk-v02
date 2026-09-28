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
import { MaintenanceWorkService } from '../services/maintenance-work.service';

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
    private readonly logger = new Logger(GlobalExceptionFilter.name);

    constructor(
        private readonly httpAdapterHost: HttpAdapterHost,
        private readonly errorLogger: ErrorLoggerService,
        private readonly work: MaintenanceWorkService,
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

        const isHttpException = exception instanceof HttpException;
        const message =
            isHttpException
                ? exception.getResponse()
                : 'Internal server error';

        const structuredMessage =
            typeof message === 'object' && message !== null
                ? (message as Record<string, unknown>)
                : null;
        const responseCode =
            typeof structuredMessage?.code === 'string' &&
                /^[A-Z][A-Z0-9_]{1,63}$/.test(structuredMessage.code)
                ? structuredMessage.code
                : null;
        const responseMessageArray =
            Array.isArray(structuredMessage?.message) &&
                structuredMessage.message.length > 0 &&
                structuredMessage.message.every((item) => typeof item === 'string')
                ? [...structuredMessage.message]
                : null;
        const responseMessage =
            !isHttpException
                ? 'Internal server error'
                : typeof structuredMessage?.message === 'string'
                ? structuredMessage.message
                : responseMessageArray
                    ? responseMessageArray
                : typeof message === 'string'
                    ? message
                    : 'Internal server error';
        const responseError =
            typeof structuredMessage?.error === 'string'
                ? structuredMessage.error
                : null;

        const rawRequestUrl = httpAdapter.getRequestUrl(request);
        const responsePath =
            typeof rawRequestUrl === 'string'
                ? rawRequestUrl.split(/[?#]/, 1)[0] || '/'
                : '/';
        const responseBody = {
            statusCode: httpStatus,
            timestamp: new Date().toISOString(),
            path: responsePath,
            message: responseMessage,
            error: responseError,
            ...(responseCode ? { code: responseCode } : {}),
        };
        const auditMessage = Array.isArray(responseMessage)
            ? responseMessage.join('; ')
            : responseMessage;
        const sanitizedError = {
            message: isHttpException
                ? `HTTP exception (${httpStatus})`
                : 'Unhandled application error',
        };

        // Log the error using the centralized service (persists to AuditLog)
        try {
            const operation = () => this.errorLogger.logError({
                action: 'api_exception',
                message: auditMessage,
                error: sanitizedError,
                actorId: request.user?.id,
                entityType: 'API',
                metadata: {
                    path: responseBody.path,
                    method: request.method,
                    statusCode: httpStatus
                }
            });
            // Nest does not await custom filter promises; reserve before awaiting IO.
            const parent = this.work.currentLease();
            await (parent
                ? this.work.runChild(parent, 'http.exception-audit', operation)
                : this.work.runRoot('http.exception-audit', operation));
        } catch {
            // If logging to DB fails, still log to console but don't crash the response
            this.logger.error('Failed to log error to AuditLog');
        }

        if (response.destroyed || response.writableEnded) return;
        httpAdapter.reply(response, responseBody, httpStatus);
    }
}
