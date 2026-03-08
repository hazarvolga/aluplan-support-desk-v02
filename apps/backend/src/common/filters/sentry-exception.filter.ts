import { Catch, ArgumentsHost, HttpException, HttpStatus } from '@nestjs/common';
import { BaseExceptionFilter } from '@nestjs/core';
import * as Sentry from '@sentry/nestjs';

@Catch()
export class SentryExceptionFilter extends BaseExceptionFilter {
    catch(exception: unknown, host: ArgumentsHost) {
        // Report only internal server errors or unhandled exceptions to Sentry.
        // Client errors (4xx) are generally filtered out unless customized.
        const isHttpException = exception instanceof HttpException;
        const status = isHttpException ? exception.getStatus() : HttpStatus.INTERNAL_SERVER_ERROR;

        if (status >= 500) {
            Sentry.captureException(exception);
        }

        super.catch(exception, host);
    }
}
